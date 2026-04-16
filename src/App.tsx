import React, {memo, startTransition, useEffect, useMemo, useRef, useState} from 'react';
import {motion} from 'motion/react';

type ReleaseRecord = {
  name: string;
  date: string;
};

type LabRecord = {
  name: string;
  accent: string;
  releases: ReleaseRecord[];
};

type ProcessedRelease = ReleaseRecord & {
  dateLabel: string;
  globalDay: number;
  gap: number;
};

type ProcessedLab = LabRecord & {
  averageGap: number | null;
  latestRelease: ProcessedRelease | null;
  releases: ProcessedRelease[];
  startDay: number;
  totalSpan: number;
};

type Tick = {
  days: number;
  label: string | number;
};

const DAY_MS = 1000 * 60 * 60 * 24;
const START_DATE = new Date('2022-11-30T00:00:00Z');
const LABEL_RAIL_WIDTH = 220;

const labs: LabRecord[] = [
  {
    name: 'OpenAI (GPT)',
    accent: '#139a74',
    releases: [
      {name: 'GPT-3.5', date: '2022-11-30'},
      {name: 'GPT-4', date: '2023-03-14'},
      {name: 'GPT-4 Turbo', date: '2023-11-06'},
      {name: 'GPT-4o', date: '2024-05-13'},
      {name: 'o1', date: '2024-12-05'},
      {name: 'o3', date: '2025-04-16'},
      {name: 'GPT-5', date: '2025-08-07'},
      {name: 'GPT-5.1', date: '2025-11-12'},
      {name: 'GPT-5.2', date: '2025-12-11'},
      {name: 'GPT-5.3', date: '2026-02-05'},
      {name: 'GPT-5.4', date: '2026-03-05'},
    ],
  },
  {
    name: 'Anthropic (Claude)',
    accent: '#d38b14',
    releases: [
      {name: 'Claude 1', date: '2023-03-14'},
      {name: 'Claude 2', date: '2023-07-11'},
      {name: 'Claude 3', date: '2024-03-04'},
      {name: 'Claude 3.5', date: '2024-06-20'},
      {name: 'Claude 3.7', date: '2025-02-24'},
      {name: 'Claude 4', date: '2025-05-22'},
      {name: 'Claude 4.5 Sonnet', date: '2025-09-29'},
      {name: 'Claude 4.5 Opus', date: '2025-11-24'},
      {name: 'Claude 4.6 Sonnet', date: '2026-02-17'},
      {name: 'Claude 4.6 Opus', date: '2026-02-05'},
      {name: 'Claude 4.7 Opus', date: '2026-04-16'},
    ],
  },
  {
    name: 'Google (Gemini)',
    accent: '#2d6ed8',
    releases: [
      {name: 'Gemini 1.0', date: '2023-12-06'},
      {name: 'Gemini 1.5', date: '2024-02-15'},
      {name: 'Gemini 2.0', date: '2025-02-05'},
      {name: 'Gemini 2.5', date: '2025-03-25'},
      {name: 'Gemini 3.0 Pro', date: '2025-11-18'},
      {name: 'Gemini 3.1 Pro (Preview)', date: '2026-02-19'},
      {name: 'Gemini 3.1 Flash-Image', date: '2026-02-26'},
      {name: 'Gemini 3.1 Flash-Lite', date: '2026-03-03'},
    ],
  },
  {
    name: 'xAI (Grok)',
    accent: '#777f90',
    releases: [
      {name: 'Grok 1', date: '2023-11-04'},
      {name: 'Grok 1.5', date: '2024-03-28'},
      {name: 'Grok 2', date: '2024-08-13'},
      {name: 'Grok 3', date: '2025-02-17'},
      {name: 'Grok 4', date: '2025-07-09'},
      {name: 'Grok 4.1', date: '2025-11-17'},
      {name: 'Grok 4.20', date: '2026-02-17'},
    ],
  },
];

function parseUtcDate(input: string) {
  return new Date(`${input}T00:00:00Z`);
}

function formatUtcDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    ...options,
  });
}

function mixHexColor(hexColor: string, targetChannel: number, amount: number) {
  const normalized = hexColor.replace('#', '');
  const expanded = normalized.length === 3 ? normalized.split('').map((value) => `${value}${value}`).join('') : normalized;
  const safeAmount = Math.max(0, Math.min(1, amount));

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return hexColor;
  }

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  const mixChannel = (channel: number) => Math.round(channel + (targetChannel - channel) * safeAmount);

  return `rgb(${mixChannel(red)} ${mixChannel(green)} ${mixChannel(blue)})`;
}

function toRgbaFromHex(hexColor: string, alpha: number) {
  const normalized = hexColor.replace('#', '');
  const expanded = normalized.length === 3 ? normalized.split('').map((value) => `${value}${value}`).join('') : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildTimelineData(data: LabRecord[]) {
  const invalidEntries: string[] = [];

  const processedLabs = data.map<ProcessedLab>((lab) => {
    const sortedReleases = [...lab.releases].sort((left, right) => {
      const leftDate = parseUtcDate(left.date).getTime();
      const rightDate = parseUtcDate(right.date).getTime();
      return leftDate - rightDate || left.name.localeCompare(right.name);
    });

    const processedReleases = sortedReleases.reduce<ProcessedRelease[]>((collection, release, index) => {
      const releaseDate = parseUtcDate(release.date);

      if (Number.isNaN(releaseDate.getTime())) {
        invalidEntries.push(`${lab.name}: ${release.name}`);
        return collection;
      }

      const previousRelease = collection[index - 1];
      const globalDay = Math.round((releaseDate.getTime() - START_DATE.getTime()) / DAY_MS);
      const gap = previousRelease ? globalDay - previousRelease.globalDay : 0;

      collection.push({
        ...release,
        dateLabel: formatUtcDate(releaseDate, {month: 'short', day: 'numeric', year: 'numeric'}),
        globalDay,
        gap,
      });

      return collection;
    }, []);

    const latestRelease = processedReleases[processedReleases.length - 1] ?? null;
    const totalGap = processedReleases.reduce((sum, release) => sum + release.gap, 0);
    const averageGap = processedReleases.length > 1 ? Math.round(totalGap / (processedReleases.length - 1)) : null;
    const firstRelease = processedReleases[0];

    return {
      ...lab,
      averageGap,
      latestRelease,
      releases: processedReleases,
      startDay: firstRelease?.globalDay ?? 0,
      totalSpan: latestRelease && firstRelease ? latestRelease.globalDay - firstRelease.globalDay : 0,
    };
  });

  const latestGlobalDay = processedLabs.reduce((max, lab) => {
    const currentLatestDay = lab.latestRelease?.globalDay ?? 0;
    return Math.max(max, currentLatestDay);
  }, 0);

  const totalReleases = processedLabs.reduce((sum, lab) => sum + lab.releases.length, 0);

  return {
    invalidEntries,
    latestGlobalDay,
    processedLabs,
    totalReleases,
  };
}

function buildTicks(maxDays: number) {
  const monthTicks: Tick[] = [];
  const yearTicks: Tick[] = [];
  const endDate = new Date(START_DATE.getTime() + maxDays * DAY_MS);
  const cursor = new Date('2022-12-01T00:00:00Z');

  while (cursor <= endDate) {
    const days = Math.round((cursor.getTime() - START_DATE.getTime()) / DAY_MS);

    if (cursor.getUTCMonth() === 0) {
      yearTicks.push({days, label: cursor.getUTCFullYear()});
    } else {
      monthTicks.push({
        days,
        label: formatUtcDate(cursor, {month: 'short'}),
      });
    }

    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return {monthTicks, yearTicks};
}

const SignalPulse = memo(function SignalPulse({className = 'text-emerald-400'}: {className?: string}) {
  return (
    <span className={`relative flex h-2.5 w-2.5 ${className}`} aria-hidden="true">
      <span className="signal-pulse-ring absolute inset-0 rounded-full border border-current" />
      <span className="signal-pulse-ring signal-pulse-ring-delay absolute inset-0 rounded-full border border-current" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
    </span>
  );
});

function ZoomInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M11 5v12" strokeLinecap="round" />
      <path d="M5 11h12" strokeLinecap="round" />
      <path d="M20 20l-4.2-4.2" strokeLinecap="round" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function ZoomOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 11h12" strokeLinecap="round" />
      <path d="M20 20l-4.2-4.2" strokeLinecap="round" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function ResetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 12a9 9 0 1 0 3.1-6.8" strokeLinecap="round" />
      <path d="M3 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DragIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 6l-4 6 4 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6l4 6-4 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12h16" strokeLinecap="round" />
    </svg>
  );
}

function SurfaceButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--edge)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--ink-soft)] shadow-[var(--soft-shadow)] transition duration-300 hover:-translate-y-[1px] hover:border-[var(--edge-strong)] hover:bg-[var(--surface-strong)] active:translate-y-0 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function LabRailItem({lab}: {lab: ProcessedLab}) {
  return (
    <div className="flex h-[4.5rem] items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 items-center justify-center rounded-full" style={{color: lab.accent}}>
            <SignalPulse className="text-inherit" />
          </span>
          <p className="truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{lab.name}</p>
        </div>
      </div>
    </div>
  );
}

function StateScreen({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <div className="min-h-[100dvh] bg-[var(--page-bg)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[880px] items-center px-5 py-10 md:px-8">
        <div className="rounded-[2rem] border border-[var(--edge)] bg-[var(--surface)] p-8 shadow-[var(--panel-shadow)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Timeline status</p>
          <h1 className="mt-4 text-4xl tracking-tighter text-[var(--ink)]">{title}</h1>
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-[var(--ink-soft)]">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[var(--page-bg)] text-[var(--ink)]">
      <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-8 md:px-8 md:pt-10">
        <div className="grid animate-pulse gap-10 lg:grid-cols-[minmax(0,1.18fr)_360px] lg:items-end">
          <div className="space-y-6">
            <div className="h-10 w-44 rounded-full bg-[var(--surface)] shadow-[var(--soft-shadow)]" />
            <div className="space-y-4">
              <div className="h-16 max-w-[720px] rounded-[1.75rem] bg-[var(--surface)] shadow-[var(--soft-shadow)]" />
              <div className="h-6 max-w-[620px] rounded-full bg-[var(--surface)] shadow-[var(--soft-shadow)]" />
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_280px]">
              <div className="h-32 rounded-[2rem] bg-[var(--surface)] shadow-[var(--soft-shadow)]" />
              <div className="h-32 rounded-[2rem] bg-[var(--surface)] shadow-[var(--soft-shadow)]" />
            </div>
          </div>
          <div className="h-[360px] rounded-[2rem] bg-[var(--surface)] shadow-[var(--soft-shadow)]" />
        </div>

        <div className="mt-10 overflow-hidden rounded-[2.4rem] border border-[var(--edge)] bg-[var(--surface)] p-6 shadow-[var(--panel-shadow)] backdrop-blur-xl">
          <div className="flex animate-pulse flex-col gap-6">
            <div className="flex justify-between gap-4">
              <div className="h-8 w-80 rounded-full bg-[var(--surface-strong)]" />
              <div className="h-11 w-44 rounded-full bg-[var(--surface-strong)]" />
            </div>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="relative h-[4.5rem] rounded-[1.25rem] bg-[var(--surface-strong)]">
                <div className="absolute inset-y-1/2 left-12 right-12 h-px -translate-y-1/2 bg-[var(--edge)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasPositionedInitialView = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const panStateRef = useRef({startScrollLeft: 0, startX: 0});

  const timelineData = useMemo(() => buildTimelineData(labs), []);
  const today = new Date();
  const currentGlobalDay = (today.getTime() - START_DATE.getTime()) / DAY_MS;
  const maxDays = Math.max(Math.ceil(currentGlobalDay) + 36, timelineData.latestGlobalDay + 36, 720);
  const timelineWidth = Math.max(1320, Math.round(maxDays * 2.24 * zoom));
  const {monthTicks, yearTicks} = useMemo(() => buildTicks(maxDays), [maxDays]);

  const latestLab = useMemo(() => {
    return [...timelineData.processedLabs]
      .filter((lab) => lab.latestRelease)
      .sort((left, right) => (right.latestRelease?.globalDay ?? 0) - (left.latestRelease?.globalDay ?? 0))[0] ?? null;
  }, [timelineData.processedLabs]);

  const summaryLabs = useMemo(() => {
    return [...timelineData.processedLabs].sort((left, right) => {
      return (right.latestRelease?.globalDay ?? 0) - (left.latestRelease?.globalDay ?? 0);
    });
  }, [timelineData.processedLabs]);

  const maxSummaryQuietDays = useMemo(() => {
    return summaryLabs.reduce((max, lab) => {
      const quietDays = lab.latestRelease ? Math.max(0, Math.floor(currentGlobalDay - lab.latestRelease.globalDay)) : 0;
      return Math.max(max, quietDays);
    }, 0);
  }, [currentGlobalDay, summaryLabs]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsReady(true), 120);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (hasPositionedInitialView.current || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const dayOffset = LABEL_RAIL_WIDTH + (currentGlobalDay / maxDays) * timelineWidth;
    container.scrollLeft = Math.max(0, dayOffset - container.clientWidth * 0.68);
    hasPositionedInitialView.current = true;
  }, [currentGlobalDay, maxDays, timelineWidth]);

  const handleZoomChange = (updater: (zoomLevel: number) => number) => {
    const container = scrollContainerRef.current;
    const centerRatio = container ? (container.scrollLeft + container.clientWidth / 2) / container.scrollWidth : null;

    startTransition(() => {
      setZoom((previousZoom) => {
        const nextZoom = Number(updater(previousZoom).toFixed(2));

        if (nextZoom === previousZoom) {
          return previousZoom;
        }

        if (centerRatio !== null) {
          requestAnimationFrame(() => {
            if (!scrollContainerRef.current) {
              return;
            }

            scrollContainerRef.current.scrollLeft =
              centerRatio * scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth / 2;
          });
        }

        return nextZoom;
      });
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    activePointerIdRef.current = event.pointerId;
    panStateRef.current = {
      startScrollLeft: container.scrollLeft,
      startX: event.clientX,
    };

    container.setPointerCapture(event.pointerId);
    setIsPanning(true);
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerIdRef.current || !scrollContainerRef.current) {
      return;
    }

    const deltaX = event.clientX - panStateRef.current.startX;
    scrollContainerRef.current.scrollLeft = panStateRef.current.startScrollLeft - deltaX;
  };

  const stopPanning = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerIdRef.current || !scrollContainerRef.current) {
      return;
    }

    if (scrollContainerRef.current.hasPointerCapture(event.pointerId)) {
      scrollContainerRef.current.releasePointerCapture(event.pointerId);
    }

    activePointerIdRef.current = null;
    setIsPanning(false);
  };

  if (labs.length === 0) {
    return (
      <StateScreen
        title="Timeline data is missing"
        detail="The page has no lab data to render. Add at least one provider with release dates before rendering the timeline."
      />
    );
  }

  if (timelineData.invalidEntries.length > 0) {
    return (
      <StateScreen
        title="Timeline data needs cleanup"
        detail={`Some releases could not be parsed as UTC dates: ${timelineData.invalidEntries.join(', ')}`}
      />
    );
  }

  if (!isReady) {
    return <TimelineSkeleton />;
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--page-bg)] text-[var(--ink)] selection:bg-emerald-500/25 selection:text-[var(--ink)]">
      <section className="mx-auto max-w-[1480px] px-5 pb-6 pt-8 md:px-8 md:pt-10">
        <motion.div
          initial={{opacity: 0, y: 26}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
          className="space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-end">
            <div className="space-y-5">
              <h1 className="max-w-5xl text-4xl leading-none tracking-tighter text-[var(--ink)] md:text-6xl">
                AI model launches, arranged as one continuous race.
              </h1>
              <p className="max-w-[68ch] text-base leading-relaxed text-[var(--ink-soft)] md:text-lg">
                Compare the cadence of OpenAI, Anthropic, Google, and xAI on one horizontal field. Every node marks a
                release, every segment shows the gap, and the live marker makes it obvious who has gone quiet.
              </p>
            </div>

            <div className="border-l border-[var(--edge-strong)] pl-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Reading notes</p>
              <p className="mt-4 max-w-[42ch] text-sm leading-7 text-[var(--ink-soft)]">
                Zoom into dense stretches, drag the field to travel, and read the dashed extensions as time since each
                lab&apos;s latest release. Dates stay absolute, so concurrency and dry spells remain legible.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[1540px] px-5 pb-8 md:px-8">
        <motion.section
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.9, delay: 0.14, ease: [0.22, 1, 0.36, 1]}}
          className="overflow-hidden rounded-[2.4rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--panel-shadow)] backdrop-blur-xl"
        >
          <div className="border-b border-[var(--edge)] px-5 py-5 md:px-7">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Timeline field</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1.5 shadow-[var(--soft-shadow)]">
                    <DragIcon className="h-4 w-4" />
                    Click and drag horizontally on desktop
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:justify-self-end">
                <SurfaceButton label="Zoom out" onClick={() => handleZoomChange((current) => Math.max(current - 0.35, 0.7))}>
                  <ZoomOutIcon className="h-4 w-4" />
                </SurfaceButton>

                <div className="inline-flex h-11 min-w-20 items-center justify-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-4 font-mono text-sm text-[var(--ink-soft)] shadow-[var(--soft-shadow)]">
                  {Math.round(zoom * 100)}%
                </div>

                <SurfaceButton label="Zoom in" onClick={() => handleZoomChange((current) => Math.min(current + 0.35, 4))}>
                  <ZoomInIcon className="h-4 w-4" />
                </SurfaceButton>

                <SurfaceButton label="Reset zoom" onClick={() => handleZoomChange(() => 1)}>
                  <ResetIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </SurfaceButton>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[220px] border-r border-[var(--edge)] bg-[linear-gradient(90deg,rgba(11,14,20,0.98)_0%,rgba(11,14,20,0.95)_72%,rgba(11,14,20,0)_100%)]">
              <div className="px-5 pb-14 pt-24">
                <div className="flex flex-col gap-11">
                  {timelineData.processedLabs.map((lab) => (
                    <React.Fragment key={lab.name}>
                      <LabRailItem lab={lab} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className={`relative overflow-x-auto overflow-y-hidden pb-8 [scrollbar-gutter:stable] ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopPanning}
              onPointerCancel={stopPanning}
            >
              <div className="relative" style={{minWidth: `${timelineWidth + LABEL_RAIL_WIDTH}px`}}>
                <div style={{paddingLeft: `${LABEL_RAIL_WIDTH}px`}}>
                  <div className="relative pb-14" style={{width: `${timelineWidth}px`}}>
                    <div className="pointer-events-none absolute inset-0">
                      {monthTicks.map((tick) => (
                        <div
                          key={`month-${tick.days}`}
                          className="absolute bottom-0 top-0 border-l border-[var(--grid-line)]"
                          style={{left: `${(tick.days / maxDays) * 100}%`}}
                        >
                          <div className="absolute left-0 top-10 -translate-x-1/2 rounded-full bg-[var(--surface-strong)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted)] shadow-[var(--soft-shadow)]">
                            {tick.label}
                          </div>
                        </div>
                      ))}

                      {yearTicks.map((tick) => (
                        <div
                          key={`year-${tick.label}`}
                          className="absolute bottom-0 top-0 border-l-2 border-[var(--grid-line-strong)]"
                          style={{left: `${(tick.days / maxDays) * 100}%`}}
                        >
                          <div className="absolute left-0 top-2 -translate-x-1/2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)]">
                            {tick.label}
                          </div>
                        </div>
                      ))}

                      <div
                        className="absolute bottom-0 top-0 border-l-2 border-[var(--today-line)]"
                        style={{left: `${(currentGlobalDay / maxDays) * 100}%`}}
                      >
                        <div className="absolute left-0 top-1 -translate-x-1/2">
                          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
                            Today
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex flex-col gap-11 pb-14 pt-24">
                      {timelineData.processedLabs.map((lab, labIndex) => (
                        <div key={lab.name} className="relative h-[4.5rem]">
                          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--track-line)]" />

                          {lab.releases.map((release, releaseIndex) => {
                            const previousRelease = lab.releases[releaseIndex - 1];
                            const leftPercent = (release.globalDay / maxDays) * 100;
                            const previousPercent = previousRelease ? (previousRelease.globalDay / maxDays) * 100 : leftPercent;
                            const widthPercent = previousRelease ? leftPercent - previousPercent : 0;
                            const delay = labIndex * 0.12 + releaseIndex * 0.08;
                            const isLatestInLab =
                              lab.latestRelease?.name === release.name && lab.latestRelease?.date === release.date;
                            const labelTextColor = isLatestInLab ? mixHexColor(lab.accent, 255, 0.12) : mixHexColor(lab.accent, 255, 0.24);
                            const labelBorderColor = toRgbaFromHex(lab.accent, isLatestInLab ? 0.52 : 0.34);
                            const labelBackground = isLatestInLab ? toRgbaFromHex(lab.accent, 0.12) : undefined;

                            return (
                              <React.Fragment key={`${lab.name}-${release.name}`}>
                                {previousRelease ? (
                                  <motion.div
                                    initial={{opacity: 0, scaleX: 0}}
                                    animate={{opacity: 0.58, scaleX: 1}}
                                    transition={{delay, duration: 0.72, ease: [0.22, 1, 0.36, 1]}}
                                    className="absolute top-1/2 h-[2px] -translate-y-1/2 origin-left"
                                    style={{
                                      backgroundColor: lab.accent,
                                      left: `${previousPercent}%`,
                                      width: `${widthPercent}%`,
                                    }}
                                  >
                                    <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2 py-1 text-[10px] font-mono text-[var(--muted)] shadow-[var(--soft-shadow)]">
                                      {release.gap}d
                                    </div>
                                  </motion.div>
                                ) : null}

                                <motion.div
                                  initial={{opacity: 0, scale: 0.75, y: 10}}
                                  animate={{opacity: 1, scale: 1, y: 0}}
                                  transition={{delay: delay + 0.1, duration: 0.48, type: 'spring', stiffness: 120, damping: 18}}
                                  className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                                  style={{left: `${leftPercent}%`}}
                                >
                                  <div className="group relative cursor-default">
                                    <div
                                      className="h-4 w-4 rounded-full border-[3px] border-[var(--surface-strong)] transition duration-300 group-hover:scale-[1.22]"
                                      style={{
                                        backgroundColor: lab.accent,
                                        boxShadow: isLatestInLab
                                          ? `0 0 0 5px color-mix(in srgb, ${lab.accent} 20%, transparent), 0 0 18px color-mix(in srgb, ${lab.accent} 42%, transparent)`
                                          : `0 0 0 4px color-mix(in srgb, ${lab.accent} 12%, transparent)`,
                                        filter: isLatestInLab ? 'saturate(1.35) brightness(1.08)' : undefined,
                                      }}
                                    />

                                    <div
                                      className="absolute left-4 top-0 origin-bottom-left -translate-y-2 -rotate-[28deg] whitespace-nowrap rounded-[0.8rem] border bg-[var(--surface-strong)] px-2 py-1 text-[12px] font-bold tracking-[0.015em] shadow-[var(--soft-shadow)] backdrop-blur-sm transition duration-300 group-hover:-translate-y-3 group-hover:bg-[var(--surface)]"
                                      style={{
                                        backgroundColor: labelBackground,
                                        borderColor: labelBorderColor,
                                        color: labelTextColor,
                                        textShadow: isLatestInLab ? '0 1px 12px rgba(0, 0, 0, 0.5)' : '0 1px 10px rgba(0, 0, 0, 0.38)',
                                        filter: isLatestInLab ? 'saturate(1.18)' : undefined,
                                      }}
                                    >
                                      {release.name}
                                    </div>

                                    <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 opacity-0 transition duration-300 group-hover:opacity-100">
                                      <div className="rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--ink)] shadow-[0_18px_38px_-24px_rgba(0,0,0,0.5)]">
                                        {release.dateLabel}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </React.Fragment>
                            );
                          })}

                          {lab.latestRelease && currentGlobalDay > lab.latestRelease.globalDay ? (
                            <>
                              <motion.div
                                initial={{opacity: 0, scaleX: 0}}
                                animate={{opacity: 0.42, scaleX: 1}}
                                transition={{
                                  delay: labIndex * 0.16 + lab.releases.length * 0.09,
                                  duration: 0.8,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className="absolute top-1/2 border-t-2 border-dashed -translate-y-1/2 origin-left"
                                style={{
                                  borderColor: lab.accent,
                                  left: `${(lab.latestRelease.globalDay / maxDays) * 100}%`,
                                  width: `${((currentGlobalDay - lab.latestRelease.globalDay) / maxDays) * 100}%`,
                                }}
                              />

                              <div
                                className="absolute top-1/2 z-0 -translate-y-1/2 pl-3"
                                style={{left: `${(currentGlobalDay / maxDays) * 100}%`}}
                              >
                                <div className="rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)]">
                                  +{Math.floor(currentGlobalDay - lab.latestRelease.globalDay)}d
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </section>

      <section className="mx-auto max-w-[1540px] px-5 pb-16 md:px-8 md:pb-20">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1]}}
          className="space-y-4"
        >
          <div className="grid gap-4 text-sm text-[var(--muted)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <p className="max-w-[68ch] leading-relaxed">
              Latest lab on the board: <span className="font-semibold text-[var(--ink)]">{latestLab?.name ?? 'n/a'}</span>
              {' '}with <span className="font-semibold text-[var(--ink)]">{latestLab?.latestRelease?.name ?? 'n/a'}</span>.
            </p>
            <p className="font-mono uppercase tracking-[0.14em]">All dates rendered in UTC</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryLabs.map((lab, index) => {
              const quietDays = lab.latestRelease ? Math.max(0, Math.floor(currentGlobalDay - lab.latestRelease.globalDay)) : 0;
              const fillWidth = maxSummaryQuietDays === 0 ? 100 : Math.max(0, Math.round((1 - quietDays / maxSummaryQuietDays) * 100));

              return (
                <motion.div
                  key={lab.name}
                  initial={{opacity: 0, y: 18}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.2 + index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1]}}
                  className="rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: lab.accent}} />
                        <p className="truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{lab.name}</p>
                      </div>
                      <p className="mt-2 truncate text-sm text-[var(--ink-soft)]">
                        {lab.latestRelease?.name ?? 'No releases'}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                        {lab.latestRelease?.dateLabel ?? 'Date unavailable'}
                      </p>
                    </div>
                    <div className="rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1 font-mono text-[11px] text-[var(--ink-soft)]">
                      +{quietDays}d
                    </div>
                  </div>

                  <div className="mt-4 h-1.5 rounded-full bg-[var(--edge)]">
                    <div
                      className="h-full rounded-full origin-left"
                      style={{backgroundColor: lab.accent, width: `${fillWidth}%`}}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
