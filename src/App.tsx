import React, {startTransition, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Box,
  Bot,
  BrainCircuit,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  Clapperboard,
  Code2,
  ExternalLink,
  Globe2,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {
  companies,
  DEFAULT_PRESET_ID,
  DEFAULT_SELECTED_PRESET_IDS,
  formatTimelineDate,
  formatTimelineDateRange,
  getReleaseEventType,
  getReleaseSlug,
  modelPresets,
  parseTimelineDate,
  presetGroups,
} from './data/timeline';
import {modelReleaseIndexBySlug} from './data/releaseIndex';
import type {
  ArticleMedia,
  ArticleLogoMark,
  CompanyRecord,
  ModelClassId,
  ModelLogo,
  ModelReleaseIndexEntry,
  PresetId,
  ProcessedCompany,
  ProcessedProductLine,
  ProcessedRelease,
  ProductMarkerShape,
  ProductLineRecord,
  ReleaseRecord,
} from './data/types';

type BoardView = {
  description: string;
  isComposite: boolean;
  isDefault: boolean;
  isEmpty: boolean;
  label: string;
};

type Tick = {
  days: number;
  label: string | number;
};

const DAY_MS = 1000 * 60 * 60 * 24;
const START_DATE = new Date('2020-01-01T00:00:00Z');
const TIMELINE_PIXELS_PER_DAY = 2.24;
const LABEL_RAIL_WIDTH = 320;
const MOBILE_LABEL_RAIL_WIDTH = 196;
const PAGE_BACKGROUND_HEX = '#05070b';
const DESKTOP_COMPANY_MIN_HEIGHT = 72;
const MOBILE_COMPANY_MIN_HEIGHT = 80;
const DESKTOP_PRODUCT_LINE_HEIGHT = 56;
const MOBILE_PRODUCT_LINE_HEIGHT = 60;
const PRODUCT_LINE_GAP = 8;
const DEFAULT_DESKTOP_ZOOM = 1;
const DEFAULT_MOBILE_ZOOM = 1.05;
const DESKTOP_MAX_ZOOM = 4;
const MOBILE_MAX_ZOOM = 3.4;
const ZOOM_PROGRESS_STEP = 0.12;
const SIGMOID_STEEPNESS = 6;
const FIT_BUFFER_MULTIPLIER = 0.92;
const WHEEL_ZOOM_PROGRESS_PER_PIXEL = 0.001;
const ZOOM_SLIDER_KEYBOARD_STEP = 0.04;

const ARTICLE_LOGO_ASSET_PATHS: Partial<Record<ArticleLogoMark, string>> = {
  anthropic: 'logos/anthropic.svg',
  figure: 'logos/figure.svg',
  google: 'logos/google.svg',
  openai: 'logos/openai.svg',
  tesla: 'logos/tesla.svg',
  xai: 'logos/xai.svg',
};

const WIDE_ARTICLE_LOGO_MARKS = new Set<ArticleLogoMark>(['figure']);

function isWideArticleLogoMark(mark: ArticleLogoMark | undefined) {
  return mark ? WIDE_ARTICLE_LOGO_MARKS.has(mark) : false;
}

function getPublicAssetPath(path: string) {
  const basePath = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${basePath}${path.replace(/^\/+/, '')}`;
}

type AppRoute = {
  kind: 'timeline';
} | {
  kind: 'model';
  slug: string;
};

function parseAppRoute(hash: string): AppRoute {
  const normalizedHash = hash.replace(/^#\/?/, '');

  if (!normalizedHash) {
    return {kind: 'timeline'};
  }

  const modelMatch = normalizedHash.match(/^(?:models|events)\/([^/?#]+)$/);

  if (modelMatch) {
    return {kind: 'model', slug: decodeURIComponent(modelMatch[1])};
  }

  return {kind: 'timeline'};
}

function getCurrentAppRoute(): AppRoute {
  if (typeof window === 'undefined') {
    return {kind: 'timeline'};
  }

  return parseAppRoute(window.location.hash);
}

function navigateToTimeline() {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.hash = '#/';
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

function mixHexColors(sourceHexColor: string, targetHexColor: string, amount: number) {
  const normalize = (hexColor: string) => {
    const normalized = hexColor.replace('#', '');

    return normalized.length === 3 ? normalized.split('').map((value) => `${value}${value}`).join('') : normalized;
  };
  const source = normalize(sourceHexColor);
  const target = normalize(targetHexColor);
  const safeAmount = Math.max(0, Math.min(1, amount));

  if (!/^[0-9a-fA-F]{6}$/.test(source) || !/^[0-9a-fA-F]{6}$/.test(target)) {
    return sourceHexColor;
  }

  const sourceChannels = [source.slice(0, 2), source.slice(2, 4), source.slice(4, 6)].map((value) =>
    Number.parseInt(value, 16),
  );
  const targetChannels = [target.slice(0, 2), target.slice(2, 4), target.slice(4, 6)].map((value) =>
    Number.parseInt(value, 16),
  );
  const [red, green, blue] = sourceChannels.map((channel, index) =>
    Math.round(channel + (targetChannels[index] - channel) * safeAmount),
  );

  return `rgb(${red} ${green} ${blue})`;
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

function getProductLineClasses(company: CompanyRecord, productLine: ProductLineRecord): ModelClassId[] {
  return productLine.defaultClasses ?? company.defaultClasses ?? [productLine.classId];
}

function getProductLinePresets(company: CompanyRecord, productLine: ProductLineRecord): PresetId[] {
  return productLine.defaultPresets ?? company.defaultPresets;
}

function getReleaseClasses(
  company: CompanyRecord,
  productLine: ProductLineRecord,
  release: ReleaseRecord,
): ModelClassId[] {
  return release.classes ?? getProductLineClasses(company, productLine);
}

function getReleasePresets(
  company: CompanyRecord,
  productLine: ProductLineRecord,
  release: ReleaseRecord,
): PresetId[] {
  return release.presets ?? getProductLinePresets(company, productLine);
}

function getBoardView(selectedPresetIds: PresetId[]): BoardView {
  const selectedPresets = modelPresets.filter((preset) => selectedPresetIds.includes(preset.id));

  if (selectedPresets.length === 0) {
    return {
      description: 'No product lines are currently selected.',
      isComposite: true,
      isDefault: false,
      isEmpty: true,
      label: 'No lines selected',
    };
  }

  if (selectedPresets.length === 1) {
    const preset = selectedPresets[0];

    return {
      description: preset.description,
      isComposite: false,
      isDefault: preset.id === DEFAULT_PRESET_ID,
      isEmpty: false,
      label: preset.label,
    };
  }

  if (selectedPresets.length === modelPresets.length) {
    return {
      description: 'Every tracked model, coding, creative, events, robotics, and vehicle-autonomy line is visible.',
      isComposite: true,
      isDefault: false,
      isEmpty: false,
      label: 'All lines selected',
    };
  }

  return {
    description: selectedPresets.map((preset) => preset.label).join(', '),
    isComposite: true,
    isDefault: false,
    isEmpty: false,
    label: `${selectedPresets.length} lines selected`,
  };
}

function getVisibleCompanies(data: CompanyRecord[], selectedPresetIds: PresetId[]) {
  if (selectedPresetIds.length === 0) {
    return [];
  }

  return data
    .map<CompanyRecord>((company) => ({
      ...company,
      productLines: company.productLines
        .map<ProductLineRecord>((productLine) => ({
          ...productLine,
          releases: productLine.releases.filter((release) => {
            const releasePresets = getReleasePresets(company, productLine, release);
            return selectedPresetIds.some((presetId) => releasePresets.includes(presetId));
          }),
        }))
        .filter((productLine) => productLine.releases.length > 0),
    }))
    .filter((company) => company.productLines.length > 0);
}

function buildPresetStats(data: CompanyRecord[]) {
  return modelPresets.reduce<Record<PresetId, {providerCount: number; releaseCount: number}>>((stats, preset) => {
    const visibleCompanies = getVisibleCompanies(data, [preset.id]);

    stats[preset.id] = {
      providerCount: visibleCompanies.length,
      releaseCount: visibleCompanies.reduce(
        (sum, company) => sum + company.productLines.reduce((lineSum, productLine) => lineSum + productLine.releases.length, 0),
        0,
      ),
    };

    return stats;
  }, {} as Record<PresetId, {providerCount: number; releaseCount: number}>);
}

function getPrimaryCompanyClass(company: Pick<CompanyRecord, 'defaultClasses' | 'productLines'>): ModelClassId {
  return company.productLines[0]?.classId ?? company.defaultClasses[0] ?? 'frontier-llms';
}

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);

  if (item === undefined) {
    return items;
  }

  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

function getCanonicalCompanyOrderIds(companyOrderIds: string[]) {
  const knownIds = new Set(companies.map((company) => company.id));
  const orderedIds = companyOrderIds.filter((companyId) => knownIds.has(companyId));
  const orderedIdSet = new Set(orderedIds);
  const newCompanyIds = companies.map((company) => company.id).filter((companyId) => !orderedIdSet.has(companyId));

  return [...orderedIds, ...newCompanyIds];
}

function orderCompanies(data: CompanyRecord[], companyOrderIds: string[], hiddenCompanyIds: string[]) {
  const companyById = new Map(data.map((company) => [company.id, company]));
  const hiddenCompanyIdSet = new Set(hiddenCompanyIds);
  const orderedCompanies = getCanonicalCompanyOrderIds(companyOrderIds)
    .map((companyId) => companyById.get(companyId))
    .filter((company): company is CompanyRecord => Boolean(company));
  const orderedCompanyIdSet = new Set(orderedCompanies.map((company) => company.id));
  const newCompanies = data.filter((company) => !orderedCompanyIdSet.has(company.id));

  return [...orderedCompanies, ...newCompanies].filter((company) => !hiddenCompanyIdSet.has(company.id));
}

function reorderVisibleCompanyIds(
  companyOrderIds: string[],
  visibleCompanyIds: string[],
  sourceCompanyId: string,
  targetCompanyId: string,
) {
  if (sourceCompanyId === targetCompanyId) {
    return companyOrderIds;
  }

  const visibleCompanyIdSet = new Set(visibleCompanyIds);
  const orderedCompanyIds = getCanonicalCompanyOrderIds(companyOrderIds);
  const orderedVisibleCompanyIds = orderedCompanyIds.filter((companyId) => visibleCompanyIdSet.has(companyId));
  const sourceIndex = orderedVisibleCompanyIds.indexOf(sourceCompanyId);
  const targetIndex = orderedVisibleCompanyIds.indexOf(targetCompanyId);

  if (sourceIndex < 0 || targetIndex < 0) {
    return orderedCompanyIds;
  }

  const nextVisibleCompanyIds = moveArrayItem(orderedVisibleCompanyIds, sourceIndex, targetIndex);
  let visibleIndex = 0;

  return orderedCompanyIds.map((companyId) => {
    if (!visibleCompanyIdSet.has(companyId)) {
      return companyId;
    }

    const nextCompanyId = nextVisibleCompanyIds[visibleIndex];
    visibleIndex += 1;
    return nextCompanyId ?? companyId;
  });
}

function moveVisibleCompanyId(
  companyOrderIds: string[],
  visibleCompanyIds: string[],
  companyId: string,
  direction: 'up' | 'down',
) {
  const visibleCompanyIdSet = new Set(visibleCompanyIds);
  const orderedVisibleCompanyIds = getCanonicalCompanyOrderIds(companyOrderIds).filter((currentCompanyId) =>
    visibleCompanyIdSet.has(currentCompanyId),
  );
  const sourceIndex = orderedVisibleCompanyIds.indexOf(companyId);
  const targetIndex = direction === 'up' ? sourceIndex - 1 : sourceIndex + 1;

  if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= orderedVisibleCompanyIds.length) {
    return companyOrderIds;
  }

  return reorderVisibleCompanyIds(companyOrderIds, visibleCompanyIds, companyId, orderedVisibleCompanyIds[targetIndex]);
}

function buildTimelineData(data: CompanyRecord[]) {
  const invalidEntries: string[] = [];

  const processedCompanies = data.map<ProcessedCompany>((company) => {
    const processedProductLines = company.productLines.map<ProcessedProductLine>((productLine) => {
      const sortedReleases = productLine.releases.map((release) => ({
        ...release,
        classes: getReleaseClasses(company, productLine, release),
        presets: getReleasePresets(company, productLine, release),
      })).sort((left, right) => {
        const leftDate = parseTimelineDate(left.date).getTime();
        const rightDate = parseTimelineDate(right.date).getTime();
        return leftDate - rightDate || left.name.localeCompare(right.name);
      });

      const processedReleases = sortedReleases.reduce<ProcessedRelease[]>((collection, release) => {
        const releaseDate = parseTimelineDate(release.date);
        const releaseEndDate = release.endDate ? parseTimelineDate(release.endDate) : releaseDate;

        if (Number.isNaN(releaseDate.getTime())) {
          invalidEntries.push(`${company.name} / ${productLine.label}: ${release.name}`);
          return collection;
        }

        if (release.endDate && Number.isNaN(releaseEndDate.getTime())) {
          invalidEntries.push(`${company.name} / ${productLine.label}: ${release.name} end date`);
          return collection;
        }

        const previousRelease = collection[collection.length - 1];
        const globalDay = Math.round((releaseDate.getTime() - START_DATE.getTime()) / DAY_MS);
        const endGlobalDay = Number.isNaN(releaseEndDate.getTime())
          ? globalDay
          : Math.max(globalDay, Math.round((releaseEndDate.getTime() - START_DATE.getTime()) / DAY_MS));
        const gap = previousRelease ? globalDay - previousRelease.globalDay : 0;
        const eventType = getReleaseEventType(release);

        collection.push({
          ...release,
          articleSlug: getReleaseSlug(company.id, productLine.id, release),
          dateLabel: formatTimelineDate(releaseDate),
          dateRangeLabel: formatTimelineDateRange(release.date, release.endDate),
          durationDays: endGlobalDay - globalDay + 1,
          endDateLabel: release.endDate ? formatTimelineDate(release.endDate) : undefined,
          endGlobalDay,
          eventKind: eventType.kind,
          eventType: eventType.id,
          eventTypeLabel: eventType.label,
          eventTypeShortLabel: eventType.shortLabel,
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
        ...productLine,
        averageGap,
        latestRelease,
        releases: processedReleases,
        startDay: firstRelease?.globalDay ?? 0,
        totalSpan: latestRelease && firstRelease ? latestRelease.endGlobalDay - firstRelease.globalDay : 0,
      };
    });

    const latestProductLine = [...processedProductLines]
      .filter((productLine) => productLine.latestRelease)
      .sort((left, right) => (right.latestRelease?.endGlobalDay ?? 0) - (left.latestRelease?.endGlobalDay ?? 0))[0] ?? null;
    const latestRelease = latestProductLine?.latestRelease ?? null;
    const firstRelease = [...processedProductLines]
      .flatMap((productLine) => productLine.releases)
      .sort((left, right) => left.globalDay - right.globalDay)[0] ?? null;
    const totalGap = processedProductLines.reduce(
      (sum, productLine) => sum + productLine.releases.reduce((lineSum, release) => lineSum + release.gap, 0),
      0,
    );
    const totalGapSegments = processedProductLines.reduce(
      (sum, productLine) => sum + Math.max(productLine.releases.length - 1, 0),
      0,
    );

    return {
      ...company,
      averageGap: totalGapSegments > 0 ? Math.round(totalGap / totalGapSegments) : null,
      latestProductLine,
      latestRelease,
      productLines: processedProductLines,
      startDay: firstRelease?.globalDay ?? 0,
      totalSpan: latestRelease && firstRelease ? latestRelease.endGlobalDay - firstRelease.globalDay : 0,
    };
  });

  const latestGlobalDay = processedCompanies.reduce((max, company) => {
    const currentLatestDay = company.latestRelease?.endGlobalDay ?? 0;
    return Math.max(max, currentLatestDay);
  }, 0);

  const totalReleases = processedCompanies.reduce(
    (sum, company) => sum + company.productLines.reduce((lineSum, productLine) => lineSum + productLine.releases.length, 0),
    0,
  );

  return {
    invalidEntries,
    latestGlobalDay,
    processedCompanies,
    totalReleases,
  };
}

function buildTicks(maxDays: number) {
  const monthTicks: Tick[] = [];
  const yearTicks: Tick[] = [];
  const endDate = new Date(START_DATE.getTime() + maxDays * DAY_MS);
  const cursor = new Date(Date.UTC(START_DATE.getUTCFullYear(), START_DATE.getUTCMonth(), 1));

  if (cursor.getTime() < START_DATE.getTime()) {
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

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

function getQuietDays(item: {latestRelease: ProcessedRelease | null}, currentGlobalDay: number) {
  return item.latestRelease ? Math.max(0, Math.floor(currentGlobalDay - item.latestRelease.endGlobalDay)) : 0;
}

function getRecencyFillWidth(quietDays: number, maxQuietDays: number) {
  return maxQuietDays === 0 ? 100 : Math.max(0, Math.round((1 - quietDays / maxQuietDays) * 100));
}

function formatQuietDaysLabel(quietDays: number) {
  return `${quietDays} ${quietDays === 1 ? 'Day' : 'Days'} since last update`;
}

function getProductLineHeight(compact = false) {
  return compact ? MOBILE_PRODUCT_LINE_HEIGHT : DESKTOP_PRODUCT_LINE_HEIGHT;
}

function getProductLineStackMetrics(lineCount: number, compact = false) {
  const safeLineCount = Math.max(lineCount, 1);
  const minHeight = compact ? MOBILE_COMPANY_MIN_HEIGHT : DESKTOP_COMPANY_MIN_HEIGHT;
  const lineHeight = getProductLineHeight(compact);
  const linesHeight = safeLineCount * lineHeight + Math.max(safeLineCount - 1, 0) * PRODUCT_LINE_GAP;
  const groupHeight = Math.max(minHeight, linesHeight + (safeLineCount > 1 ? 16 : 0));

  return {
    groupHeight,
    lineHeight,
    topOffset: Math.max(0, (groupHeight - linesHeight) / 2),
  };
}

function getCompanyGroupHeight(company: Pick<ProcessedCompany, 'productLines'>, compact = false) {
  return getProductLineStackMetrics(company.productLines.length, compact).groupHeight;
}

function getProductLineCenterY(lineCount: number, productLineIndex: number, compact = false) {
  const {lineHeight, topOffset} = getProductLineStackMetrics(lineCount, compact);
  return topOffset + productLineIndex * (lineHeight + PRODUCT_LINE_GAP) + lineHeight / 2;
}

function getTimelineMinHeight(companiesToRender: ProcessedCompany[], compact = false) {
  const rowsHeight = companiesToRender.reduce((sum, company) => sum + getCompanyGroupHeight(company, compact), 0);
  const gapsHeight = Math.max(companiesToRender.length - 1, 0) * (compact ? 32 : 44);
  return Math.max(compact ? 384 : 448, rowsHeight + gapsHeight + (compact ? 160 : 184));
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSigmoidUnit(progress: number) {
  const clampedProgress = clampNumber(progress, 0, 1);
  const rawMin = 1 / (1 + Math.exp(SIGMOID_STEEPNESS / 2));
  const rawMax = 1 / (1 + Math.exp(-SIGMOID_STEEPNESS / 2));
  const raw = 1 / (1 + Math.exp(-SIGMOID_STEEPNESS * (clampedProgress - 0.5)));
  return (raw - rawMin) / (rawMax - rawMin);
}

function getSigmoidProgress(unit: number) {
  const clampedUnit = clampNumber(unit, 0, 1);
  const rawMin = 1 / (1 + Math.exp(SIGMOID_STEEPNESS / 2));
  const rawMax = 1 / (1 + Math.exp(-SIGMOID_STEEPNESS / 2));
  const target = rawMin + clampedUnit * (rawMax - rawMin);
  return clampNumber(0.5 + Math.log(target / (1 - target)) / SIGMOID_STEEPNESS, 0, 1);
}

function getZoomFromProgress(progress: number, minZoom: number, maxZoom: number) {
  if (maxZoom <= minZoom) {
    return minZoom;
  }

  const unit = getSigmoidUnit(progress);
  return minZoom + unit * (maxZoom - minZoom);
}

function getZoomProgress(zoom: number, minZoom: number, maxZoom: number) {
  if (maxZoom <= minZoom) {
    return 0;
  }

  const unit = (clampNumber(zoom, minZoom, maxZoom) - minZoom) / (maxZoom - minZoom);
  return getSigmoidProgress(unit);
}

function getSteppedZoom(currentZoom: number, delta: number, minZoom: number, maxZoom: number) {
  const currentProgress = getZoomProgress(currentZoom, minZoom, maxZoom);
  return getZoomFromProgress(currentProgress + delta, minZoom, maxZoom);
}

function getFitZoom(viewportWidth: number, railWidth: number, baseTimelineWidth: number) {
  if (viewportWidth <= 0 || baseTimelineWidth <= 0) {
    return 0.35;
  }

  const availableWidth = Math.max(viewportWidth - railWidth, 120);
  return clampNumber((availableWidth / baseTimelineWidth) * FIT_BUFFER_MULTIPLIER, 0.08, 1);
}

function getTimelineAnchorRatio(scrollLeft: number, anchorOffsetX: number, railWidth: number, timelineWidth: number) {
  if (timelineWidth <= 0) {
    return 0;
  }

  const timelineOffset = clampNumber(scrollLeft + anchorOffsetX - railWidth, 0, timelineWidth);
  return timelineOffset / timelineWidth;
}

function getScrollLeftForTimelineAnchor(
  anchorRatio: number,
  anchorOffsetX: number,
  railWidth: number,
  timelineWidth: number,
) {
  return railWidth + anchorRatio * timelineWidth - anchorOffsetX;
}

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

function ModelClassIcon({classId, className}: {classId: ModelClassId; className?: string}) {
  const iconClassName = className ?? 'h-4 w-4';

  if (classId === 'frontier-llms') {
    return <BrainCircuit className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === 'open-source-llms') {
    return <Globe2 className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === 'image-generation') {
    return <ImageIcon className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === 'video-generation') {
    return <Clapperboard className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === '3d-generation') {
    return <Box className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === 'coding-harnesses') {
    return <Code2 className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === 'events') {
    return <CalendarDays className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === 'robotics') {
    return <Bot className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === 'vehicle-autonomy') {
    return <CarFront className={iconClassName} strokeWidth={1.8} />;
  }

  return <Layers3 className={iconClassName} strokeWidth={1.8} />;
}

type ModelClassExplorerProps = {
  boardView: BoardView;
  className?: string;
  isOpen: boolean;
  onClearAll: () => void;
  onPresetToggle: (presetId: PresetId) => void;
  onReset: () => void;
  onSelectAll: () => void;
  onToggle: () => void;
  presetStats: Record<PresetId, {providerCount: number; releaseCount: number}>;
  selectedPresetIds: PresetId[];
  variant?: 'panel' | 'rail';
};

function ModelClassExplorer({
  boardView,
  className = '',
  isOpen,
  onClearAll,
  onPresetToggle,
  onReset,
  onSelectAll,
  onToggle,
  presetStats,
  selectedPresetIds,
  variant = 'panel',
}: ModelClassExplorerProps) {
  const selectedCount = selectedPresetIds.length;
  const isRail = variant === 'rail';
  const isCollapsedRail = isRail && !isOpen;
  const rootClassName = `${isRail ? (isOpen ? 'w-[var(--category-expanded-width,260px)]' : 'w-[74px]') : 'w-full'} timeline-fluid-obstacle overflow-hidden rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--soft-shadow)] backdrop-blur-xl transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCollapsedRail ? 'cursor-pointer hover:bg-[var(--surface-strong)]' : ''} ${className}`;

  return (
    <aside
      className={rootClassName}
      onClick={isCollapsedRail ? onToggle : undefined}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Choose timeline categories"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className={`flex w-full items-center gap-3 text-left transition duration-300 hover:bg-[var(--surface-strong)] active:scale-[0.99] ${
          isOpen
            ? isRail
              ? 'justify-between border-b border-[var(--edge)] px-3 py-3'
              : 'justify-between border-b border-[var(--edge)] px-4 py-4'
            : 'justify-center px-0 py-4'
        }`}
      >
        <span
          className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] text-[var(--ink)] shadow-[var(--soft-shadow)] ${
            isRail && isOpen ? 'h-8 w-8' : 'h-10 w-10'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
        </span>
        {isOpen ? (
          <span className="min-w-0 flex-1">
            <span className={`block font-semibold uppercase text-[var(--muted)] ${isRail ? 'text-[9px] tracking-[0.16em]' : 'text-[10px] tracking-[0.2em]'}`}>
              {isRail ? 'Categories' : 'Timeline categories'}
            </span>
            <span className="mt-1 block truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{boardView.label}</span>
            <span className={`mt-1 block font-mono uppercase text-[var(--muted)] ${isRail ? 'text-[9px] tracking-[0.12em]' : 'text-[10px] tracking-[0.14em]'}`}>
              {isRail ? `${selectedCount}/${modelPresets.length} active` : `${selectedCount} of ${modelPresets.length} lines active`}
            </span>
          </span>
        ) : (
          <span className="sr-only">{boardView.label}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--ink-soft)] transition duration-300 ${isOpen ? 'rotate-180' : isRail ? '-rotate-90' : ''}`}
          strokeWidth={1.8}
        />
      </button>

      <div
        data-category-panel
        aria-hidden={!isOpen}
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? (isRail ? 'max-h-[520px] opacity-100' : 'max-h-[560px] opacity-100') : 'max-h-0 opacity-0'
        }`}
        style={{pointerEvents: isOpen ? 'auto' : 'none'}}
      >
            <motion.div
              initial={false}
              animate={{y: isOpen ? 0 : -10}}
              transition={{duration: 0.34, ease: [0.16, 1, 0.3, 1]}}
              className={`${isRail ? 'max-h-[min(520px,calc(100dvh-20rem))]' : 'max-h-[min(560px,calc(100dvh-12rem))]'} overflow-y-auto px-3 py-3`}
            >
              <div className={isRail ? 'space-y-3' : 'space-y-4'}>
                {presetGroups.map((group) => (
                  <div key={group.label}>
                    <p className={`${isRail ? 'mb-1.5 text-[9px] tracking-[0.15em]' : 'mb-2 text-[10px] tracking-[0.18em]'} px-1 font-semibold uppercase text-[var(--muted)]`}>
                      {group.label}
                    </p>
                    <div className={isRail ? 'space-y-1.5' : 'space-y-2'}>
                      {group.presetIds.map((presetId) => {
                        const preset = modelPresets.find((candidate) => candidate.id === presetId);

                        if (!preset) {
                          return null;
                        }

                        const isSelected = selectedPresetIds.includes(preset.id);
                        const stats = presetStats[preset.id];

                        if (isRail) {
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              title={preset.description}
                              disabled={!isOpen}
                              onClick={() => onPresetToggle(preset.id)}
                              className={`flex h-11 w-full items-center gap-2 rounded-[0.85rem] border px-2.5 text-left transition duration-300 active:scale-[0.99] ${
                                isSelected
                                  ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)]'
                                  : 'border-[var(--edge)] bg-transparent hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]'
                              }`}
                            >
                              <ModelClassIcon classId={preset.classId} className="h-4 w-4 shrink-0 text-[var(--ink)]" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-semibold tracking-tight text-[var(--ink)]">
                                  {preset.label}
                                </span>
                                <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.11em] text-[var(--muted)]">
                                  {stats.providerCount}c / {stats.releaseCount}r
                                </span>
                              </span>
                              <span
                                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? 'border-[var(--edge-strong)] bg-[var(--ink)] text-[var(--page-bg)]'
                                    : 'border-[var(--edge)] text-transparent'
                                }`}
                              >
                                <Check className="h-3 w-3" strokeWidth={2} />
                              </span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            disabled={!isOpen}
                            onClick={() => onPresetToggle(preset.id)}
                            className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-[0.95rem] border p-3 text-left transition duration-300 active:scale-[0.99] ${
                              isSelected
                                ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)]'
                                : 'border-[var(--edge)] bg-transparent hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]'
                            }`}
                          >
                            <span className="grid min-w-0 grid-cols-[1.2rem_minmax(0,1fr)] gap-2.5">
                              <ModelClassIcon classId={preset.classId} className="mt-0.5 h-4.5 w-4.5 text-[var(--ink)]" />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold tracking-tight text-[var(--ink)]">
                                  {preset.label}
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-[var(--ink-soft)]">{preset.description}</span>
                                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                                  {stats.providerCount} companies / {stats.releaseCount} releases
                                </span>
                              </span>
                            </span>

                            <span
                              className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                                isSelected
                                  ? 'border-[var(--edge-strong)] bg-[var(--ink)] text-[var(--page-bg)]'
                                  : 'border-[var(--edge)] text-transparent'
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={2} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`${isRail ? 'mt-3 gap-1.5' : 'mt-4 gap-2'} grid grid-cols-3`}>
                <button
                  type="button"
                  disabled={!isOpen}
                  onClick={onSelectAll}
                  title="Select all categories"
                  className={`${isRail ? 'h-8 px-2 text-[11px]' : 'h-10 px-3 text-xs'} inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--edge)] font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]`}
                >
                  <Layers3 className="h-3.5 w-3.5" strokeWidth={1.8} />
                  All
                </button>
                <button
                  type="button"
                  disabled={!isOpen}
                  onClick={onClearAll}
                  title="Clear categories"
                  className={`${isRail ? 'h-8 px-2 text-[11px]' : 'h-10 px-3 text-xs'} inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--edge)] font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]`}
                >
                  <X className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                  Clear
                </button>
                <button
                  type="button"
                  disabled={!isOpen}
                  onClick={onReset}
                  title="Reset categories"
                  className={`${isRail ? 'h-8 px-2 text-[11px]' : 'h-10 px-3 text-xs'} inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--edge)] font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]`}
                >
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                  Reset
                </button>
              </div>
            </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {!isOpen && isRail ? (
          <motion.div
            key="category-rail"
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 8}}
            transition={{duration: 0.2, ease: [0.22, 1, 0.36, 1]}}
            className="flex flex-col items-center gap-3 px-2 pb-5"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]" style={{writingMode: 'vertical-rl'}}>
              Categories
            </span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] font-mono text-[10px] text-[var(--ink-soft)]">
              {selectedCount}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </aside>
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

function TimelineZoomRail({
  className = '',
  compact = false,
  maxZoom,
  minZoom,
  onSliderActiveChange,
  onZoomChange,
  zoom,
}: {
  className?: string;
  compact?: boolean;
  maxZoom: number;
  minZoom: number;
  onSliderActiveChange?: (isActive: boolean) => void;
  onZoomChange: ZoomHandler;
  zoom: number;
}) {
  const sliderRef = useRef<HTMLLabelElement>(null);
  const activeSliderPointerIdRef = useRef<number | null>(null);
  const removeMouseDragListenersRef = useRef<(() => void) | null>(null);
  const queuedSliderClientYRef = useRef<number | null>(null);
  const sliderFrameRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const progress = getZoomProgress(zoom, minZoom, maxZoom);
  const thumbTopPercent = 8 + (1 - progress) * 84;
  const iconClassName = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const isThumbExpanded = isDragging || isFocused || isHovered;
  const thumbSizeClassName = isThumbExpanded
    ? compact
      ? 'h-10 min-w-10 px-2 text-[9px]'
      : 'h-11 min-w-11 px-2.5 text-[10px]'
    : compact
      ? 'h-4 min-w-4 px-0 text-[0px]'
      : 'h-5 min-w-5 px-0 text-[0px]';
  const thumbInteractiveSizeClassName = compact
    ? 'group-hover/zoomrail:h-10 group-hover/zoomrail:min-w-10 group-hover/zoomrail:px-2 group-hover/zoomrail:text-[9px] group-focus-within/zoomrail:h-10 group-focus-within/zoomrail:min-w-10 group-focus-within/zoomrail:px-2 group-focus-within/zoomrail:text-[9px]'
    : 'group-hover/zoomrail:h-11 group-hover/zoomrail:min-w-11 group-hover/zoomrail:px-2.5 group-hover/zoomrail:text-[10px] group-focus-within/zoomrail:h-11 group-focus-within/zoomrail:min-w-11 group-focus-within/zoomrail:px-2.5 group-focus-within/zoomrail:text-[10px]';
  const activeRailClassName = isDragging
    ? 'text-[var(--ink)] opacity-100'
    : 'opacity-45';

  const setSliderActive = (isActive: boolean, sync = false) => {
    const updateActiveState = () => {
      setIsDragging(isActive);
      onSliderActiveChange?.(isActive);
    };

    if (sync) {
      flushSync(updateActiveState);
      return;
    }

    updateActiveState();
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextProgress = Number(event.currentTarget.value);
    onZoomChange(() => getZoomFromProgress(nextProgress, minZoom, maxZoom));
  };

  useEffect(() => {
    return () => {
      if (sliderFrameRef.current !== null) {
        window.cancelAnimationFrame(sliderFrameRef.current);
      }

      queuedSliderClientYRef.current = null;
      removeMouseDragListenersRef.current?.();
      onSliderActiveChange?.(false);
    };
  }, [onSliderActiveChange]);

  const updateZoomFromSliderPoint = (clientY: number) => {
    const sliderRect = sliderRef.current?.getBoundingClientRect();

    if (!sliderRect || sliderRect.height <= 0) {
      return;
    }

    const nextProgress = clampNumber(1 - (clientY - sliderRect.top) / sliderRect.height, 0, 1);
    onZoomChange(() => getZoomFromProgress(nextProgress, minZoom, maxZoom));
  };

  const flushQueuedSliderZoom = () => {
    if (sliderFrameRef.current !== null) {
      window.cancelAnimationFrame(sliderFrameRef.current);
      sliderFrameRef.current = null;
    }

    const queuedClientY = queuedSliderClientYRef.current;
    queuedSliderClientYRef.current = null;

    if (queuedClientY !== null) {
      updateZoomFromSliderPoint(queuedClientY);
    }
  };

  const scheduleZoomFromSliderPoint = (clientY: number) => {
    queuedSliderClientYRef.current = clientY;

    if (sliderFrameRef.current !== null) {
      return;
    }

    sliderFrameRef.current = window.requestAnimationFrame(() => {
      sliderFrameRef.current = null;

      const queuedClientY = queuedSliderClientYRef.current;
      queuedSliderClientYRef.current = null;

      if (queuedClientY !== null) {
        updateZoomFromSliderPoint(queuedClientY);
      }
    });
  };

  const handleSliderPointerDown = (event: React.PointerEvent<HTMLLabelElement>) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    activeSliderPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSliderActive(true, true);
    updateZoomFromSliderPoint(event.clientY);
  };

  const handleSliderPointerMove = (event: React.PointerEvent<HTMLLabelElement>) => {
    if (activeSliderPointerIdRef.current !== event.pointerId) {
      return;
    }

    scheduleZoomFromSliderPoint(event.clientY);
    event.preventDefault();
  };

  const stopSliderPointerDrag = (event: React.PointerEvent<HTMLLabelElement>) => {
    if (activeSliderPointerIdRef.current !== event.pointerId) {
      return;
    }

    flushQueuedSliderZoom();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activeSliderPointerIdRef.current = null;
    setSliderActive(false);
  };

  const stopMouseSliderDrag = () => {
    flushQueuedSliderZoom();
    removeMouseDragListenersRef.current?.();
    removeMouseDragListenersRef.current = null;
    setSliderActive(false);
  };

  const handleSliderMouseDown = (event: React.MouseEvent<HTMLLabelElement>) => {
    if (event.button !== 0 || activeSliderPointerIdRef.current !== null) {
      return;
    }

    removeMouseDragListenersRef.current?.();
    setSliderActive(true, true);
    updateZoomFromSliderPoint(event.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      scheduleZoomFromSliderPoint(moveEvent.clientY);
      moveEvent.preventDefault();
    };

    const handleMouseUp = () => stopMouseSliderDrag();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, {once: true});
    removeMouseDragListenersRef.current = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  };

  const handleSliderKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyStep = event.shiftKey ? ZOOM_PROGRESS_STEP : ZOOM_SLIDER_KEYBOARD_STEP;

    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      onZoomChange((current) => getSteppedZoom(current, keyStep, minZoom, maxZoom));
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      onZoomChange((current) => getSteppedZoom(current, -keyStep, minZoom, maxZoom));
      event.preventDefault();
      return;
    }

    if (event.key === 'PageUp') {
      onZoomChange((current) => getSteppedZoom(current, ZOOM_PROGRESS_STEP, minZoom, maxZoom));
      event.preventDefault();
      return;
    }

    if (event.key === 'PageDown') {
      onZoomChange((current) => getSteppedZoom(current, -ZOOM_PROGRESS_STEP, minZoom, maxZoom));
      event.preventDefault();
      return;
    }

    if (event.key === 'Home') {
      onZoomChange(() => minZoom);
      event.preventDefault();
      return;
    }

    if (event.key === 'End') {
      onZoomChange(() => maxZoom);
      event.preventDefault();
    }
  };

  const handleRailBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsFocused(false);
    }
  };

  return (
    <div
      aria-label="Timeline zoom controls"
      role="group"
      className={`absolute z-40 flex ${
        compact ? 'min-h-[17rem] w-12 py-3' : 'min-h-[22rem] w-14 py-4'
      } group/zoomrail select-none flex-col items-center justify-center gap-3 px-2 text-[var(--ink-soft)] transition-[opacity,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[var(--ink)] hover:opacity-100 focus-within:text-[var(--ink)] focus-within:opacity-100 ${activeRailClassName} ${className}`}
      onBlur={handleRailBlur}
      onFocus={() => setIsFocused(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <div
        aria-hidden="true"
        className={`${compact ? 'h-6 w-6' : 'h-7 w-7'} relative z-10 inline-flex shrink-0 items-center justify-center opacity-70`}
      >
        <ZoomInIcon className={iconClassName} />
      </div>

      <label
        ref={sliderRef}
        className={`relative z-10 ${
          compact ? 'h-[12.5rem] w-8' : 'h-[16rem] w-9'
        } cursor-ns-resize touch-none rounded-full focus-within:ring-2 focus-within:ring-[rgba(237,242,250,0.3)]`}
        onMouseDown={handleSliderMouseDown}
        onPointerCancel={stopSliderPointerDrag}
        onPointerDown={handleSliderPointerDown}
        onPointerMove={handleSliderPointerMove}
        onPointerUp={stopSliderPointerDrag}
      >
        <span className="sr-only">Timeline zoom</span>
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-center"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(237,242,250,0.28) 1.4px, transparent 1.6px)',
            backgroundSize: '12px 12px',
          }}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-center ${isDragging ? 'transition-none' : 'transition-[clip-path] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(237,242,250,0.92) 1.5px, transparent 1.7px)',
            backgroundSize: '12px 12px',
            clipPath: `inset(${(1 - progress) * 100}% 0 0 0)`,
          }}
        />
        <span
          className={`absolute left-1/2 grid ${thumbSizeClassName} ${thumbInteractiveSizeClassName} -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[rgba(237,242,250,0.48)] bg-[rgba(237,242,250,0.95)] font-mono font-semibold text-[#0b0e14] shadow-[0_16px_32px_-22px_rgba(0,0,0,0.78)] ${isDragging ? 'scale-[1.04] transition-none' : 'transition-[top,width,height,min-width,padding,transform,box-shadow,font-size] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
          style={{top: `${thumbTopPercent}%`}}
        >
          <span className={`transition-opacity duration-200 group-hover/zoomrail:opacity-100 group-focus-within/zoomrail:opacity-100 ${isThumbExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {Math.round(zoom * 100)}%
          </span>
        </span>
        <input
          aria-label="Timeline zoom"
          aria-orientation="vertical"
          aria-valuetext={`${Math.round(zoom * 100)} percent`}
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onBlur={() => setSliderActive(false)}
          onChange={handleSliderChange}
          onKeyDown={handleSliderKeyDown}
          onPointerCancel={() => setSliderActive(false)}
          onPointerDown={() => setSliderActive(true, true)}
          onPointerUp={() => setSliderActive(false)}
          className="pointer-events-none absolute inset-0 z-30 h-full w-full cursor-ns-resize touch-none opacity-0 focus-visible:outline-none"
          style={{direction: 'rtl', writingMode: 'vertical-lr'}}
        />
      </label>

      <div
        aria-hidden="true"
        className={`${compact ? 'h-6 w-6' : 'h-7 w-7'} relative z-10 inline-flex shrink-0 items-center justify-center opacity-70`}
      >
        <ZoomOutIcon className={iconClassName} />
      </div>
    </div>
  );
}

function CompanyTypeIconBadge({
  className = '',
  company,
}: {
  className?: string;
  company: Pick<ProcessedCompany, 'defaultClasses' | 'productLines'>;
}) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center text-[var(--ink)] ${className}`}>
      <ModelClassIcon classId={getPrimaryCompanyClass(company)} className="h-[1rem] w-[1rem]" />
    </span>
  );
}

function CompanyLogoBadge({
  compact = false,
  company,
}: {
  compact?: boolean;
  company: Pick<ProcessedCompany, 'accent' | 'defaultClasses' | 'logoMark' | 'name' | 'productLines'>;
}) {
  const mark = company.logoMark;
  const assetPath = mark ? ARTICLE_LOGO_ASSET_PATHS[mark] : undefined;
  const isWideAsset = assetPath && isWideArticleLogoMark(mark);
  const boxClassName = isWideAsset
    ? compact
      ? 'h-7 w-12 rounded-[0.72rem]'
      : 'h-8 w-14 rounded-[0.82rem]'
    : compact
      ? 'h-7 w-7 rounded-[0.72rem]'
      : 'h-8 w-8 rounded-[0.82rem]';
  const assetClassName = isWideAsset
    ? compact
      ? 'relative h-[11px] w-9 object-contain'
      : 'relative h-3 w-11 object-contain'
    : compact
      ? 'relative h-[18px] w-[18px] object-contain'
      : 'relative h-5 w-5 object-contain';
  const textSizeClassName = compact ? 'text-[10px]' : 'text-xs';

  return (
    <span
      aria-label={`${company.name} logo`}
      className={`${boxClassName} relative grid shrink-0 place-items-center overflow-hidden border border-white/10 ${
        assetPath ? 'bg-[#f4f3ef]' : 'bg-[rgba(255,255,255,0.045)]'
      } shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
      title={`${company.name} logo`}
    >
      {assetPath ? (
        <img aria-hidden="true" alt="" className={assetClassName} src={getPublicAssetPath(assetPath)} />
      ) : mark ? (
        <>
          <span
            className="absolute inset-0 opacity-70"
            style={{
              background: `radial-gradient(circle at 28% 24%, ${toRgbaFromHex(company.accent, 0.35)}, transparent 48%)`,
            }}
          />
          {renderArticleLogoMark(mark, company.accent, textSizeClassName)}
        </>
      ) : (
        <CompanyTypeIconBadge className={compact ? 'h-4 w-4' : 'h-5 w-5'} company={company} />
      )}
    </span>
  );
}

function renderArticleLogoMark(mark: ArticleLogoMark, accent: string, textSizeClassName: string) {
  const sharedClassName = `relative font-semibold tracking-tight ${textSizeClassName}`;

  if (mark === 'gpt' || mark === 'openai') {
    return <span className={sharedClassName}>AI</span>;
  }

  if (mark === 'claude' || mark === 'anthropic') {
    return <span className={sharedClassName}>C</span>;
  }

  if (mark === 'gemini' || mark === 'google') {
    return <span className={sharedClassName}>G</span>;
  }

  if (mark === 'deepseek') {
    return <span className={sharedClassName}>D</span>;
  }

  if (mark === 'sora') {
    return <Clapperboard className="relative h-4 w-4" strokeWidth={1.8} />;
  }

  if (mark === 'figure') {
    return <span className={sharedClassName}>F</span>;
  }

  if (mark === 'tesla') {
    return <span className={sharedClassName}>T</span>;
  }

  if (mark === 'xai') {
    return <span className={sharedClassName}>x</span>;
  }

  return <span className={sharedClassName} style={{color: accent}}>AI</span>;
}

function CompanyRailItem({
  compact = false,
  draggedCompanyId,
  isFirst,
  isLast,
  company,
  onDragEnd,
  onDragStart,
  onHide,
  onMove,
  onReorder,
}: {
  compact?: boolean;
  draggedCompanyId: string | null;
  isFirst: boolean;
  isLast: boolean;
  company: ProcessedCompany;
  onDragEnd: () => void;
  onDragStart: (companyId: string) => void;
  onHide: (companyId: string) => void;
  onMove: CompanyMoveHandler;
  onReorder: CompanyReorderHandler;
}) {
  const isDragging = draggedCompanyId === company.id;
  const canDrop = Boolean(draggedCompanyId && draggedCompanyId !== company.id);
  const groupHeight = getCompanyGroupHeight(company, compact);
  const lineSummary = company.productLines.map((productLine) => productLine.shortLabel).join(' / ');
  const actionClassName =
    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-transparent text-[var(--muted)] transition duration-200 hover:border-[var(--edge)] hover:bg-[var(--surface-strong)] hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-30';

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.stopPropagation();
    action();
  };

  return (
    <motion.div
      layout
      className="group/rail pointer-events-auto flex items-center"
      style={{height: `${groupHeight}px`}}
    >
      <div
        draggable
        onDragEnd={onDragEnd}
        onDragOver={(event) => {
          if (!canDrop) {
            return;
          }

          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', company.id);
          onDragStart(company.id);
        }}
        onDrop={(event) => {
          event.preventDefault();
          const sourceCompanyId = event.dataTransfer.getData('text/plain') || draggedCompanyId;

          if (sourceCompanyId) {
            onReorder(sourceCompanyId, company.id);
          }

          onDragEnd();
        }}
        className={`relative w-full cursor-grab rounded-[0.95rem] border px-3 py-2 transition duration-200 active:cursor-grabbing ${
          isDragging
            ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)] opacity-55'
            : canDrop
              ? 'border-[var(--edge)] bg-[rgba(255,255,255,0.02)] hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]'
              : 'border-transparent bg-transparent hover:border-[var(--edge)] hover:bg-[var(--surface)]'
        }`}
      >
        <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
          <GripVertical className="h-4 w-4 shrink-0 text-[var(--muted)]" strokeWidth={1.8} />
          <CompanyLogoBadge compact={compact} company={company} />
          <div className="min-w-0 flex-1">
            <p
              className={`truncate font-semibold tracking-tight text-[var(--ink)] ${
                compact ? 'text-[12px] leading-[1.2]' : 'text-sm'
              }`}
            >
              {company.name}
            </p>
            <p className={`mt-1 truncate font-mono uppercase tracking-[0.14em] text-[var(--muted)] ${compact ? 'text-[8px]' : 'text-[9px]'}`}>
              {lineSummary}
            </p>
          </div>

          <div
            className={`shrink-0 items-center gap-0.5 transition duration-200 ${
              compact
                ? 'flex'
                : 'absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-[var(--edge)] bg-[rgba(10,13,19,0.96)] px-1 py-1 shadow-[var(--soft-shadow)] group-hover/rail:flex group-focus-within/rail:flex'
            }`}
          >
            {!compact ? (
              <>
                <button
                  type="button"
                  aria-label={`Move ${company.name} up`}
                  className={actionClassName}
                  disabled={isFirst}
                  onClick={(event) => handleButtonClick(event, () => onMove(company.id, 'up'))}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${company.name} down`}
                  className={actionClassName}
                  disabled={isLast}
                  onClick={(event) => handleButtonClick(event, () => onMove(company.id, 'down'))}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </>
            ) : null}
            <button
              type="button"
              aria-label={`Hide ${company.name}`}
              className={`${actionClassName} hover:border-[rgba(255,255,255,0.16)] hover:text-[var(--ink)]`}
              onClick={(event) => handleButtonClick(event, () => onHide(company.id))}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getMarkerShapeClass(markerShape: ProductMarkerShape) {
  if (markerShape === 'square') {
    return 'rounded-[5px]';
  }

  if (markerShape === 'diamond') {
    return 'rotate-45 rounded-[4px]';
  }

  return 'rounded-full';
}

function getProductLineBranchGeometry({
  compact,
  maxDays,
  primaryLine,
  productLine,
  productLineIndex,
  productLineCount,
}: {
  compact: boolean;
  maxDays: number;
  primaryLine: ProcessedProductLine;
  productLine: ProcessedProductLine;
  productLineIndex: number;
  productLineCount: number;
}) {
  if (primaryLine.releases.length === 0 || productLine.releases.length === 0) {
    return null;
  }

  const primaryStartDay = primaryLine.releases[0]?.globalDay ?? 0;
  const targetRelease =
    productLine.releases.find((release) => release.globalDay >= primaryStartDay) ?? productLine.releases[0];
  const sourceRelease =
    [...primaryLine.releases].reverse().find((release) => release.globalDay <= targetRelease.globalDay) ??
    primaryLine.releases[0];

  let endX = clampNumber((targetRelease.globalDay / maxDays) * 100, 0, 100);
  let startX = clampNumber((sourceRelease.globalDay / maxDays) * 100, 0, 100);
  const minimumBranchSpan = compact ? 7.25 : 10.5;

  if (endX < startX + minimumBranchSpan) {
    startX = clampNumber(endX - minimumBranchSpan, 0, 100);
  }

  const sourceY = getProductLineCenterY(productLineCount, 0, compact);
  const targetY = getProductLineCenterY(productLineCount, productLineIndex, compact);
  const xSpan = Math.max(endX - startX, minimumBranchSpan);
  const controlOffset = clampNumber(xSpan * 0.5, compact ? 3.25 : 4.25, compact ? 7 : 10.5);

  return {
    endX,
    path: `M ${startX.toFixed(3)} ${sourceY.toFixed(3)} C ${(startX + controlOffset).toFixed(3)} ${sourceY.toFixed(3)}, ${(endX - controlOffset).toFixed(3)} ${targetY.toFixed(3)}, ${endX.toFixed(3)} ${targetY.toFixed(3)}`,
  };
}

function ProductLineBranchConnectors({
  compact = false,
  company,
  maxDays,
}: {
  compact?: boolean;
  company: ProcessedCompany;
  maxDays: number;
}) {
  if (company.productLines.length < 2) {
    return null;
  }

  const primaryLine = company.productLines[0];
  const groupHeight = getCompanyGroupHeight(company, compact);
  const branchStroke = mixHexColors(company.accent, PAGE_BACKGROUND_HEX, compact ? 0.5 : 0.46);
  const branchPaths = company.productLines.slice(1).map((productLine, offsetIndex) => ({
    geometry: getProductLineBranchGeometry({
      compact,
      maxDays,
      primaryLine,
      productLine,
      productLineCount: company.productLines.length,
      productLineIndex: offsetIndex + 1,
    }),
    id: productLine.id,
  }));

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox={`0 0 100 ${groupHeight}`}
    >
      {branchPaths.map((branch, index) =>
        branch.geometry ? (
          <motion.path
            key={`${company.id}-${branch.id}-branch`}
            animate={{opacity: compact ? 0.68 : 0.76}}
            d={branch.geometry.path}
            fill="none"
            initial={{opacity: 0}}
            stroke={branchStroke}
            strokeLinecap="round"
            strokeWidth={compact ? 1.9 : 2.25}
            transition={{
              delay: company.id === 'xai' ? 0.16 + index * 0.06 : 0.1 + index * 0.05,
              duration: compact ? 0.42 : 0.48,
              ease: [0.22, 1, 0.36, 1],
            }}
            vectorEffect="non-scaling-stroke"
          />
        ) : null,
      )}
    </svg>
  );
}

function ProductLineTimelineLane({
  activeArticleSlug,
  compact = false,
  company,
  companyIndex,
  currentGlobalDay,
  maxDays,
  onModelSelect,
  productLine,
  productLineIndex,
}: {
  activeArticleSlug: string | null;
  compact?: boolean;
  company: ProcessedCompany;
  companyIndex: number;
  currentGlobalDay: number;
  maxDays: number;
  onModelSelect: (slug: string) => void;
  productLine: ProcessedProductLine;
  productLineIndex: number;
}) {
  const lineHeight = getProductLineHeight(compact);
  const isHarnessLine = productLine.classId === 'coding-harnesses';
  const harnessLineColor = mixHexColors(company.accent, PAGE_BACKGROUND_HEX, 0.34);
  const markerShapeClass = getMarkerShapeClass(productLine.markerShape);
  const markerSizeClass = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const releaseLabelClass = compact
    ? 'absolute left-3 top-0 origin-bottom-left -translate-y-1 -rotate-[22deg] whitespace-nowrap rounded-[0.7rem] border px-1.5 py-0.5 text-[10px] font-bold tracking-[0.01em] shadow-[var(--soft-shadow)] backdrop-blur-sm'
    : 'absolute left-4 top-0 origin-bottom-left -translate-y-2 -rotate-[28deg] whitespace-nowrap rounded-[0.8rem] border bg-[var(--surface-strong)] px-2 py-1 text-[12px] font-bold tracking-[0.015em] shadow-[var(--soft-shadow)] backdrop-blur-sm transition duration-300 group-hover:-translate-y-3 group-hover:bg-[var(--surface)]';
  const primaryLine = company.productLines[0];
  const branchGeometry =
    productLineIndex > 0 && primaryLine
      ? getProductLineBranchGeometry({
          compact,
          maxDays,
          primaryLine,
          productLine,
          productLineCount: company.productLines.length,
          productLineIndex,
        })
      : null;
  const trackStartPercent = branchGeometry?.endX ?? 0;

  return (
    <div className="relative z-10 shrink-0" style={{height: `${lineHeight}px`}}>
      <div
        className="absolute right-0 top-1/2 h-px -translate-y-1/2 bg-[var(--track-line)]"
        style={{left: `${trackStartPercent}%`}}
      />
      <div className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border bg-[rgba(10,13,19,0.88)] px-2 py-1 font-mono uppercase tracking-[0.13em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)] backdrop-blur-sm ${
            compact ? 'text-[8px]' : 'text-[9px]'
          }`}
          style={{borderColor: toRgbaFromHex(company.accent, 0.28)}}
        >
          <ModelClassIcon classId={productLine.classId} className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          {productLine.shortLabel}
        </span>
      </div>

      {productLine.releases.map((release, releaseIndex) => {
        const previousRelease = productLine.releases[releaseIndex - 1];
        const leftPercent = (release.globalDay / maxDays) * 100;
        const previousPercent = previousRelease ? (previousRelease.globalDay / maxDays) * 100 : leftPercent;
        const widthPercent = previousRelease ? leftPercent - previousPercent : 0;
        const rangeWidthPercent = ((release.endGlobalDay - release.globalDay) / maxDays) * 100;
        const delay = companyIndex * 0.1 + productLineIndex * 0.05 + releaseIndex * 0.07;
        const isLatestInLine =
          productLine.latestRelease?.name === release.name && productLine.latestRelease?.date === release.date;
        const labelTextColor = isLatestInLine
          ? mixHexColor(company.accent, 255, 0.12)
          : mixHexColor(company.accent, 255, 0.24);
        const labelBorderColor = toRgbaFromHex(company.accent, isLatestInLine ? 0.52 : 0.34);
        const labelBackground = isLatestInLine ? toRgbaFromHex(company.accent, 0.12) : undefined;
        const isActiveArticle = activeArticleSlug === release.articleSlug;
        const isGeneralEvent = release.eventKind === 'event';
        const openActionLabel = isGeneralEvent ? 'Open event' : 'Open release';

        return (
          <React.Fragment key={`${company.id}-${productLine.id}-${release.name}-${release.date}`}>
            {previousRelease ? (
              <motion.div
                initial={{opacity: 0, scaleX: 0}}
                animate={{opacity: isHarnessLine ? 0.72 : 0.58, scaleX: 1}}
                transition={{delay, duration: compact ? 0.65 : 0.72, ease: [0.22, 1, 0.36, 1]}}
                className={`absolute top-1/2 -translate-y-1/2 origin-left ${isHarnessLine ? 'h-px' : 'h-[2px]'}`}
                style={{
                  backgroundColor: isHarnessLine ? harnessLineColor : company.accent,
                  left: `${previousPercent}%`,
                  width: `${widthPercent}%`,
                }}
              >
                <div
                  className={`absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2 py-1 font-mono uppercase tracking-[0.1em] text-[var(--muted)] shadow-[var(--soft-shadow)] ${
                    compact ? 'text-[9px]' : 'text-[10px]'
                  }`}
                >
                  {release.gap}d
                </div>
              </motion.div>
            ) : null}

            {release.endGlobalDay > release.globalDay ? (
              <motion.div
                initial={{opacity: 0, scaleX: 0}}
                animate={{opacity: isLatestInLine ? 0.72 : 0.54, scaleX: 1}}
                transition={{delay: delay + 0.04, duration: compact ? 0.48 : 0.54, ease: [0.22, 1, 0.36, 1]}}
                className={`absolute top-1/2 z-10 origin-left -translate-y-1/2 rounded-full ${
                  compact ? 'h-[7px]' : 'h-2'
                }`}
                style={{
                  backgroundColor: company.accent,
                  boxShadow: `0 0 18px color-mix(in srgb, ${company.accent} 34%, transparent)`,
                  left: `${leftPercent}%`,
                  minWidth: compact ? '8px' : '10px',
                  width: `${rangeWidthPercent}%`,
                }}
              />
            ) : null}

            <motion.div
              initial={{opacity: 0, scale: 0.78, y: compact ? 8 : 10}}
              animate={{opacity: 1, scale: 1, y: 0}}
              transition={{delay: delay + 0.08, duration: compact ? 0.42 : 0.48, type: 'spring', stiffness: 120, damping: 18}}
              className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              style={{left: `${leftPercent}%`}}
            >
              <button
                type="button"
                aria-current={isActiveArticle ? 'page' : undefined}
                aria-label={`${openActionLabel} for ${release.name}, ${release.dateRangeLabel}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onModelSelect(release.articleSlug);
                }}
                onPointerDown={(event) => event.stopPropagation()}
                className="group relative cursor-pointer text-left outline-none"
              >
                <div
                  className={`${markerSizeClass} border-[3px] border-[var(--surface-strong)] transition duration-300 group-hover:scale-[1.22] group-focus-visible:scale-[1.22] ${markerShapeClass}`}
                  style={{
                    backgroundColor: company.accent,
                    boxShadow: isActiveArticle
                      ? `0 0 0 ${compact ? 6 : 7}px color-mix(in srgb, ${company.accent} 28%, transparent), 0 0 24px color-mix(in srgb, ${company.accent} 54%, transparent)`
                      : isLatestInLine
                      ? `0 0 0 ${compact ? 4 : 5}px color-mix(in srgb, ${company.accent} 20%, transparent), 0 0 18px color-mix(in srgb, ${company.accent} 40%, transparent)`
                      : `0 0 0 4px color-mix(in srgb, ${company.accent} 11%, transparent)`,
                    filter: isLatestInLine ? 'saturate(1.35) brightness(1.08)' : undefined,
                  }}
                />

                <div
                  className={releaseLabelClass}
                  style={{
                    backgroundColor: labelBackground,
                    borderColor: labelBorderColor,
                    color: labelTextColor,
                    textShadow: isLatestInLine ? '0 1px 12px rgba(0, 0, 0, 0.5)' : '0 1px 10px rgba(0, 0, 0, 0.38)',
                    filter: isLatestInLine ? 'saturate(1.18)' : undefined,
                  }}
                >
                  {release.name}
                </div>

                {!compact ? (
                  <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--ink)] shadow-[0_18px_38px_-24px_rgba(0,0,0,0.5)]">
                      {productLine.shortLabel} / {release.eventTypeShortLabel} / {release.dateRangeLabel}
                    </div>
                  </div>
                ) : null}
              </button>
            </motion.div>
          </React.Fragment>
        );
      })}

      {productLine.latestRelease && currentGlobalDay > productLine.latestRelease.endGlobalDay ? (
        <>
          <motion.div
            initial={{opacity: 0, scaleX: 0}}
            animate={{opacity: isHarnessLine ? 0.48 : 0.42, scaleX: 1}}
            transition={{
              delay: companyIndex * 0.14 + productLineIndex * 0.06 + productLine.releases.length * 0.07,
              duration: compact ? 0.75 : 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`absolute top-1/2 origin-left -translate-y-1/2 ${
              isHarnessLine ? 'h-px' : 'quiet-extension-flow h-[2px]'
            }`}
            style={{
              backgroundColor: isHarnessLine ? harnessLineColor : undefined,
              left: `${(productLine.latestRelease.endGlobalDay / maxDays) * 100}%`,
              ['--quiet-flow-duration' as string]: `${compact ? 5.4 : 6.4}s`,
              ['--quiet-line-color' as string]: company.accent,
              width: `${((currentGlobalDay - productLine.latestRelease.endGlobalDay) / maxDays) * 100}%`,
            }}
          />

          <div
            className="absolute top-1/2 z-0 -translate-y-1/2 pl-3"
            style={{left: `${(currentGlobalDay / maxDays) * 100}%`}}
          >
            <div
              className={`rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1 font-mono uppercase tracking-[0.14em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)] ${
                compact ? 'text-[9px]' : 'text-[10px]'
              }`}
            >
              +{getQuietDays(productLine, currentGlobalDay)}d
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CompanyTimelineGroup({
  activeArticleSlug,
  compact = false,
  company,
  companyIndex,
  currentGlobalDay,
  maxDays,
  onModelSelect,
}: {
  activeArticleSlug: string | null;
  compact?: boolean;
  company: ProcessedCompany;
  companyIndex: number;
  currentGlobalDay: number;
  maxDays: number;
  onModelSelect: (slug: string) => void;
}) {
  return (
    <div className="relative flex flex-col justify-center" style={{height: `${getCompanyGroupHeight(company, compact)}px`, gap: `${PRODUCT_LINE_GAP}px`}}>
      <ProductLineBranchConnectors compact={compact} company={company} maxDays={maxDays} />
      {company.productLines.map((productLine, productLineIndex) => (
        <React.Fragment key={`${company.id}-${productLine.id}`}>
          <ProductLineTimelineLane
            activeArticleSlug={activeArticleSlug}
            compact={compact}
            company={company}
            companyIndex={companyIndex}
            currentGlobalDay={currentGlobalDay}
            maxDays={maxDays}
            onModelSelect={onModelSelect}
            productLine={productLine}
            productLineIndex={productLineIndex}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function CompanySummaryCard({
  compact = false,
  company,
  currentGlobalDay,
  index,
  maxSummaryQuietDays,
}: {
  compact?: boolean;
  company: ProcessedCompany;
  currentGlobalDay: number;
  index: number;
  maxSummaryQuietDays: number;
}) {
  const quietDays = getQuietDays(company, currentGlobalDay);
  const fillWidth = getRecencyFillWidth(quietDays, maxSummaryQuietDays);
  const hasMultipleLines = company.productLines.length > 1;

  return (
    <motion.div
      key={`${company.id}-${compact ? 'mobile' : 'desktop'}-summary`}
      initial={{opacity: 0, y: compact ? 16 : 18}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: (compact ? 0.16 : 0.2) + index * 0.06, duration: compact ? 0.46 : 0.55, ease: [0.22, 1, 0.36, 1]}}
      className={`rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--soft-shadow)] ${
        compact ? 'p-4' : 'p-4'
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <CompanyTypeIconBadge className="h-7 w-7" company={company} />
          <p className="truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{company.name}</p>
        </div>

        {hasMultipleLines ? (
          <div className="mt-3 space-y-2">
            {company.productLines.map((productLine) => {
              const lineQuietDays = getQuietDays(productLine, currentGlobalDay);

              return (
                <div key={`${company.id}-${productLine.id}-summary-line`} className="min-w-0 rounded-[0.85rem] border border-[var(--edge)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold tracking-tight text-[var(--ink)]">
                      <ModelClassIcon classId={productLine.classId} className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{productLine.shortLabel}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                      {lineQuietDays}d
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--ink-soft)]">{productLine.latestRelease?.name ?? 'No releases'}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <p className="mt-3 text-base font-semibold tracking-tight text-[var(--ink)]">
              {formatQuietDaysLabel(quietDays)}
            </p>
            <div className="mt-2 min-w-0">
              <p className="truncate text-sm text-[var(--ink-soft)]">
                {company.latestRelease?.name ?? 'No releases'}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {company.latestRelease?.dateRangeLabel ?? 'Date unavailable'}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 h-1.5 rounded-full bg-[var(--edge)]">
        <div
          className="h-full origin-left rounded-full"
          style={{backgroundColor: company.accent, width: `${fillWidth}%`}}
        />
      </div>
    </motion.div>
  );
}

function getFallbackModelLogo(entry: ModelReleaseIndexEntry): ModelLogo {
  const fallbackMark: ArticleLogoMark =
    entry.companyLogoMark === 'openai'
      ? 'gpt'
      : entry.companyLogoMark === 'google'
        ? 'gemini'
        : entry.companyLogoMark === 'anthropic'
          ? 'claude'
          : entry.companyLogoMark;

  return {
    modelLabel: entry.name,
    modelMark: fallbackMark,
  };
}

function ArticleLogoGlyph({
  accent,
  label,
  mark,
  size,
}: {
  accent: string;
  label: string;
  mark: ArticleLogoMark;
  size: 'large' | 'small';
}) {
  const isLarge = size === 'large';
  const assetPath = ARTICLE_LOGO_ASSET_PATHS[mark];
  const isWideAsset = assetPath && isWideArticleLogoMark(mark);
  const boxClassName = isWideAsset
    ? isLarge
      ? 'h-16 w-28 rounded-[1.25rem]'
      : 'h-11 w-20 rounded-[0.95rem]'
    : isLarge
      ? 'h-16 w-16 rounded-[1.25rem]'
      : 'h-11 w-11 rounded-[0.95rem]';
  const assetClassName = isWideAsset
    ? isLarge
      ? 'relative h-5 w-20 object-contain'
      : 'relative h-3 w-14 object-contain'
    : isLarge
      ? 'relative h-10 w-10 object-contain'
      : 'relative h-7 w-7 object-contain';
  const textSizeClassName = isLarge ? 'text-lg' : 'text-sm';

  return (
    <span
      aria-label={`${label} logo`}
      className={`${boxClassName} relative grid shrink-0 place-items-center overflow-hidden border border-white/10 ${
        assetPath ? 'bg-[#f4f3ef]' : 'bg-[rgba(255,255,255,0.045)]'
      } shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
      title={`${label} logo`}
    >
      {!assetPath ? (
        <span
          className="absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(circle at 28% 24%, ${toRgbaFromHex(accent, 0.35)}, transparent 48%)`,
          }}
        />
      ) : null}
      {assetPath ? (
        <img aria-hidden="true" alt="" className={assetClassName} src={getPublicAssetPath(assetPath)} />
      ) : (
        renderArticleLogoMark(mark, accent, textSizeClassName)
      )}
    </span>
  );
}

function ArticleReleaseLink({
  label,
  onNavigate,
  slug,
  title,
}: {
  label: string;
  onNavigate: (slug: string) => void;
  slug: string | null;
  title: string | null;
}) {
  if (!slug || !title) {
    return (
      <div className="rounded-[1rem] border border-[var(--edge)] px-4 py-3 text-sm text-[var(--muted)]">
        {label}: none
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onNavigate(slug)}
      className="group rounded-[1rem] border border-[var(--edge)] px-4 py-3 text-left transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.99]"
    >
      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
      <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
        {title}
        <ArrowRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-0.5" strokeWidth={1.8} />
      </span>
    </button>
  );
}

function ArticleMediaFigure({media}: {media: ArticleMedia}) {
  const [hasImageError, setHasImageError] = useState(false);

  if (hasImageError) {
    return null;
  }

  return (
    <figure className="mt-7 overflow-hidden rounded-[1.25rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--soft-shadow)]">
      <img
        src={getPublicAssetPath(media.src)}
        alt={media.alt}
        className="w-full bg-black object-contain"
        loading="lazy"
        onError={() => setHasImageError(true)}
      />
      {media.caption ? (
        <figcaption className="border-t border-[var(--edge)] px-4 py-3 text-xs leading-5 text-[var(--ink-soft)]">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ModelArticlePanel({
  entry,
  onBack,
  onNavigate,
  requestedSlug,
}: {
  entry: ModelReleaseIndexEntry | null;
  onBack: () => void;
  onNavigate: (slug: string) => void;
  requestedSlug: string;
}) {
  const article = entry?.article ?? null;
  const logo = entry ? (article?.logo ?? getFallbackModelLogo(entry)) : null;
  const title = article?.title ?? entry?.name ?? 'Model not found';
  const summary =
    article?.summary ??
    (entry
      ? `${entry.name} is tracked as a ${entry.eventTypeLabel.toLowerCase()} from ${entry.companyName} in the ${entry.productLineLabel} line.`
      : `No timeline entry exists for ${requestedSlug}.`);

  return (
    <motion.aside
      key="model-article-panel"
      initial={{opacity: 0, x: 72}}
      animate={{opacity: 1, x: 0}}
      exit={{opacity: 0, x: 72}}
      transition={{duration: 0.38, ease: [0.22, 1, 0.36, 1]}}
      className="fixed inset-y-0 right-0 z-40 w-full overflow-y-auto border-l border-[var(--edge-strong)] bg-[rgba(8,11,16,0.98)] shadow-[0_34px_100px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl md:w-[min(760px,58vw)]"
    >
      <article className="min-h-full px-5 py-5 md:px-8 md:py-8">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--edge)] px-4 text-sm font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            Timeline
          </button>

          {entry ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--edge)] bg-[var(--surface)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.8} />
              {entry.dateRangeLabel}
            </span>
          ) : null}
        </div>

        {entry && logo ? (
          <div className="mt-9 flex items-start gap-4">
            <ArticleLogoGlyph accent={entry.accent} label={logo.modelLabel} mark={logo.modelMark} size="large" />
            <ArticleLogoGlyph accent={entry.accent} label={entry.companyName} mark={entry.companyLogoMark} size="small" />
          </div>
        ) : null}

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          {article?.eyebrow ?? entry?.eventTypeLabel ?? 'Unknown route'}
        </p>
        <h1 className="mt-3 max-w-[12ch] text-4xl leading-none tracking-tighter text-[var(--ink)] md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-[68ch] text-base leading-8 text-[var(--ink-soft)] md:text-lg">
          {article?.dek ?? summary}
        </p>

        {article?.media ? <ArticleMediaFigure media={article.media} /> : null}

        {entry ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {(article?.facts ?? [
              {label: 'Company', value: entry.companyName},
              {label: 'Product line', value: entry.productLineLabel},
              {label: entry.eventKind === 'event' ? 'Event date' : 'Release date', value: entry.dateRangeLabel},
              {label: 'Type', value: entry.eventTypeLabel},
            ]).map((fact) => (
              <div key={`${fact.label}-${fact.value}`} className="border-t border-[var(--edge)] pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{fact.label}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{fact.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <section className="mt-9 border-t border-[var(--edge)] pt-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <BookOpen className="h-4 w-4" strokeWidth={1.8} />
            Summary
          </div>
          <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">{summary}</p>
          {article?.impact ? <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">{article.impact}</p> : null}
        </section>

        {article?.sections.map((section) => (
          <section key={section.heading} className="mt-8 border-t border-[var(--edge)] pt-7">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)]">{section.heading}</h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-[var(--ink-soft)]">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        {article?.sources.length ? (
          <section className="mt-8 border-t border-[var(--edge)] pt-7">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)]">Sources</h2>
            <div className="mt-4 space-y-2">
              {article.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--edge)] px-4 py-3 text-sm text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]"
                >
                  <span>{source.label}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {entry ? (
          <div className="mt-8 grid gap-3 border-t border-[var(--edge)] pt-7 sm:grid-cols-2">
            <ArticleReleaseLink label="Previous" onNavigate={onNavigate} slug={entry.previousSlug} title={entry.previousName} />
            <ArticleReleaseLink label="Next" onNavigate={onNavigate} slug={entry.nextSlug} title={entry.nextName} />
          </div>
        ) : (
          <div className="mt-8 rounded-[1.1rem] border border-[var(--edge)] bg-[var(--surface)] p-5">
            <p className="text-sm leading-6 text-[var(--ink-soft)]">This route does not match a known model or event entry.</p>
          </div>
        )}
      </article>
    </motion.aside>
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

const AURORA_VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FLUID_VELOCITY_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uVelocityMap;
uniform sampler2D uDyeMap;
uniform vec2 uTexel;
uniform vec2 uPointerPosition;
uniform vec2 uPointerVelocity;
uniform float uPointerActive;
uniform float uPointerRadius;
uniform float uDeltaTime;
uniform float uElapsedTime;
uniform float uAspect;
uniform vec4 uEmitterSeed;

varying vec2 vUv;

vec2 decodeVelocity(vec4 state) {
  return state.rg * 2.0 - 1.0;
}

vec4 encodeVelocity(vec2 velocity) {
  return vec4(clamp(velocity * 0.5 + 0.5, 0.0, 1.0), 0.0, 1.0);
}

float dyeAmount(vec4 dye) {
  return dot(dye.rgb, vec3(0.933)) + dye.a * 0.42;
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  value += valueNoise(p) * 0.5;
  p = p * 2.03 + 17.11;
  value += valueNoise(p) * 0.3;
  p = p * 2.01 + 31.73;
  value += valueNoise(p) * 0.2;
  return value;
}

float weatherCenter(float t, float phase) {
  float drift = fbm(vec2(t * 0.42 + phase, phase * 1.91));
  float wander = fbm(vec2(t * 0.17 + phase * 2.7, 8.4 + phase));
  float wave = sin(t * 0.31 + phase + drift * 6.28318);
  return clamp(0.5 + wave * 0.36 + (wander - 0.5) * 0.28, 0.08, 0.92);
}

float weatherSideY(float t, float phase) {
  float drift = fbm(vec2(t * 0.33 + phase, phase * 2.41));
  float wander = fbm(vec2(t * 0.19 + phase * 2.2, 13.7 + phase));
  float wave = sin(t * 0.27 + phase + drift * 6.28318);
  return clamp(0.5 + wave * 0.32 + (wander - 0.5) * 0.24, 0.12, 0.88);
}

float bottomTrackY(float t, float phase) {
  float drift = fbm(vec2(t * 0.28 + phase, phase * 2.17));
  float wave = sin(t * 0.38 + phase + drift * 6.28318);
  return clamp(0.026 + wave * 0.018 + (drift - 0.5) * 0.024, 0.0, 0.064);
}

float rightTrackX(float t, float phase) {
  float drift = fbm(vec2(t * 0.3 + phase, phase * 1.73));
  float wave = sin(t * 0.34 + phase + drift * 6.28318);
  return clamp(0.974 + wave * 0.015 + (drift - 0.5) * 0.012, 0.946, 0.992);
}

float emitterBase(vec2 uv, float center, float originY, float width, float strength) {
  float x = (uv.x - center) * uAspect;
  float y = uv.y - originY;
  float upward = max(y, 0.0);
  float source = exp(-(x * x) / max(width * width, 0.0001)) * smoothstep(0.19, 0.0, upward) * smoothstep(-0.03, 0.018, y);
  return source * strength;
}

float emitterColumn(vec2 uv, float center, float originY, float width, float strength) {
  float x = (uv.x - center) * uAspect;
  float y = uv.y - originY;
  float upward = max(y, 0.0);
  float rise = smoothstep(0.68, 0.0, upward) * smoothstep(-0.02, 0.04, y);
  float spread = mix(width * 1.1, width * 5.6, smoothstep(0.0, 0.68, upward));
  return exp(-(x * x) / max(spread * spread, 0.0001)) * rise * strength;
}

float emitterRoll(vec2 uv, float center, float originY, float width, float strength) {
  float x = (uv.x - center) * uAspect;
  float y = uv.y - originY;
  float upward = max(y, 0.0);
  float rise = smoothstep(0.56, 0.0, upward) * smoothstep(-0.02, 0.04, y);
  float field = exp(-(x * x) / max(width * width * 8.0, 0.0001)) * rise;
  return clamp(-x / max(width * 3.2, 0.0001), -1.0, 1.0) * field * strength;
}

float sideEmitterBase(vec2 uv, float originX, float centerY, float height, float strength) {
  vec2 p = vec2((uv.x - originX) * uAspect, uv.y - centerY);
  float source = exp(-(p.x * p.x) / (0.028 * 0.028)) * exp(-(p.y * p.y) / max(height * height, 0.0001));
  return source * strength;
}

float sideEmitterColumn(vec2 uv, float originX, float centerY, float height, float strength) {
  float inward = max(0.0, originX - uv.x);
  float spread = height + inward * 0.46;
  float vertical = exp(-((uv.y - centerY) * (uv.y - centerY)) / max(spread * spread, 0.0001));
  float horizontal = exp(-(inward * inward) / (0.34 * 0.34));
  return vertical * horizontal * strength;
}

float sideEmitterRoll(vec2 uv, float originX, float centerY, float height, float strength) {
  float inward = max(0.0, originX - uv.x);
  float field = sideEmitterColumn(uv, originX, centerY, height, strength) * smoothstep(0.52, 0.02, inward);
  return clamp((uv.y - centerY) / max(height * 3.6, 0.0001), -1.0, 1.0) * field;
}

void main() {
  vec2 uv = vUv;
  float dt = clamp(uDeltaTime, 0.0, 0.05);
  float fluidDt = dt * 0.25;
  vec2 currentVelocity = decodeVelocity(texture2D(uVelocityMap, uv));
  vec2 backUv = clamp(uv - currentVelocity * fluidDt * 1.08, vec2(0.001), vec2(0.999));
  vec2 velocity = decodeVelocity(texture2D(uVelocityMap, backUv));
  float frameScale = dt * 10.0;
  float fluidFrameScale = fluidDt * 60.0;

  float dyeCenter = dyeAmount(texture2D(uDyeMap, uv));
  float dyeLeft = dyeAmount(texture2D(uDyeMap, clamp(uv - vec2(uTexel.x, 0.0), vec2(0.001), vec2(0.999))));
  float dyeRight = dyeAmount(texture2D(uDyeMap, clamp(uv + vec2(uTexel.x, 0.0), vec2(0.001), vec2(0.999))));
  float dyeDown = dyeAmount(texture2D(uDyeMap, clamp(uv - vec2(0.0, uTexel.y), vec2(0.001), vec2(0.999))));
  float dyeUp = dyeAmount(texture2D(uDyeMap, clamp(uv + vec2(0.0, uTexel.y), vec2(0.001), vec2(0.999))));
  vec2 dyeGradient = vec2((dyeRight - dyeLeft) * uAspect, dyeUp - dyeDown);
  vec2 surfaceTangent = vec2(-dyeGradient.y, dyeGradient.x);
  float surfaceEnergy = smoothstep(0.012, 0.22, dyeCenter);
  velocity += clamp(surfaceTangent * 1.65, vec2(-0.026), vec2(0.026)) * surfaceEnergy * fluidFrameScale;

  float weatherTime = uElapsedTime * 0.72;
  float centerA = clamp(weatherCenter(weatherTime + uEmitterSeed.x * 17.0, 0.2 + uEmitterSeed.x * 6.28318) + (uEmitterSeed.x - 0.5) * 0.12, 0.08, 0.92);
  float centerB = clamp(weatherCenter(weatherTime * 0.86 + 9.0 + uEmitterSeed.y * 19.0, 2.6 + uEmitterSeed.y * 6.28318) + (uEmitterSeed.y - 0.5) * 0.12, 0.08, 0.92);
  float liftA = bottomTrackY(weatherTime * 0.92 + uEmitterSeed.x * 11.0, 1.4 + uEmitterSeed.x * 5.0);
  float liftB = bottomTrackY(weatherTime * 0.78 + uEmitterSeed.y * 13.0, 4.7 + uEmitterSeed.y * 5.0);
  float sideY = weatherSideY(weatherTime * 1.08 + 17.0 + uEmitterSeed.z * 23.0, 5.1 + uEmitterSeed.z * 6.28318);
  float sideX = rightTrackX(weatherTime * 0.82 + uEmitterSeed.z * 17.0, 2.2 + uEmitterSeed.w * 6.28318);
  float strengthA = smoothstep(0.18, 0.86, fbm(vec2(weatherTime * 0.58 + 1.3 + uEmitterSeed.x * 8.0, 2.0 + uEmitterSeed.x * 5.0)));
  float strengthB = smoothstep(0.22, 0.88, fbm(vec2(weatherTime * 0.52 + 8.7 + uEmitterSeed.y * 8.0, 5.0 + uEmitterSeed.y * 5.0)));
  float strengthC = smoothstep(0.26, 0.9, fbm(vec2(weatherTime * 0.64 + 15.4 + uEmitterSeed.z * 8.0, 9.0 + uEmitterSeed.z * 5.0)));
  float sideStrength = 0.52 + strengthC * 0.72;
  float baseField = emitterBase(uv, centerA, liftA, 0.042, strengthA);
  baseField += emitterBase(uv, centerB, liftB, 0.052, strengthB * 0.82);
  float columnField = emitterColumn(uv, centerA, liftA, 0.045, strengthA);
  columnField += emitterColumn(uv, centerB, liftB, 0.055, strengthB * 0.8);
  columnField = clamp(columnField, 0.0, 1.35);
  float rollField = emitterRoll(uv, centerA, liftA, 0.052, strengthA);
  rollField += emitterRoll(uv, centerB, liftB, 0.064, strengthB * 0.85);
  float sideBase = sideEmitterBase(uv, sideX, sideY, 0.048, sideStrength);
  float sideColumn = sideEmitterColumn(uv, sideX, sideY, 0.06, sideStrength * 0.82);
  float sideRoll = sideEmitterRoll(uv, sideX, sideY, 0.058, sideStrength * 0.9);
  float crossWind = fbm(uv * vec2(1.2, 5.4) + vec2(weatherTime * 0.045, weatherTime * 0.038)) - 0.5;
  float lateralFlow = rollField * 0.008 + crossWind * (columnField + sideColumn * 0.42) * 0.016 - sideBase * 0.115 - sideColumn * 0.034;
  float upwardFlow = baseField * 1.53 + columnField * 0.0125 + sideRoll * 0.22;
  vec2 ambientFlow = vec2(lateralFlow, upwardFlow);
  velocity += ambientFlow * frameScale;

  vec2 pointerDelta = vec2((uv.x - uPointerPosition.x) * uAspect, uv.y - uPointerPosition.y);
  float radius = max(uPointerRadius, 0.0001);
  float pointerField = exp(-dot(pointerDelta, pointerDelta) / (radius * radius)) * uPointerActive;
  float pointerSpeed = min(length(uPointerVelocity), 7.5);
  vec2 pointerDirection = uPointerVelocity / max(pointerSpeed, 0.0001);
  vec2 pointerNormal = vec2(-pointerDirection.y, pointerDirection.x);
  float crossWake = clamp(dot(pointerDelta, pointerNormal) / radius, -1.0, 1.0);
  velocity += pointerDirection * pointerSpeed * 0.22 * pointerField;
  velocity += pointerNormal * crossWake * pointerSpeed * 0.11 * pointerField;

  velocity *= pow(0.99984, frameScale);

  gl_FragColor = encodeVelocity(velocity);
}
`;

const FLUID_CURL_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uVelocityMap;
uniform vec2 uTexel;
uniform float uAspect;

varying vec2 vUv;

vec2 decodeVelocity(vec4 state) {
  return state.rg * 2.0 - 1.0;
}

vec4 encodeScalar(float value) {
  return vec4(clamp(value * 0.5 + 0.5, 0.0, 1.0), 0.0, 0.0, 1.0);
}

void main() {
  vec2 uv = vUv;
  vec2 leftVelocity = decodeVelocity(texture2D(uVelocityMap, clamp(uv - vec2(uTexel.x, 0.0), vec2(0.001), vec2(0.999))));
  vec2 rightVelocity = decodeVelocity(texture2D(uVelocityMap, clamp(uv + vec2(uTexel.x, 0.0), vec2(0.001), vec2(0.999))));
  vec2 downVelocity = decodeVelocity(texture2D(uVelocityMap, clamp(uv - vec2(0.0, uTexel.y), vec2(0.001), vec2(0.999))));
  vec2 upVelocity = decodeVelocity(texture2D(uVelocityMap, clamp(uv + vec2(0.0, uTexel.y), vec2(0.001), vec2(0.999))));
  float curl = ((rightVelocity.y - leftVelocity.y) * uAspect - (upVelocity.x - downVelocity.x)) * 0.58;

  gl_FragColor = encodeScalar(curl);
}
`;

const FLUID_VORTICITY_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uVelocityMap;
uniform sampler2D uCurlMap;
uniform vec2 uTexel;
uniform float uDeltaTime;
uniform float uStrength;
uniform float uAspect;

varying vec2 vUv;

vec2 decodeVelocity(vec4 state) {
  return state.rg * 2.0 - 1.0;
}

vec4 encodeVelocity(vec2 velocity) {
  return vec4(clamp(velocity * 0.5 + 0.5, 0.0, 1.0), 0.0, 1.0);
}

float decodeScalar(vec4 state) {
  return state.r * 2.0 - 1.0;
}

void main() {
  vec2 uv = vUv;
  float dt = clamp(uDeltaTime, 0.0, 0.05);
  vec2 velocity = decodeVelocity(texture2D(uVelocityMap, uv));
  float centerCurl = decodeScalar(texture2D(uCurlMap, uv));
  float leftCurl = abs(decodeScalar(texture2D(uCurlMap, clamp(uv - vec2(uTexel.x, 0.0), vec2(0.001), vec2(0.999)))));
  float rightCurl = abs(decodeScalar(texture2D(uCurlMap, clamp(uv + vec2(uTexel.x, 0.0), vec2(0.001), vec2(0.999)))));
  float downCurl = abs(decodeScalar(texture2D(uCurlMap, clamp(uv - vec2(0.0, uTexel.y), vec2(0.001), vec2(0.999)))));
  float upCurl = abs(decodeScalar(texture2D(uCurlMap, clamp(uv + vec2(0.0, uTexel.y), vec2(0.001), vec2(0.999)))));
  vec2 curlGradient = vec2((rightCurl - leftCurl) * uAspect, upCurl - downCurl);
  curlGradient /= max(length(curlGradient), 0.0001);
  vec2 confinement = vec2(curlGradient.y, -curlGradient.x) * centerCurl * uStrength;

  velocity += clamp(confinement, vec2(-1.2), vec2(1.2)) * dt;
  gl_FragColor = encodeVelocity(velocity);
}
`;

const FLUID_DIVERGENCE_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uVelocityMap;
uniform vec2 uTexel;
uniform vec4 uObstacleRect;
uniform float uAspect;

varying vec2 vUv;

vec2 decodeVelocity(vec4 state) {
  return state.rg * 2.0 - 1.0;
}

vec4 encodeScalar(float value) {
  return vec4(clamp(value * 0.5 + 0.5, 0.0, 1.0), 0.0, 0.0, 1.0);
}

float roundedBoxSdf(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float solidMask(vec2 uv) {
  vec2 obstacleMin = uObstacleRect.xy;
  vec2 obstacleMax = uObstacleRect.zw;
  float obstacleActive = step(0.0, obstacleMax.x) * step(0.0, obstacleMax.y);
  vec2 obstacleCenter = (obstacleMin + obstacleMax) * 0.5;
  vec2 obstacleHalf = max((obstacleMax - obstacleMin) * 0.5, vec2(0.001));
  vec2 obstacleSpace = vec2((uv.x - obstacleCenter.x) * uAspect, uv.y - obstacleCenter.y);
  vec2 obstacleHalfSpace = vec2(obstacleHalf.x * uAspect, obstacleHalf.y);
  float sdf = roundedBoxSdf(obstacleSpace, obstacleHalfSpace, 0.035);
  return obstacleActive * (1.0 - smoothstep(-0.004, 0.012, sdf));
}

vec2 sampleVelocity(vec2 uv, vec2 centerVelocity) {
  float solid = solidMask(uv);
  return mix(decodeVelocity(texture2D(uVelocityMap, clamp(uv, vec2(0.001), vec2(0.999)))), centerVelocity, solid);
}

void main() {
  vec2 uv = vUv;
  vec2 centerVelocity = decodeVelocity(texture2D(uVelocityMap, uv));
  vec2 leftVelocity = sampleVelocity(uv - vec2(uTexel.x, 0.0), centerVelocity);
  vec2 rightVelocity = sampleVelocity(uv + vec2(uTexel.x, 0.0), centerVelocity);
  vec2 downVelocity = sampleVelocity(uv - vec2(0.0, uTexel.y), centerVelocity);
  vec2 upVelocity = sampleVelocity(uv + vec2(0.0, uTexel.y), centerVelocity);
  float divergence = 0.5 * ((rightVelocity.x - leftVelocity.x) + (upVelocity.y - downVelocity.y));

  gl_FragColor = encodeScalar(divergence);
}
`;

const FLUID_PRESSURE_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uPressureMap;
uniform sampler2D uDivergenceMap;
uniform vec2 uTexel;
uniform vec4 uObstacleRect;
uniform float uAspect;

varying vec2 vUv;

float decodeScalar(vec4 state) {
  return state.r * 2.0 - 1.0;
}

vec4 encodeScalar(float value) {
  return vec4(clamp(value * 0.5 + 0.5, 0.0, 1.0), 0.0, 0.0, 1.0);
}

float roundedBoxSdf(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float solidMask(vec2 uv) {
  vec2 obstacleMin = uObstacleRect.xy;
  vec2 obstacleMax = uObstacleRect.zw;
  float obstacleActive = step(0.0, obstacleMax.x) * step(0.0, obstacleMax.y);
  vec2 obstacleCenter = (obstacleMin + obstacleMax) * 0.5;
  vec2 obstacleHalf = max((obstacleMax - obstacleMin) * 0.5, vec2(0.001));
  vec2 obstacleSpace = vec2((uv.x - obstacleCenter.x) * uAspect, uv.y - obstacleCenter.y);
  vec2 obstacleHalfSpace = vec2(obstacleHalf.x * uAspect, obstacleHalf.y);
  float sdf = roundedBoxSdf(obstacleSpace, obstacleHalfSpace, 0.035);
  return obstacleActive * (1.0 - smoothstep(-0.004, 0.012, sdf));
}

float samplePressure(vec2 uv, float centerPressure) {
  float solid = solidMask(uv);
  return mix(decodeScalar(texture2D(uPressureMap, clamp(uv, vec2(0.001), vec2(0.999)))), centerPressure, solid);
}

void main() {
  vec2 uv = vUv;
  float centerPressure = decodeScalar(texture2D(uPressureMap, uv));
  float leftPressure = samplePressure(uv - vec2(uTexel.x, 0.0), centerPressure);
  float rightPressure = samplePressure(uv + vec2(uTexel.x, 0.0), centerPressure);
  float downPressure = samplePressure(uv - vec2(0.0, uTexel.y), centerPressure);
  float upPressure = samplePressure(uv + vec2(0.0, uTexel.y), centerPressure);
  float divergence = decodeScalar(texture2D(uDivergenceMap, uv));
  float pressure = (leftPressure + rightPressure + downPressure + upPressure - divergence) * 0.25;

  gl_FragColor = encodeScalar(pressure);
}
`;

const FLUID_GRADIENT_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uVelocityMap;
uniform sampler2D uPressureMap;
uniform vec2 uTexel;
uniform vec4 uObstacleRect;
uniform float uAspect;

varying vec2 vUv;

vec2 decodeVelocity(vec4 state) {
  return state.rg * 2.0 - 1.0;
}

vec4 encodeVelocity(vec2 velocity) {
  return vec4(clamp(velocity * 0.5 + 0.5, 0.0, 1.0), 0.0, 1.0);
}

float decodeScalar(vec4 state) {
  return state.r * 2.0 - 1.0;
}

float roundedBoxSdf(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float solidMask(vec2 uv) {
  vec2 obstacleMin = uObstacleRect.xy;
  vec2 obstacleMax = uObstacleRect.zw;
  float obstacleActive = step(0.0, obstacleMax.x) * step(0.0, obstacleMax.y);
  vec2 obstacleCenter = (obstacleMin + obstacleMax) * 0.5;
  vec2 obstacleHalf = max((obstacleMax - obstacleMin) * 0.5, vec2(0.001));
  vec2 obstacleSpace = vec2((uv.x - obstacleCenter.x) * uAspect, uv.y - obstacleCenter.y);
  vec2 obstacleHalfSpace = vec2(obstacleHalf.x * uAspect, obstacleHalf.y);
  float sdf = roundedBoxSdf(obstacleSpace, obstacleHalfSpace, 0.035);
  return obstacleActive * (1.0 - smoothstep(-0.004, 0.012, sdf));
}

float samplePressure(vec2 uv, float centerPressure) {
  float solid = solidMask(uv);
  return mix(decodeScalar(texture2D(uPressureMap, clamp(uv, vec2(0.001), vec2(0.999)))), centerPressure, solid);
}

void main() {
  vec2 uv = vUv;
  vec2 velocity = decodeVelocity(texture2D(uVelocityMap, uv));
  float centerPressure = decodeScalar(texture2D(uPressureMap, uv));
  float leftPressure = samplePressure(uv - vec2(uTexel.x, 0.0), centerPressure);
  float rightPressure = samplePressure(uv + vec2(uTexel.x, 0.0), centerPressure);
  float downPressure = samplePressure(uv - vec2(0.0, uTexel.y), centerPressure);
  float upPressure = samplePressure(uv + vec2(0.0, uTexel.y), centerPressure);
  vec2 gradient = vec2(rightPressure - leftPressure, upPressure - downPressure) * 0.52;
  velocity -= gradient;
  velocity = mix(velocity, vec2(0.0), solidMask(uv));

  gl_FragColor = encodeVelocity(velocity);
}
`;

const FLUID_DYE_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uVelocityMap;
uniform sampler2D uDyeMap;
uniform vec2 uPointerPosition;
uniform vec2 uPointerVelocity;
uniform float uPointerActive;
uniform float uPointerRadius;
uniform float uDeltaTime;
uniform float uElapsedTime;
uniform float uAspect;
uniform vec4 uEmitterSeed;

varying vec2 vUv;

vec2 decodeVelocity(vec4 state) {
  return state.rg * 2.0 - 1.0;
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  value += valueNoise(p) * 0.5;
  p = p * 2.03 + 17.11;
  value += valueNoise(p) * 0.3;
  p = p * 2.01 + 31.73;
  value += valueNoise(p) * 0.2;
  return value;
}

float weatherCenter(float t, float phase) {
  float drift = fbm(vec2(t * 0.42 + phase, phase * 1.91));
  float wander = fbm(vec2(t * 0.17 + phase * 2.7, 8.4 + phase));
  float wave = sin(t * 0.31 + phase + drift * 6.28318);
  return clamp(0.5 + wave * 0.36 + (wander - 0.5) * 0.28, 0.08, 0.92);
}

float weatherSideY(float t, float phase) {
  float drift = fbm(vec2(t * 0.33 + phase, phase * 2.41));
  float wander = fbm(vec2(t * 0.19 + phase * 2.2, 13.7 + phase));
  float wave = sin(t * 0.27 + phase + drift * 6.28318);
  return clamp(0.5 + wave * 0.32 + (wander - 0.5) * 0.24, 0.12, 0.88);
}

float bottomTrackY(float t, float phase) {
  float drift = fbm(vec2(t * 0.28 + phase, phase * 2.17));
  float wave = sin(t * 0.38 + phase + drift * 6.28318);
  return clamp(0.026 + wave * 0.018 + (drift - 0.5) * 0.024, 0.0, 0.064);
}

float rightTrackX(float t, float phase) {
  float drift = fbm(vec2(t * 0.3 + phase, phase * 1.73));
  float wave = sin(t * 0.34 + phase + drift * 6.28318);
  return clamp(0.974 + wave * 0.015 + (drift - 0.5) * 0.012, 0.946, 0.992);
}

float emitterBase(vec2 uv, float center, float originY, float width, float strength) {
  float x = (uv.x - center) * uAspect;
  float y = uv.y - originY;
  float upward = max(y, 0.0);
  float source = exp(-(x * x) / max(width * width, 0.0001)) * smoothstep(0.19, 0.0, upward) * smoothstep(-0.03, 0.018, y);
  return source * strength;
}

float emitterColumn(vec2 uv, float center, float originY, float width, float strength) {
  float x = (uv.x - center) * uAspect;
  float y = uv.y - originY;
  float upward = max(y, 0.0);
  float rise = smoothstep(0.68, 0.0, upward) * smoothstep(-0.02, 0.04, y);
  float spread = mix(width * 1.1, width * 5.6, smoothstep(0.0, 0.68, upward));
  return exp(-(x * x) / max(spread * spread, 0.0001)) * rise * strength;
}

float sideEmitterBase(vec2 uv, float originX, float centerY, float height, float strength) {
  vec2 p = vec2((uv.x - originX) * uAspect, uv.y - centerY);
  float source = exp(-(p.x * p.x) / (0.028 * 0.028)) * exp(-(p.y * p.y) / max(height * height, 0.0001));
  return source * strength;
}

float sideEmitterColumn(vec2 uv, float originX, float centerY, float height, float strength) {
  float inward = max(0.0, originX - uv.x);
  float spread = height + inward * 0.46;
  float vertical = exp(-((uv.y - centerY) * (uv.y - centerY)) / max(spread * spread, 0.0001));
  float horizontal = exp(-(inward * inward) / (0.34 * 0.34));
  return vertical * horizontal * strength;
}

void main() {
  vec2 uv = vUv;
  float dt = clamp(uDeltaTime, 0.0, 0.05);
  float fluidDt = dt * 0.25;
  vec2 velocity = decodeVelocity(texture2D(uVelocityMap, uv));
  vec2 backUv = clamp(uv - velocity * fluidDt * 1.08, vec2(0.001), vec2(0.999));
  vec4 dye = texture2D(uDyeMap, backUv);
  float frameScale = dt * 60.0;
  dye.rgb *= pow(0.9991, frameScale);
  dye.a *= pow(0.9984, frameScale);

  float weatherTime = uElapsedTime * 0.72;
  float centerA = clamp(weatherCenter(weatherTime + uEmitterSeed.x * 17.0, 0.2 + uEmitterSeed.x * 6.28318) + (uEmitterSeed.x - 0.5) * 0.12, 0.08, 0.92);
  float centerB = clamp(weatherCenter(weatherTime * 0.86 + 9.0 + uEmitterSeed.y * 19.0, 2.6 + uEmitterSeed.y * 6.28318) + (uEmitterSeed.y - 0.5) * 0.12, 0.08, 0.92);
  float liftA = bottomTrackY(weatherTime * 0.92 + uEmitterSeed.x * 11.0, 1.4 + uEmitterSeed.x * 5.0);
  float liftB = bottomTrackY(weatherTime * 0.78 + uEmitterSeed.y * 13.0, 4.7 + uEmitterSeed.y * 5.0);
  float sideY = weatherSideY(weatherTime * 1.08 + 17.0 + uEmitterSeed.z * 23.0, 5.1 + uEmitterSeed.z * 6.28318);
  float sideX = rightTrackX(weatherTime * 0.82 + uEmitterSeed.z * 17.0, 2.2 + uEmitterSeed.w * 6.28318);
  float strengthA = smoothstep(0.18, 0.86, fbm(vec2(weatherTime * 0.58 + 1.3 + uEmitterSeed.x * 8.0, 2.0 + uEmitterSeed.x * 5.0)));
  float strengthB = smoothstep(0.22, 0.88, fbm(vec2(weatherTime * 0.52 + 8.7 + uEmitterSeed.y * 8.0, 5.0 + uEmitterSeed.y * 5.0)));
  float strengthC = smoothstep(0.26, 0.9, fbm(vec2(weatherTime * 0.64 + 15.4 + uEmitterSeed.z * 8.0, 9.0 + uEmitterSeed.z * 5.0)));
  float sideStrength = 0.72 + strengthC * 0.72;
  float sourceBase = emitterBase(uv, centerA, liftA, 0.042, strengthA);
  sourceBase += emitterBase(uv, centerB, liftB, 0.052, strengthB * 0.82);
  float sourceColumn = emitterColumn(uv, centerA, liftA, 0.045, strengthA);
  sourceColumn += emitterColumn(uv, centerB, liftB, 0.055, strengthB * 0.8);
  sourceColumn = clamp(sourceColumn, 0.0, 1.35);
  float sideSource = sideEmitterBase(uv, sideX, sideY, 0.048, sideStrength);
  float sideColumn = sideEmitterColumn(uv, sideX, sideY, 0.06, sideStrength * 0.82);
  float sourceVeil = 0.58 + 0.42 * fbm(uv * vec2(4.2, 7.0) + vec2(weatherTime * 0.05, -weatherTime * 0.038));
  float ambientDye = (sourceBase * 0.021 + sourceColumn * 0.0065 + sideSource * 0.031 + sideColumn * 0.009) * sourceVeil * frameScale;
  dye.rgb += vec3(0.014, 0.085, 0.074) * ambientDye;
  dye.a += ambientDye * 0.42;

  vec2 pointerDelta = vec2((uv.x - uPointerPosition.x) * uAspect, uv.y - uPointerPosition.y);
  float radius = max(uPointerRadius * 0.92, 0.0001);
  float pointerField = exp(-dot(pointerDelta, pointerDelta) / (radius * radius)) * uPointerActive;
  float pointerSpeed = min(length(uPointerVelocity), 7.5);
  float dyeImpulse = pointerField * (0.075 + pointerSpeed * 0.052);
  dye.rgb += vec3(0.02, 0.12, 0.105) * dyeImpulse;
  dye.a += dyeImpulse * 0.48;

  gl_FragColor = clamp(dye, 0.0, 1.0);
}
`;

const FLUID_RENDER_FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 uResolution;
uniform vec2 uFluidTexel;
uniform vec4 uWidgetRect;
uniform float uElapsedTime;
uniform float uEmitterDebug;
uniform vec4 uEmitterSeed;
uniform sampler2D uVelocityMap;
uniform sampler2D uDyeMap;

varying vec2 vUv;

float dyeAmount(vec4 dye) {
  return dot(dye.rgb, vec3(0.333)) + dye.a * 0.42;
}

vec4 sampleDye(vec2 uv) {
  return texture2D(uDyeMap, clamp(uv, vec2(0.001), vec2(0.999)));
}

float roundedBoxSdf(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float widgetMask(vec2 uv, float aspectRatio) {
  float active = step(0.0, uWidgetRect.z) * step(0.0, uWidgetRect.w);
  vec2 rectMin = uWidgetRect.xy;
  vec2 rectMax = uWidgetRect.zw;
  vec2 rectCenter = (rectMin + rectMax) * 0.5;
  vec2 rectHalf = max((rectMax - rectMin) * 0.5 - vec2(0.01, 0.014), vec2(0.001));
  vec2 p = vec2((uv.x - rectCenter.x) * aspectRatio, uv.y - rectCenter.y);
  vec2 halfSize = vec2(rectHalf.x * aspectRatio, rectHalf.y);
  float radius = min(0.03, min(halfSize.x, halfSize.y) * 0.4);
  float sdf = roundedBoxSdf(p, halfSize, radius);
  return active * (1.0 - smoothstep(-0.003, 0.006, sdf));
}

vec3 oppositeHue(vec3 color) {
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  vec3 chroma = color - vec3(luma);
  return clamp(vec3(luma) - chroma * 1.08, vec3(0.0), vec3(0.56));
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  value += valueNoise(p) * 0.5;
  p = p * 2.03 + 17.11;
  value += valueNoise(p) * 0.3;
  p = p * 2.01 + 31.73;
  value += valueNoise(p) * 0.2;
  return value;
}

float weatherCenter(float t, float phase) {
  float drift = fbm(vec2(t * 0.42 + phase, phase * 1.91));
  float wander = fbm(vec2(t * 0.17 + phase * 2.7, 8.4 + phase));
  float wave = sin(t * 0.31 + phase + drift * 6.28318);
  return clamp(0.5 + wave * 0.36 + (wander - 0.5) * 0.28, 0.08, 0.92);
}

float weatherSideY(float t, float phase) {
  float drift = fbm(vec2(t * 0.33 + phase, phase * 2.41));
  float wander = fbm(vec2(t * 0.19 + phase * 2.2, 13.7 + phase));
  float wave = sin(t * 0.27 + phase + drift * 6.28318);
  return clamp(0.5 + wave * 0.32 + (wander - 0.5) * 0.24, 0.12, 0.88);
}

float bottomTrackY(float t, float phase) {
  float drift = fbm(vec2(t * 0.28 + phase, phase * 2.17));
  float wave = sin(t * 0.38 + phase + drift * 6.28318);
  return clamp(0.026 + wave * 0.018 + (drift - 0.5) * 0.024, 0.0, 0.064);
}

float rightTrackX(float t, float phase) {
  float drift = fbm(vec2(t * 0.3 + phase, phase * 1.73));
  float wave = sin(t * 0.34 + phase + drift * 6.28318);
  return clamp(0.974 + wave * 0.015 + (drift - 0.5) * 0.012, 0.946, 0.992);
}

float debugEmitter(vec2 uv, float center, float originY, float strength, float width, float aspect) {
  float x = (uv.x - center) * aspect;
  float y = uv.y - originY;
  float baseDistance = length(vec2(x / max(width, 0.0001), (y - 0.052) / 0.024));
  float baseDot = (1.0 - smoothstep(0.82, 1.0, baseDistance)) * (0.36 + strength * 0.64);
  float ring = smoothstep(1.32, 1.08, baseDistance) * smoothstep(0.72, 1.0, baseDistance);
  float upward = max(y, 0.0);
  float columnWidth = mix(width * 0.9, width * 4.8, smoothstep(0.0, 0.62, upward));
  float column = exp(-(x * x) / max(columnWidth * columnWidth, 0.0001)) * smoothstep(0.62, 0.02, upward) * smoothstep(0.025, 0.16, upward);
  float guide = (1.0 - smoothstep(0.0025, 0.009, abs(uv.x - center))) * smoothstep(0.72, 0.05, upward);
  return baseDot * 1.2 + ring * 1.05 + column * strength * 0.72 + guide * (0.18 + strength * 0.26);
}

float debugSideEmitter(vec2 uv, float originX, float centerY, float strength, float height, float aspect) {
  vec2 p = vec2((uv.x - originX) * aspect, uv.y - centerY);
  float baseDistance = length(vec2(p.x / 0.028, p.y / max(height, 0.0001)));
  float baseDot = (1.0 - smoothstep(0.82, 1.0, baseDistance)) * (0.36 + strength * 0.64);
  float ring = (1.0 - smoothstep(1.08, 1.32, baseDistance)) * smoothstep(0.72, 1.0, baseDistance);
  float inward = max(0.0, originX - uv.x);
  float spread = height + inward * 0.46;
  float edgeFade = 1.0 - smoothstep(0.02, 0.72, inward);
  float column = exp(-((uv.y - centerY) * (uv.y - centerY)) / max(spread * spread, 0.0001)) * exp(-(inward * inward) / (0.34 * 0.34)) * edgeFade;
  float guide = (1.0 - smoothstep(0.0025, 0.009, abs(uv.y - centerY))) * smoothstep(0.55, originX, uv.x);
  return baseDot * 1.2 + ring * 1.05 + column * strength * 0.72 + guide * (0.18 + strength * 0.26);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 fluidVelocity = texture2D(uVelocityMap, uv).rg * 2.0 - 1.0;
  vec4 dye = sampleDye(uv);
  vec2 layerDrift = clamp(fluidVelocity * vec2(0.018, 0.014), vec2(-0.025), vec2(0.025));
  vec4 nearDye = sampleDye(uv - layerDrift + vec2(0.006, -0.004));
  vec4 farDye = sampleDye(uv + layerDrift * 0.72 + vec2(-0.012, 0.018));
  float fluidDye = dyeAmount(dye);
  float nearDensity = dyeAmount(nearDye);
  float farDensity = dyeAmount(farDye);
  float layeredDensity = clamp(fluidDye * 0.62 + nearDensity * 0.27 + farDensity * 0.18, 0.0, 1.0);
  vec3 layeredSmoke = dye.rgb * 1.0 + nearDye.rgb * 0.42 + farDye.rgb * 0.26;
  float dyeRight = dyeAmount(sampleDye(uv + vec2(uFluidTexel.x, 0.0)));
  float dyeUp = dyeAmount(sampleDye(uv + vec2(0.0, uFluidTexel.y)));
  vec2 dyeGradient = vec2(dyeRight - fluidDye, dyeUp - fluidDye);
  vec2 lightDirection = normalize(vec2(0.82, 0.42));
  float opticalDepth = 0.0;
  opticalDepth += dyeAmount(sampleDye(uv + lightDirection * 0.018)) * 0.34;
  opticalDepth += dyeAmount(sampleDye(uv + lightDirection * 0.043)) * 0.27;
  opticalDepth += dyeAmount(sampleDye(uv + lightDirection * 0.073)) * 0.21;
  opticalDepth += dyeAmount(sampleDye(uv + lightDirection * 0.11)) * 0.16;
  float transmittance = exp(-opticalDepth * 2.4);
  vec2 densityNormal = dyeGradient / max(length(dyeGradient), 0.0001);
  float rimLight = max(dot(densityNormal, lightDirection), 0.0) * smoothstep(0.016, 0.22, fluidDye);
  float innerScatter = layeredDensity * transmittance * smoothstep(0.018, 0.34, opticalDepth + layeredDensity * 0.45);
  float coreShadow = layeredDensity * (1.0 - transmittance) * 0.22;
  float speed = length(fluidVelocity * aspect);
  float haloDensity = 0.0;
  haloDensity += dyeAmount(sampleDye(uv - lightDirection * 0.052)) * 0.36;
  haloDensity += dyeAmount(sampleDye(uv - lightDirection * 0.092 + vec2(0.012, -0.006))) * 0.26;
  haloDensity += dyeAmount(sampleDye(uv - lightDirection * 0.14 + vec2(-0.018, 0.011))) * 0.2;
  haloDensity += dyeAmount(sampleDye(uv - lightDirection * 0.2)) * 0.14;
  float backGlow = smoothstep(0.01, 0.18, haloDensity) * (1.0 - smoothstep(0.62, 1.08, layeredDensity));
  float plumeGlow = smoothstep(0.012, 0.34, haloDensity + layeredDensity * 0.56);
  float edgeEnergy = smoothstep(0.002, 0.04, length(dyeGradient) * 9.0) * smoothstep(0.006, 0.18, layeredDensity);
  vec2 colorField = (uv - vec2(0.5)) * aspect;
  float paletteTime = uElapsedTime * 0.18;
  float greenField = pow(0.5 + 0.5 * sin(paletteTime + colorField.x * 1.35 - colorField.y * 0.76), 2.15);
  float violetField = pow(0.5 + 0.5 * sin(paletteTime + 1.5708 - colorField.x * 0.68 + colorField.y * 1.18), 2.15);
  float yellowField = pow(0.5 + 0.5 * sin(paletteTime + 3.14159 + colorField.x * 1.08 + colorField.y * 0.48), 2.35);
  float redField = pow(0.5 + 0.5 * sin(paletteTime + 4.71239 - colorField.x * 1.24 - colorField.y * 0.38), 2.35);
  float paletteTotal = max(greenField + violetField + yellowField + redField, 0.0001);
  vec3 spatialPalette = (
    vec3(0.018, 0.44, 0.31) * greenField +
    vec3(0.32, 0.11, 0.62) * violetField +
    vec3(0.54, 0.38, 0.09) * yellowField +
    vec3(0.34, 0.08, 0.07) * redField
  ) / paletteTotal;
  float cyclePhase = mod(uElapsedTime * 0.055, 4.0);
  float cycleGreen = smoothstep(1.0, 0.0, min(abs(cyclePhase), abs(cyclePhase - 4.0)));
  float cycleViolet = smoothstep(1.0, 0.0, abs(cyclePhase - 1.0));
  float cycleYellow = smoothstep(1.0, 0.0, abs(cyclePhase - 2.0));
  float cycleRed = smoothstep(1.0, 0.0, abs(cyclePhase - 3.0));
  float cycleTotal = max(cycleGreen + cycleViolet + cycleYellow + cycleRed, 0.0001);
  vec3 cyclePalette = (
    vec3(0.018, 0.44, 0.31) * cycleGreen +
    vec3(0.32, 0.11, 0.62) * cycleViolet +
    vec3(0.54, 0.38, 0.09) * cycleYellow +
    vec3(0.34, 0.08, 0.07) * cycleRed
  ) / cycleTotal;
  vec3 gradientPalette = mix(spatialPalette, cyclePalette, 0.58);
  float paletteMask = smoothstep(0.02, 0.42, haloDensity + layeredDensity * 0.52) * (0.45 + plumeGlow * 0.55);
  float caustic = smoothstep(0.009, 0.105, length(dyeGradient) * 7.5 + dye.a * 0.38);
  vec3 lightColor = vec3(0.08, 0.32, 0.28);
  vec3 rimColor = vec3(0.11, 0.46, 0.38);
  vec3 backGlowColor = vec3(0.04, 0.32, 0.24) * backGlow * 1.35 + vec3(0.09, 0.38, 0.28) * plumeGlow * 0.3;
  vec3 paletteGlow = gradientPalette * paletteMask * (0.22 + backGlow * 0.38 + edgeEnergy * 0.16);
  vec3 dyeColor = layeredSmoke * 1.46 + vec3(0.018, 0.175, 0.15) * layeredDensity + gradientPalette * layeredDensity * 0.11 * paletteMask;
  vec3 velocityColor = vec3(0.012, 0.085, 0.075) * smoothstep(0.012, 0.22, speed);
  vec3 causticColor = vec3(0.026, 0.16, 0.14) * caustic;
  vec3 volumeColor = lightColor * innerScatter * 0.34 + rimColor * rimLight * 0.14 + backGlowColor + paletteGlow;
  vec3 color = dyeColor + velocityColor + causticColor + volumeColor;
  color *= 1.0 - coreShadow;
  color = color / (vec3(1.0) + color * 1.95);
  color = clamp(color, vec3(0.0), vec3(0.48));
  float alpha = clamp(layeredDensity * 1.08 + caustic * 0.2 + innerScatter * 0.1 + backGlow * 0.12 + edgeEnergy * 0.038 + smoothstep(0.018, 0.28, speed) * 0.14, 0.0, 0.62);
  float panelSmokeMask = widgetMask(uv, aspect.x) * smoothstep(0.018, 0.38, layeredDensity + haloDensity * 0.42);
  vec3 panelOppositeColor = oppositeHue(color) + vec3(0.028, 0.004, 0.036) * panelSmokeMask;
  color = mix(color, panelOppositeColor, panelSmokeMask * 0.78);
  alpha = clamp(alpha + panelSmokeMask * 0.035, 0.0, 0.64);

  float weatherTime = uElapsedTime * 0.72;
  float centerA = clamp(weatherCenter(weatherTime + uEmitterSeed.x * 17.0, 0.2 + uEmitterSeed.x * 6.28318) + (uEmitterSeed.x - 0.5) * 0.12, 0.08, 0.92);
  float centerB = clamp(weatherCenter(weatherTime * 0.86 + 9.0 + uEmitterSeed.y * 19.0, 2.6 + uEmitterSeed.y * 6.28318) + (uEmitterSeed.y - 0.5) * 0.12, 0.08, 0.92);
  float liftA = bottomTrackY(weatherTime * 0.92 + uEmitterSeed.x * 11.0, 1.4 + uEmitterSeed.x * 5.0);
  float liftB = bottomTrackY(weatherTime * 0.78 + uEmitterSeed.y * 13.0, 4.7 + uEmitterSeed.y * 5.0);
  float sideY = weatherSideY(weatherTime * 1.08 + 17.0 + uEmitterSeed.z * 23.0, 5.1 + uEmitterSeed.z * 6.28318);
  float sideX = rightTrackX(weatherTime * 0.82 + uEmitterSeed.z * 17.0, 2.2 + uEmitterSeed.w * 6.28318);
  float strengthA = smoothstep(0.18, 0.86, fbm(vec2(weatherTime * 0.58 + 1.3 + uEmitterSeed.x * 8.0, 2.0 + uEmitterSeed.x * 5.0)));
  float strengthB = smoothstep(0.22, 0.88, fbm(vec2(weatherTime * 0.52 + 8.7 + uEmitterSeed.y * 8.0, 5.0 + uEmitterSeed.y * 5.0)));
  float strengthC = smoothstep(0.26, 0.9, fbm(vec2(weatherTime * 0.64 + 15.4 + uEmitterSeed.z * 8.0, 9.0 + uEmitterSeed.z * 5.0)));
  float sideStrength = 0.72 + strengthC * 0.72;
  float debugA = debugEmitter(uv, centerA, liftA, strengthA, 0.042, aspect.x);
  float debugB = debugEmitter(uv, centerB, liftB, strengthB * 0.82, 0.052, aspect.x);
  float debugC = debugSideEmitter(uv, sideX, sideY, sideStrength * 0.54, 0.048, aspect.x);
  vec3 debugColor = vec3(0.28, 0.95, 0.82) * debugA;
  debugColor += vec3(0.42, 0.78, 1.0) * debugB;
  debugColor += vec3(0.95, 0.78, 0.34) * debugC;
  float debugAlpha = clamp((debugA + debugB + debugC) * 0.92, 0.0, 0.92) * uEmitterDebug;
  color = mix(color, clamp(color + debugColor * 0.9, vec3(0.0), vec3(0.78)), debugAlpha);
  alpha = max(alpha, debugAlpha);

  gl_FragColor = vec4(color, alpha);
}
`;

function AuroraBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCursorFluidEnabled, setIsCursorFluidEnabled] = useState(false);
  const cursorFluidEnabledRef = useRef(isCursorFluidEnabled);
  const emitterDebugVisibleRef = useRef(false);

  useEffect(() => {
    cursorFluidEnabledRef.current = isCursorFluidEnabled;
  }, [isCursorFluidEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'low-power',
      premultipliedAlpha: false,
      stencil: false,
    });

    if (!canvas || !gl) {
      return;
    }

    type FluidTarget = {
      framebuffer: WebGLFramebuffer;
      height: number;
      texture: WebGLTexture;
      width: number;
    };

    type FluidTextureConfig = {
      filter: number;
      type: number;
    };

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);

      if (!shader) {
        return null;
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const createProgram = (fragmentSource: string) => {
      const vertexShader = compileShader(gl.VERTEX_SHADER, AURORA_VERTEX_SHADER);
      const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

      if (!vertexShader || !fragmentShader) {
        if (vertexShader) {
          gl.deleteShader(vertexShader);
        }

        if (fragmentShader) {
          gl.deleteShader(fragmentShader);
        }

        return null;
      }

      const program = gl.createProgram();

      if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
      }

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }

      return program;
    };

    const renderProgram = createProgram(FLUID_RENDER_FRAGMENT_SHADER);
    const velocityProgram = createProgram(FLUID_VELOCITY_FRAGMENT_SHADER);
    const curlProgram = createProgram(FLUID_CURL_FRAGMENT_SHADER);
    const vorticityProgram = createProgram(FLUID_VORTICITY_FRAGMENT_SHADER);
    const divergenceProgram = createProgram(FLUID_DIVERGENCE_FRAGMENT_SHADER);
    const pressureProgram = createProgram(FLUID_PRESSURE_FRAGMENT_SHADER);
    const gradientProgram = createProgram(FLUID_GRADIENT_FRAGMENT_SHADER);
    const dyeProgram = createProgram(FLUID_DYE_FRAGMENT_SHADER);
    const deletePrograms = () => {
      [renderProgram, velocityProgram, curlProgram, vorticityProgram, divergenceProgram, pressureProgram, gradientProgram, dyeProgram].forEach((program) => {
        if (program) {
          gl.deleteProgram(program);
        }
      });
    };

    if (!renderProgram || !velocityProgram || !curlProgram || !vorticityProgram || !divergenceProgram || !pressureProgram || !gradientProgram || !dyeProgram) {
      deletePrograms();
      return;
    }

    const quadBuffer = gl.createBuffer();

    if (!quadBuffer) {
      deletePrograms();
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const bindQuad = (targetProgram: WebGLProgram) => {
      const positionLocation = gl.getAttribLocation(targetProgram, 'aPosition');

      if (positionLocation < 0) {
        return;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    };

    const renderUniforms = {
      resolution: gl.getUniformLocation(renderProgram, 'uResolution'),
      fluidTexel: gl.getUniformLocation(renderProgram, 'uFluidTexel'),
      widgetRect: gl.getUniformLocation(renderProgram, 'uWidgetRect'),
      elapsedTime: gl.getUniformLocation(renderProgram, 'uElapsedTime'),
      emitterDebug: gl.getUniformLocation(renderProgram, 'uEmitterDebug'),
      emitterSeed: gl.getUniformLocation(renderProgram, 'uEmitterSeed'),
      velocityMap: gl.getUniformLocation(renderProgram, 'uVelocityMap'),
      dyeMap: gl.getUniformLocation(renderProgram, 'uDyeMap'),
    };
    const velocityUniforms = {
      velocityMap: gl.getUniformLocation(velocityProgram, 'uVelocityMap'),
      dyeMap: gl.getUniformLocation(velocityProgram, 'uDyeMap'),
      texel: gl.getUniformLocation(velocityProgram, 'uTexel'),
      pointerPosition: gl.getUniformLocation(velocityProgram, 'uPointerPosition'),
      pointerVelocity: gl.getUniformLocation(velocityProgram, 'uPointerVelocity'),
      pointerActive: gl.getUniformLocation(velocityProgram, 'uPointerActive'),
      pointerRadius: gl.getUniformLocation(velocityProgram, 'uPointerRadius'),
      deltaTime: gl.getUniformLocation(velocityProgram, 'uDeltaTime'),
      elapsedTime: gl.getUniformLocation(velocityProgram, 'uElapsedTime'),
      aspect: gl.getUniformLocation(velocityProgram, 'uAspect'),
      emitterSeed: gl.getUniformLocation(velocityProgram, 'uEmitterSeed'),
    };
    const curlUniforms = {
      velocityMap: gl.getUniformLocation(curlProgram, 'uVelocityMap'),
      texel: gl.getUniformLocation(curlProgram, 'uTexel'),
      aspect: gl.getUniformLocation(curlProgram, 'uAspect'),
    };
    const vorticityUniforms = {
      velocityMap: gl.getUniformLocation(vorticityProgram, 'uVelocityMap'),
      curlMap: gl.getUniformLocation(vorticityProgram, 'uCurlMap'),
      texel: gl.getUniformLocation(vorticityProgram, 'uTexel'),
      deltaTime: gl.getUniformLocation(vorticityProgram, 'uDeltaTime'),
      strength: gl.getUniformLocation(vorticityProgram, 'uStrength'),
      aspect: gl.getUniformLocation(vorticityProgram, 'uAspect'),
    };
    const divergenceUniforms = {
      velocityMap: gl.getUniformLocation(divergenceProgram, 'uVelocityMap'),
      texel: gl.getUniformLocation(divergenceProgram, 'uTexel'),
      obstacleRect: gl.getUniformLocation(divergenceProgram, 'uObstacleRect'),
      aspect: gl.getUniformLocation(divergenceProgram, 'uAspect'),
    };
    const pressureUniforms = {
      pressureMap: gl.getUniformLocation(pressureProgram, 'uPressureMap'),
      divergenceMap: gl.getUniformLocation(pressureProgram, 'uDivergenceMap'),
      texel: gl.getUniformLocation(pressureProgram, 'uTexel'),
      obstacleRect: gl.getUniformLocation(pressureProgram, 'uObstacleRect'),
      aspect: gl.getUniformLocation(pressureProgram, 'uAspect'),
    };
    const gradientUniforms = {
      velocityMap: gl.getUniformLocation(gradientProgram, 'uVelocityMap'),
      pressureMap: gl.getUniformLocation(gradientProgram, 'uPressureMap'),
      texel: gl.getUniformLocation(gradientProgram, 'uTexel'),
      obstacleRect: gl.getUniformLocation(gradientProgram, 'uObstacleRect'),
      aspect: gl.getUniformLocation(gradientProgram, 'uAspect'),
    };
    const dyeUniforms = {
      velocityMap: gl.getUniformLocation(dyeProgram, 'uVelocityMap'),
      dyeMap: gl.getUniformLocation(dyeProgram, 'uDyeMap'),
      pointerPosition: gl.getUniformLocation(dyeProgram, 'uPointerPosition'),
      pointerVelocity: gl.getUniformLocation(dyeProgram, 'uPointerVelocity'),
      pointerActive: gl.getUniformLocation(dyeProgram, 'uPointerActive'),
      pointerRadius: gl.getUniformLocation(dyeProgram, 'uPointerRadius'),
      deltaTime: gl.getUniformLocation(dyeProgram, 'uDeltaTime'),
      elapsedTime: gl.getUniformLocation(dyeProgram, 'uElapsedTime'),
      aspect: gl.getUniformLocation(dyeProgram, 'uAspect'),
      emitterSeed: gl.getUniformLocation(dyeProgram, 'uEmitterSeed'),
    };

    const canRenderToTextureType = (type: number) => {
      const texture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();

      if (!texture || !framebuffer) {
        if (texture) {
          gl.deleteTexture(texture);
        }

        if (framebuffer) {
          gl.deleteFramebuffer(framebuffer);
        }

        return false;
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, type, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      const isComplete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
      return isComplete;
    };

    const getFluidTextureConfig = (): FluidTextureConfig => {
      const halfFloatExtension = gl.getExtension('OES_texture_half_float');
      const halfFloatLinearExtension = gl.getExtension('OES_texture_half_float_linear');
      gl.getExtension('EXT_color_buffer_half_float');

      if (halfFloatExtension && halfFloatLinearExtension && canRenderToTextureType(halfFloatExtension.HALF_FLOAT_OES)) {
        return {
          filter: gl.LINEAR,
          type: halfFloatExtension.HALF_FLOAT_OES,
        };
      }

      const floatExtension = gl.getExtension('OES_texture_float');
      const floatLinearExtension = gl.getExtension('OES_texture_float_linear');
      gl.getExtension('WEBGL_color_buffer_float');

      if (floatExtension && floatLinearExtension && canRenderToTextureType(gl.FLOAT)) {
        return {
          filter: gl.LINEAR,
          type: gl.FLOAT,
        };
      }

      return {
        filter: gl.LINEAR,
        type: gl.UNSIGNED_BYTE,
      };
    };

    const fluidTextureConfig = getFluidTextureConfig();

    const createFluidTarget = (width: number, height: number, clearColor: [number, number, number, number]): FluidTarget | null => {
      const texture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();

      if (!texture || !framebuffer) {
        if (texture) {
          gl.deleteTexture(texture);
        }

        if (framebuffer) {
          gl.deleteFramebuffer(framebuffer);
        }

        return null;
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, fluidTextureConfig.filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, fluidTextureConfig.filter);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, fluidTextureConfig.type, null);

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(framebuffer);
        return null;
      }

      gl.viewport(0, 0, width, height);
      gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      return {framebuffer, height, texture, width};
    };

    const clearFluidTarget = (target: FluidTarget, clearColor: [number, number, number, number]) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, target.width, target.height);
      gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const deleteFluidTarget = (target: FluidTarget) => {
      gl.deleteFramebuffer(target.framebuffer);
      gl.deleteTexture(target.texture);
    };

    const getFluidSize = (): [number, number] => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.3);
      const width = Math.max(120, Math.min(340, Math.floor((window.innerWidth * pixelRatio) / 5)));
      const height = Math.max(80, Math.min(220, Math.floor((window.innerHeight * pixelRatio) / 5)));

      return [width, height];
    };

    let animationFrame = 0;
    let disposed = false;
    let velocityTargets: [FluidTarget, FluidTarget] | null = null;
    let pressureTargets: [FluidTarget, FluidTarget] | null = null;
    let dyeTargets: [FluidTarget, FluidTarget] | null = null;
    let divergenceTarget: FluidTarget | null = null;
    let curlTarget: FluidTarget | null = null;
    let velocityReadIndex = 0;
    let pressureReadIndex = 0;
    let dyeReadIndex = 0;
    const startedAt = performance.now();
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const inactiveObstacleRect: [number, number, number, number] = [-1, -1, -1, -1];
    let pointerPosition: [number, number] = [0.5, 0.5];
    let pointerVelocity: [number, number] = [0, 0];
    let pointerActive = 0;
    let lastPointerPosition: [number, number] | null = null;
    let lastPointerTime = startedAt;

    const ensureFluidTargets = () => {
      const [width, height] = getFluidSize();

      if (velocityTargets?.[0].width === width && velocityTargets[0].height === height) {
        return true;
      }

      velocityTargets?.forEach(deleteFluidTarget);
      pressureTargets?.forEach(deleteFluidTarget);
      dyeTargets?.forEach(deleteFluidTarget);
      if (divergenceTarget) {
        deleteFluidTarget(divergenceTarget);
      }
      if (curlTarget) {
        deleteFluidTarget(curlTarget);
      }

      const nextVelocityTargets: [FluidTarget | null, FluidTarget | null] = [
        createFluidTarget(width, height, [0.5, 0.5, 0, 1]),
        createFluidTarget(width, height, [0.5, 0.5, 0, 1]),
      ];
      const nextPressureTargets: [FluidTarget | null, FluidTarget | null] = [
        createFluidTarget(width, height, [0.5, 0, 0, 1]),
        createFluidTarget(width, height, [0.5, 0, 0, 1]),
      ];
      const nextDyeTargets: [FluidTarget | null, FluidTarget | null] = [
        createFluidTarget(width, height, [0, 0, 0, 0]),
        createFluidTarget(width, height, [0, 0, 0, 0]),
      ];
      const nextDivergenceTarget = createFluidTarget(width, height, [0.5, 0, 0, 1]);
      const nextCurlTarget = createFluidTarget(width, height, [0.5, 0, 0, 1]);
      const createdTargets = [...nextVelocityTargets, ...nextPressureTargets, ...nextDyeTargets, nextDivergenceTarget, nextCurlTarget];

      if (createdTargets.some((target) => !target)) {
        createdTargets.forEach((target) => {
          if (target) {
            deleteFluidTarget(target);
          }
        });
        velocityTargets = null;
        pressureTargets = null;
        dyeTargets = null;
        divergenceTarget = null;
        curlTarget = null;
        return false;
      }

      velocityTargets = nextVelocityTargets as [FluidTarget, FluidTarget];
      pressureTargets = nextPressureTargets as [FluidTarget, FluidTarget];
      dyeTargets = nextDyeTargets as [FluidTarget, FluidTarget];
      divergenceTarget = nextDivergenceTarget;
      curlTarget = nextCurlTarget;
      velocityReadIndex = 0;
      pressureReadIndex = 0;
      dyeReadIndex = 0;
      return true;
    };

    let lastFrameTime = startedAt;
    const fluidTimeScale = 0.5;
    const emitterSeed: [number, number, number, number] = [
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
    ];

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.3);
      const width = Math.max(1, Math.floor(window.innerWidth * pixelRatio));
      const height = Math.max(1, Math.floor(window.innerHeight * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.useProgram(renderProgram);
      gl.uniform2f(renderUniforms.resolution, width, height);
      ensureFluidTargets();
    };

    const updatePointerDecay = (frameSeconds: number) => {
      const frameScale = frameSeconds * 60;
      pointerActive *= Math.pow(0.9, frameScale);
      pointerVelocity = [
        pointerVelocity[0] * Math.pow(0.94, frameScale),
        pointerVelocity[1] * Math.pow(0.94, frameScale),
      ];
    };

    const updatePointerFromEvent = (event: PointerEvent) => {
      if (!cursorFluidEnabledRef.current || event.pointerType === 'touch') {
        return;
      }

      const viewportWidth = Math.max(window.innerWidth, 1);
      const viewportHeight = Math.max(window.innerHeight, 1);
      const nextPosition: [number, number] = [
        Math.max(0, Math.min(1, event.clientX / viewportWidth)),
        Math.max(0, Math.min(1, 1 - event.clientY / viewportHeight)),
      ];
      const now = performance.now();
      const frameSeconds = Math.max((now - lastPointerTime) / 1000, 1 / 120);

      if (lastPointerPosition) {
        const targetVelocity: [number, number] = [
          Math.max(-7.5, Math.min(7.5, (nextPosition[0] - lastPointerPosition[0]) / frameSeconds)),
          Math.max(-7.5, Math.min(7.5, (nextPosition[1] - lastPointerPosition[1]) / frameSeconds)),
        ];
        pointerVelocity = [
          pointerVelocity[0] + (targetVelocity[0] - pointerVelocity[0]) * 0.74,
          pointerVelocity[1] + (targetVelocity[1] - pointerVelocity[1]) * 0.74,
        ];
      }

      pointerPosition = nextPosition;
      lastPointerPosition = nextPosition;
      lastPointerTime = now;
      pointerActive = Math.min(1, pointerActive + 0.92);

      if (reducedMotionQuery.matches) {
        drawFrame(now);
      }
    };

    const getTimelineWidgetRect = (): [number, number, number, number] => {
      const viewportWidth = Math.max(window.innerWidth, 1);
      const viewportHeight = Math.max(window.innerHeight, 1);
      const widgets = Array.from(document.querySelectorAll<HTMLElement>('.timeline-fluid-obstacle'));
      const visibleWidget = widgets.find((widget) => {
        const rect = widget.getBoundingClientRect();
        const style = window.getComputedStyle(widget);

        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 1 &&
          rect.height > 1 &&
          rect.bottom > 0 &&
          rect.top < viewportHeight &&
          rect.right > 0 &&
          rect.left < viewportWidth
        );
      });

      if (!visibleWidget) {
        return [-1, -1, -1, -1];
      }

      const rect = visibleWidget.getBoundingClientRect();
      return [
        Math.max(0, Math.min(1, rect.left / viewportWidth)),
        Math.max(0, Math.min(1, 1 - rect.bottom / viewportHeight)),
        Math.max(0, Math.min(1, rect.right / viewportWidth)),
        Math.max(0, Math.min(1, 1 - rect.top / viewportHeight)),
      ];
    };

    const stepFluid = (frameSeconds: number, elapsedSeconds: number) => {
      if (!velocityTargets || !pressureTargets || !dyeTargets || !divergenceTarget || !curlTarget) {
        return;
      }

      const aspect = canvas.width / Math.max(canvas.height, 1);
      let velocityReadTarget = velocityTargets[velocityReadIndex];
      let velocityWriteTarget = velocityTargets[1 - velocityReadIndex];
      const currentDyeTarget = dyeTargets[dyeReadIndex];
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocityWriteTarget.framebuffer);
      gl.viewport(0, 0, velocityWriteTarget.width, velocityWriteTarget.height);
      gl.useProgram(velocityProgram);
      bindQuad(velocityProgram);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocityReadTarget.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, currentDyeTarget.texture);

      gl.uniform1i(velocityUniforms.velocityMap, 0);
      gl.uniform1i(velocityUniforms.dyeMap, 1);
      gl.uniform2f(velocityUniforms.texel, 1 / velocityReadTarget.width, 1 / velocityReadTarget.height);
      gl.uniform2f(velocityUniforms.pointerPosition, pointerPosition[0], pointerPosition[1]);
      gl.uniform2f(velocityUniforms.pointerVelocity, pointerVelocity[0], pointerVelocity[1]);
      gl.uniform1f(velocityUniforms.pointerActive, cursorFluidEnabledRef.current ? pointerActive : 0);
      gl.uniform1f(velocityUniforms.pointerRadius, 0.088);
      gl.uniform1f(velocityUniforms.deltaTime, frameSeconds);
      gl.uniform1f(velocityUniforms.elapsedTime, elapsedSeconds);
      gl.uniform1f(velocityUniforms.aspect, aspect);
      gl.uniform4f(velocityUniforms.emitterSeed, emitterSeed[0], emitterSeed[1], emitterSeed[2], emitterSeed[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      velocityReadIndex = 1 - velocityReadIndex;
      velocityReadTarget = velocityTargets[velocityReadIndex];

      gl.bindFramebuffer(gl.FRAMEBUFFER, curlTarget.framebuffer);
      gl.viewport(0, 0, curlTarget.width, curlTarget.height);
      gl.useProgram(curlProgram);
      bindQuad(curlProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocityReadTarget.texture);
      gl.uniform1i(curlUniforms.velocityMap, 0);
      gl.uniform2f(curlUniforms.texel, 1 / velocityReadTarget.width, 1 / velocityReadTarget.height);
      gl.uniform1f(curlUniforms.aspect, aspect);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      velocityWriteTarget = velocityTargets[1 - velocityReadIndex];
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocityWriteTarget.framebuffer);
      gl.viewport(0, 0, velocityWriteTarget.width, velocityWriteTarget.height);
      gl.useProgram(vorticityProgram);
      bindQuad(vorticityProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocityReadTarget.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, curlTarget.texture);
      gl.uniform1i(vorticityUniforms.velocityMap, 0);
      gl.uniform1i(vorticityUniforms.curlMap, 1);
      gl.uniform2f(vorticityUniforms.texel, 1 / velocityReadTarget.width, 1 / velocityReadTarget.height);
      gl.uniform1f(vorticityUniforms.deltaTime, frameSeconds * 0.25);
      gl.uniform1f(vorticityUniforms.strength, 13.0);
      gl.uniform1f(vorticityUniforms.aspect, aspect);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      velocityReadIndex = 1 - velocityReadIndex;
      velocityReadTarget = velocityTargets[velocityReadIndex];

      gl.bindFramebuffer(gl.FRAMEBUFFER, divergenceTarget.framebuffer);
      gl.viewport(0, 0, divergenceTarget.width, divergenceTarget.height);
      gl.useProgram(divergenceProgram);
      bindQuad(divergenceProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocityReadTarget.texture);
      gl.uniform1i(divergenceUniforms.velocityMap, 0);
      gl.uniform2f(divergenceUniforms.texel, 1 / velocityReadTarget.width, 1 / velocityReadTarget.height);
      gl.uniform4f(divergenceUniforms.obstacleRect, inactiveObstacleRect[0], inactiveObstacleRect[1], inactiveObstacleRect[2], inactiveObstacleRect[3]);
      gl.uniform1f(divergenceUniforms.aspect, aspect);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      pressureTargets.forEach((target) => clearFluidTarget(target, [0.5, 0, 0, 1]));
      pressureReadIndex = 0;
      for (let iteration = 0; iteration < 12; iteration += 1) {
        const pressureReadTarget = pressureTargets[pressureReadIndex];
        const pressureWriteTarget = pressureTargets[1 - pressureReadIndex];
        gl.bindFramebuffer(gl.FRAMEBUFFER, pressureWriteTarget.framebuffer);
        gl.viewport(0, 0, pressureWriteTarget.width, pressureWriteTarget.height);
        gl.useProgram(pressureProgram);
        bindQuad(pressureProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, pressureReadTarget.texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, divergenceTarget.texture);
        gl.uniform1i(pressureUniforms.pressureMap, 0);
        gl.uniform1i(pressureUniforms.divergenceMap, 1);
        gl.uniform2f(pressureUniforms.texel, 1 / pressureReadTarget.width, 1 / pressureReadTarget.height);
        gl.uniform4f(pressureUniforms.obstacleRect, inactiveObstacleRect[0], inactiveObstacleRect[1], inactiveObstacleRect[2], inactiveObstacleRect[3]);
        gl.uniform1f(pressureUniforms.aspect, aspect);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        pressureReadIndex = 1 - pressureReadIndex;
      }

      velocityWriteTarget = velocityTargets[1 - velocityReadIndex];
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocityWriteTarget.framebuffer);
      gl.viewport(0, 0, velocityWriteTarget.width, velocityWriteTarget.height);
      gl.useProgram(gradientProgram);
      bindQuad(gradientProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocityReadTarget.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, pressureTargets[pressureReadIndex].texture);
      gl.uniform1i(gradientUniforms.velocityMap, 0);
      gl.uniform1i(gradientUniforms.pressureMap, 1);
      gl.uniform2f(gradientUniforms.texel, 1 / velocityReadTarget.width, 1 / velocityReadTarget.height);
      gl.uniform4f(gradientUniforms.obstacleRect, inactiveObstacleRect[0], inactiveObstacleRect[1], inactiveObstacleRect[2], inactiveObstacleRect[3]);
      gl.uniform1f(gradientUniforms.aspect, aspect);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      velocityReadIndex = 1 - velocityReadIndex;
      velocityReadTarget = velocityTargets[velocityReadIndex];

      const dyeReadTarget = dyeTargets[dyeReadIndex];
      const dyeWriteTarget = dyeTargets[1 - dyeReadIndex];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dyeWriteTarget.framebuffer);
      gl.viewport(0, 0, dyeWriteTarget.width, dyeWriteTarget.height);
      gl.useProgram(dyeProgram);
      bindQuad(dyeProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocityReadTarget.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, dyeReadTarget.texture);
      gl.uniform1i(dyeUniforms.velocityMap, 0);
      gl.uniform1i(dyeUniforms.dyeMap, 1);
      gl.uniform2f(dyeUniforms.pointerPosition, pointerPosition[0], pointerPosition[1]);
      gl.uniform2f(dyeUniforms.pointerVelocity, pointerVelocity[0], pointerVelocity[1]);
      gl.uniform1f(dyeUniforms.pointerActive, cursorFluidEnabledRef.current ? pointerActive : 0);
      gl.uniform1f(dyeUniforms.pointerRadius, 0.088);
      gl.uniform1f(dyeUniforms.deltaTime, frameSeconds);
      gl.uniform1f(dyeUniforms.elapsedTime, elapsedSeconds);
      gl.uniform1f(dyeUniforms.aspect, aspect);
      gl.uniform4f(dyeUniforms.emitterSeed, emitterSeed[0], emitterSeed[1], emitterSeed[2], emitterSeed[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      dyeReadIndex = 1 - dyeReadIndex;
    };

    const renderFluid = (elapsedSeconds: number) => {
      if (!velocityTargets || !dyeTargets) {
        return;
      }

      const velocityTarget = velocityTargets[velocityReadIndex];
      const dyeTarget = dyeTargets[dyeReadIndex];
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(renderProgram);
      bindQuad(renderProgram);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocityTarget.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, dyeTarget.texture);

      gl.uniform1i(renderUniforms.velocityMap, 0);
      gl.uniform1i(renderUniforms.dyeMap, 1);
      gl.uniform2f(renderUniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(renderUniforms.fluidTexel, 1 / velocityTarget.width, 1 / velocityTarget.height);
      const widgetRect = getTimelineWidgetRect();
      gl.uniform4f(renderUniforms.widgetRect, widgetRect[0], widgetRect[1], widgetRect[2], widgetRect[3]);
      gl.uniform1f(renderUniforms.elapsedTime, elapsedSeconds);
      gl.uniform1f(renderUniforms.emitterDebug, emitterDebugVisibleRef.current ? 1 : 0);
      gl.uniform4f(renderUniforms.emitterSeed, emitterSeed[0], emitterSeed[1], emitterSeed[2], emitterSeed[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const drawFrame = (now: number) => {
      resize();
      const frameSeconds = Math.min(Math.max((now - lastFrameTime) / 1000, 1 / 120), 1 / 20);
      lastFrameTime = now;
      const elapsedSeconds = (now - startedAt) / 1000;
      const fluidFrameSeconds = frameSeconds * fluidTimeScale;
      const fluidElapsedSeconds = elapsedSeconds * fluidTimeScale;
      updatePointerDecay(frameSeconds);
      stepFluid(fluidFrameSeconds, fluidElapsedSeconds);
      renderFluid(fluidElapsedSeconds);
    };

    const render = (now: number) => {
      if (disposed) {
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
      if (document.hidden) {
        return;
      }
      drawFrame(now);
    };

    const start = () => {
      if (disposed) {
        return;
      }

      resize();
      drawFrame(startedAt + 1000);

      if (!reducedMotionQuery.matches) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', updatePointerFromEvent, {passive: true});
    start();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', updatePointerFromEvent);
      velocityTargets?.forEach(deleteFluidTarget);
      pressureTargets?.forEach(deleteFluidTarget);
      dyeTargets?.forEach(deleteFluidTarget);
      if (divergenceTarget) {
        deleteFluidTarget(divergenceTarget);
      }
      if (curlTarget) {
        deleteFluidTarget(curlTarget);
      }

      gl.deleteBuffer(quadBuffer);
      deletePrograms();
    };
  }, []);

  return (
    <>
      <div className="aurora-backdrop" aria-hidden="true">
      </div>
      <canvas
        ref={canvasRef}
        className="aurora-canvas"
        aria-hidden="true"
      />
      <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          aria-pressed={isCursorFluidEnabled}
          onClick={() => setIsCursorFluidEnabled((enabled) => !enabled)}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--edge)] bg-[rgba(8,11,16,0.82)] px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)] backdrop-blur-md transition duration-300 hover:border-[var(--edge-strong)] hover:text-[var(--ink)] active:scale-[0.98]"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isCursorFluidEnabled ? 'bg-[#4fb9a5]' : 'bg-[var(--muted)]'}`} />
          Fluid cursor {isCursorFluidEnabled ? 'On' : 'Off'}
        </button>
      </div>
    </>
  );
}

function TimelineEmptyState({
  boardView,
  hiddenCompanyCount,
  onShowHiddenCompanies,
}: {
  boardView: BoardView;
  hiddenCompanyCount: number;
  onShowHiddenCompanies: () => void;
}) {
  const hasHiddenCompanies = hiddenCompanyCount > 0;

  return (
    <div className="flex min-h-[18rem] items-center justify-center px-6 py-14">
      <div className="max-w-[34rem] text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] text-[var(--ink-soft)]">
          <Layers3 className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <p className="mt-5 text-lg font-semibold tracking-tight text-[var(--ink)]">
          {hasHiddenCompanies ? 'All visible companies are hidden' : `${boardView.label} has no releases yet`}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          {hasHiddenCompanies
            ? 'Show hidden companies or turn on another product line to repopulate the timeline.'
            : 'Add releases tagged to the selected product lines and the same timeline, summary cards, and recency markers will render here.'}
        </p>
        {hasHiddenCompanies ? (
          <button
            type="button"
            onClick={onShowHiddenCompanies}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--edge)] px-4 text-sm font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
            Show hidden companies
          </button>
        ) : null}
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

type ZoomHandler = (updater: (zoomLevel: number) => number) => void;
type TimelinePointerHandler = (event: React.PointerEvent<HTMLDivElement>) => void;
type CompanyMoveDirection = 'up' | 'down';
type CompanyMoveHandler = (companyId: string, direction: CompanyMoveDirection) => void;
type CompanyReorderHandler = (sourceCompanyId: string, targetCompanyId: string) => void;

type DesktopTimelineExperienceProps = {
  activeArticleSlug: string | null;
  boardView: BoardView;
  currentGlobalDay: number;
  draggedCompanyId: string | null;
  handlePointerDown: TimelinePointerHandler;
  handlePointerMove: TimelinePointerHandler;
  hiddenCompanyCount: number;
  handleZoomChange: ZoomHandler;
  isPanning: boolean;
  isZoomSliderActive: boolean;
  latestCompany: ProcessedCompany | null;
  maxDays: number;
  minZoom: number;
  maxZoom: number;
  maxSummaryQuietDays: number;
  modelExplorer: React.ReactNode;
  monthTicks: Tick[];
  onCompanyDragEnd: () => void;
  onCompanyDragStart: (companyId: string) => void;
  onCompanyHide: (companyId: string) => void;
  onCompanyMove: CompanyMoveHandler;
  onCompanyReorder: CompanyReorderHandler;
  onModelSelect: (slug: string) => void;
  onShowHiddenCompanies: () => void;
  onZoomSliderActiveChange: (isActive: boolean) => void;
  processedCompanies: ProcessedCompany[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  stopPanning: TimelinePointerHandler;
  summaryCompanies: ProcessedCompany[];
  timelineWidth: number;
  yearTicks: Tick[];
  zoom: number;
};

type MobileTimelineExperienceProps = {
  activeArticleSlug: string | null;
  boardView: BoardView;
  currentGlobalDay: number;
  draggedCompanyId: string | null;
  handleZoomChange: ZoomHandler;
  latestCompany: ProcessedCompany | null;
  hiddenCompanyCount: number;
  isZoomSliderActive: boolean;
  minZoom: number;
  maxZoom: number;
  maxDays: number;
  maxSummaryQuietDays: number;
  modelExplorer: React.ReactNode;
  monthTicks: Tick[];
  onCompanyDragEnd: () => void;
  onCompanyDragStart: (companyId: string) => void;
  onCompanyHide: (companyId: string) => void;
  onCompanyMove: CompanyMoveHandler;
  onCompanyReorder: CompanyReorderHandler;
  onModelSelect: (slug: string) => void;
  onShowHiddenCompanies: () => void;
  onZoomSliderActiveChange: (isActive: boolean) => void;
  processedCompanies: ProcessedCompany[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  timelineWidth: number;
  yearTicks: Tick[];
  zoom: number;
};

function DesktopTimelineExperience({
  activeArticleSlug,
  boardView,
  currentGlobalDay,
  draggedCompanyId,
  handlePointerDown,
  handlePointerMove,
  hiddenCompanyCount,
  handleZoomChange,
  isPanning,
  isZoomSliderActive,
  latestCompany,
  maxDays,
  minZoom,
  maxZoom,
  maxSummaryQuietDays,
  modelExplorer,
  monthTicks,
  onCompanyDragEnd,
  onCompanyDragStart,
  onCompanyHide,
  onCompanyMove,
  onCompanyReorder,
  onModelSelect,
  onShowHiddenCompanies,
  onZoomSliderActiveChange,
  processedCompanies,
  scrollContainerRef,
  stopPanning,
  summaryCompanies,
  timelineWidth,
  yearTicks,
  zoom,
}: DesktopTimelineExperienceProps) {
  const timelineMinHeight = getTimelineMinHeight(processedCompanies);
  const shouldFreezeTimelineSizing = isPanning || isZoomSliderActive;

  return (
    <>
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
                Mapping major AI progress across time
              </h1>
              <p className="max-w-[68ch] text-base leading-relaxed text-[var(--ink-soft)] md:text-lg">
                {boardView.isDefault
                  ? 'Explore important AI milestones across frontier models, open systems, generative media, coding tools, events, robotics, vehicle autonomy, and the companies shaping them.'
                  : boardView.isEmpty
                    ? 'Turn on one or more product lines to compose the timeline.'
                  : boardView.isComposite
                    ? `${boardView.label} puts selected product lines onto one shared timeline for full-field comparison.`
                  : `${boardView.label} is shown on the same absolute timeline, so newer product lines can be scanned without flattening every company into separate rows.`}
              </p>
            </div>

            <div className="border-l border-[var(--edge-strong)] pl-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Reading notes</p>
              <p className="mt-4 max-w-[42ch] text-sm leading-7 text-[var(--ink-soft)]">
                Drag the field to pan across dense stretches, then hold and use the mouse wheel to zoom around the
                pointer. Dates stay absolute, so concurrency and dry spells remain legible.
              </p>
              {hiddenCompanyCount > 0 ? (
                <div className="mt-5">
                  <SurfaceButton label="Show hidden companies" onClick={onShowHiddenCompanies}>
                    <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                    <span className="hidden sm:inline">Companies</span>
                  </SurfaceButton>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[1540px] px-5 pb-8 md:px-8">
        <div className="relative pr-16">
          <div
            className="absolute right-[calc(100%+1rem)] top-0 z-40 hidden [--category-expanded-width:min(260px,max(74px,calc((100vw-1540px)/2+16px)))] lg:flex max-[1699px]:left-0 max-[1699px]:right-auto max-[1699px]:[--category-expanded-width:260px]"
          >
            {modelExplorer}
          </div>

        <motion.section
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.9, delay: 0.14, ease: [0.22, 1, 0.36, 1]}}
          className="timeline-fluid-obstacle min-w-0 overflow-hidden rounded-[2.4rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--panel-shadow)] backdrop-blur-xl"
        >
          <div className="relative">
            {processedCompanies.length === 0 ? (
              <div className="absolute bottom-0 left-[320px] right-0 top-0 z-20 flex items-center justify-center px-6">
                <TimelineEmptyState
                  boardView={boardView}
                  hiddenCompanyCount={hiddenCompanyCount}
                  onShowHiddenCompanies={onShowHiddenCompanies}
                />
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[320px] border-r border-[var(--edge)] bg-[linear-gradient(90deg,rgba(11,14,20,0.98)_0%,rgba(11,14,20,0.95)_78%,rgba(11,14,20,0)_100%)]">
              <div className="px-5 pb-14 pt-24">
                <div className="flex flex-col gap-11">
                  {processedCompanies.map((company, companyIndex) => (
                    <React.Fragment key={company.id}>
                      <CompanyRailItem
                        draggedCompanyId={draggedCompanyId}
                        isFirst={companyIndex === 0}
                        isLast={companyIndex === processedCompanies.length - 1}
                        company={company}
                        onDragEnd={onCompanyDragEnd}
                        onDragStart={onCompanyDragStart}
                        onHide={onCompanyHide}
                        onMove={onCompanyMove}
                        onReorder={onCompanyReorder}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className={`relative overflow-x-auto overflow-y-hidden pb-8 [overflow-anchor:none] [scroll-behavior:auto] [scrollbar-gutter:stable] ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{minHeight: `${timelineMinHeight}px`}}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopPanning}
              onPointerCancel={stopPanning}
              onLostPointerCapture={stopPanning}
            >
              <div
                className={`relative ${shouldFreezeTimelineSizing ? 'transition-none' : 'transition-[min-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
                style={{minWidth: `${timelineWidth + LABEL_RAIL_WIDTH}px`}}
              >
                <div style={{paddingLeft: `${LABEL_RAIL_WIDTH}px`}}>
                  <div
                    className={`relative pb-14 ${shouldFreezeTimelineSizing ? 'transition-none' : 'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
                    style={{width: `${timelineWidth}px`, minHeight: `${timelineMinHeight}px`}}
                  >
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

                    {processedCompanies.length > 0 ? (
                      <div className="relative flex flex-col pb-14 pt-24" style={{gap: '44px'}}>
                        {processedCompanies.map((company, companyIndex) => (
                          <React.Fragment key={`${company.id}-timeline-group`}>
                            <CompanyTimelineGroup
                              activeArticleSlug={activeArticleSlug}
                              company={company}
                              companyIndex={companyIndex}
                              currentGlobalDay={currentGlobalDay}
                              maxDays={maxDays}
                              onModelSelect={onModelSelect}
                            />
                          </React.Fragment>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
        <TimelineZoomRail
          className="right-0 top-1/2 -translate-y-1/2"
          maxZoom={maxZoom}
          minZoom={minZoom}
          onSliderActiveChange={onZoomSliderActiveChange}
          onZoomChange={handleZoomChange}
          zoom={zoom}
        />
        </div>
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
              Latest company on the board: <span className="font-semibold text-[var(--ink)]">{latestCompany?.name ?? 'n/a'}</span>
              {' '}with <span className="font-semibold text-[var(--ink)]">{latestCompany?.latestRelease?.name ?? 'n/a'}</span>.
            </p>
            <p className="font-mono uppercase tracking-[0.14em]">All dates rendered in UTC</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCompanies.map((company, index) => (
              <React.Fragment key={`${company.id}-summary-card`}>
                <CompanySummaryCard
                  company={company}
                  currentGlobalDay={currentGlobalDay}
                  index={index}
                  maxSummaryQuietDays={maxSummaryQuietDays}
                />
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  );
}

function MobileTimelineExperience({
  activeArticleSlug,
  boardView,
  currentGlobalDay,
  draggedCompanyId,
  handleZoomChange,
  hiddenCompanyCount,
  isZoomSliderActive,
  latestCompany,
  minZoom,
  maxZoom,
  maxDays,
  maxSummaryQuietDays,
  modelExplorer,
  monthTicks,
  onCompanyDragEnd,
  onCompanyDragStart,
  onCompanyHide,
  onCompanyMove,
  onCompanyReorder,
  onModelSelect,
  onShowHiddenCompanies,
  onZoomSliderActiveChange,
  processedCompanies,
  scrollContainerRef,
  timelineWidth,
  yearTicks,
  zoom,
}: MobileTimelineExperienceProps) {
  const timelineMinHeight = getTimelineMinHeight(processedCompanies, true);

  return (
    <>
      <section className="mx-auto max-w-[640px] px-4 pb-5 pt-6">
        <motion.div
          initial={{opacity: 0, y: 18}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.75, ease: [0.22, 1, 0.36, 1]}}
          className="space-y-5"
        >
          <div className="space-y-4">
            <h1 className="max-w-xl text-[2.35rem] leading-none tracking-tighter text-[var(--ink)]">
              Mapping major AI progress across time
            </h1>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              {boardView.isDefault
                ? 'Explore important AI milestones across frontier models, open systems, generative media, coding tools, events, robotics, vehicle autonomy, and the companies shaping them.'
                : boardView.isEmpty
                  ? 'Turn on one or more product lines to compose the mobile timeline.'
                : boardView.isComposite
                  ? `${boardView.label} shows selected product lines together. Use zoom when the field gets dense.`
                : `${boardView.label} is isolated into its own board, keeping the release field readable on mobile.`}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Latest on the board</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">
                <span className="font-semibold">{latestCompany?.name ?? 'n/a'}</span>
                {' '}with <span className="font-semibold">{latestCompany?.latestRelease?.name ?? 'n/a'}</span>.
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{boardView.label}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {hiddenCompanyCount > 0 ? (
                <SurfaceButton label="Show hidden companies" onClick={onShowHiddenCompanies}>
                  <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                  <span>Companies</span>
                </SurfaceButton>
              ) : null}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[760px] px-4 pb-6">
        <div className="mb-4">{modelExplorer}</div>

        <div className="relative pr-14">
        <motion.section
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1]}}
          className="timeline-fluid-obstacle overflow-hidden rounded-[1.9rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--panel-shadow)] backdrop-blur-xl"
        >
          <div className="relative">
            {processedCompanies.length === 0 ? (
              <div className="absolute bottom-0 left-[196px] right-0 top-0 z-20 flex items-center justify-center px-3">
                <TimelineEmptyState
                  boardView={boardView}
                  hiddenCompanyCount={hiddenCompanyCount}
                  onShowHiddenCompanies={onShowHiddenCompanies}
                />
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[196px] border-r border-[var(--edge)] bg-[linear-gradient(90deg,rgba(11,14,20,0.99)_0%,rgba(11,14,20,0.96)_78%,rgba(11,14,20,0)_100%)]">
              <div className="px-3 pb-10 pt-20">
                <div className="flex flex-col gap-8">
                  {processedCompanies.map((company, companyIndex) => (
                    <React.Fragment key={`${company.id}-mobile-rail`}>
                      <CompanyRailItem
                        compact
                        draggedCompanyId={draggedCompanyId}
                        isFirst={companyIndex === 0}
                        isLast={companyIndex === processedCompanies.length - 1}
                        company={company}
                        onDragEnd={onCompanyDragEnd}
                        onDragStart={onCompanyDragStart}
                        onHide={onCompanyHide}
                        onMove={onCompanyMove}
                        onReorder={onCompanyReorder}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="relative overflow-x-auto overflow-y-hidden pb-6 [overflow-anchor:none] [scroll-behavior:auto] [scrollbar-gutter:stable]"
              style={{minHeight: `${timelineMinHeight}px`}}
            >
              <div
                className={`relative ${isZoomSliderActive ? 'transition-none' : 'transition-[min-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
                style={{minWidth: `${timelineWidth + MOBILE_LABEL_RAIL_WIDTH}px`}}
              >
                <div style={{paddingLeft: `${MOBILE_LABEL_RAIL_WIDTH}px`}}>
                  <div
                    className={`relative pb-10 ${isZoomSliderActive ? 'transition-none' : 'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
                    style={{width: `${timelineWidth}px`, minHeight: `${timelineMinHeight}px`}}
                  >
                    <div className="pointer-events-none absolute inset-0">
                      {monthTicks.map((tick) => (
                        <div
                          key={`mobile-month-${tick.days}`}
                          className="absolute bottom-0 top-0 border-l border-[var(--grid-line)]"
                          style={{left: `${(tick.days / maxDays) * 100}%`}}
                        >
                          <div className="absolute left-0 top-9 -translate-x-1/2 rounded-full bg-[var(--surface-strong)] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--muted)] shadow-[var(--soft-shadow)]">
                            {tick.label}
                          </div>
                        </div>
                      ))}

                      {yearTicks.map((tick) => (
                        <div
                          key={`mobile-year-${tick.label}`}
                          className="absolute bottom-0 top-0 border-l-2 border-[var(--grid-line-strong)]"
                          style={{left: `${(tick.days / maxDays) * 100}%`}}
                        >
                          <div className="absolute left-0 top-1 -translate-x-1/2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)]">
                            {tick.label}
                          </div>
                        </div>
                      ))}

                      <div
                        className="absolute bottom-0 top-0 border-l-2 border-[var(--today-line)]"
                        style={{left: `${(currentGlobalDay / maxDays) * 100}%`}}
                      >
                        <div className="absolute left-0 top-1 -translate-x-1/2">
                          <div className="inline-flex items-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
                            Today
                          </div>
                        </div>
                      </div>
                    </div>

                    {processedCompanies.length > 0 ? (
                      <div className="relative flex flex-col pb-10 pt-20" style={{gap: '32px'}}>
                        {processedCompanies.map((company, companyIndex) => (
                          <React.Fragment key={`${company.id}-mobile-timeline-group`}>
                            <CompanyTimelineGroup
                              activeArticleSlug={activeArticleSlug}
                              compact
                              company={company}
                              companyIndex={companyIndex}
                              currentGlobalDay={currentGlobalDay}
                              maxDays={maxDays}
                              onModelSelect={onModelSelect}
                            />
                          </React.Fragment>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
        <TimelineZoomRail
          compact
          className="right-0 top-1/2 -translate-y-1/2"
          maxZoom={maxZoom}
          minZoom={minZoom}
          onSliderActiveChange={onZoomSliderActiveChange}
          onZoomChange={handleZoomChange}
          zoom={zoom}
        />
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-4 pb-16">
        <div className="grid gap-3 sm:grid-cols-2">
          {processedCompanies.map((company, index) => (
            <React.Fragment key={`${company.id}-mobile-summary-card`}>
              <CompanySummaryCard
                compact
                company={company}
                currentGlobalDay={currentGlobalDay}
                index={index}
                maxSummaryQuietDays={maxSummaryQuietDays}
              />
            </React.Fragment>
          ))}
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [selectedPresetIds, setSelectedPresetIds] = useState<PresetId[]>(DEFAULT_SELECTED_PRESET_IDS);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches,
  );
  const [zoom, setZoom] = useState(DEFAULT_DESKTOP_ZOOM);
  const [mobileZoom, setMobileZoom] = useState(DEFAULT_MOBILE_ZOOM);
  const [isPanning, setIsPanning] = useState(false);
  const [isZoomSliderActive, setIsZoomSliderActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [draggedCompanyId, setDraggedCompanyId] = useState<string | null>(null);
  const [hiddenCompanyIds, setHiddenCompanyIds] = useState<string[]>([]);
  const [companyOrderIds, setCompanyOrderIds] = useState<string[]>(() => companies.map((company) => company.id));
  const [route, setRoute] = useState<AppRoute>(() => getCurrentAppRoute());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null);
  const desktopPointerOffsetXRef = useRef<number | null>(null);
  const hasPositionedInitialView = useRef(false);
  const hasPositionedInitialMobileView = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const isZoomSliderActiveRef = useRef(false);
  const timelineWheelHandlerRef = useRef<(event: WheelEvent) => void>(() => undefined);
  const removeWheelCaptureListenerRef = useRef<(() => void) | null>(null);
  const latestDragPointRef = useRef<{
    clientX: number;
    clientY: number;
  } | null>(null);
  const panStateRef = useRef({
    lastX: 0,
  });
  const [viewportWidths, setViewportWidths] = useState({desktop: 0, mobile: 0});
  const activeArticleSlug = route.kind === 'model' ? route.slug : null;
  const activeArticleEntry = activeArticleSlug ? (modelReleaseIndexBySlug[activeArticleSlug] ?? null) : null;
  const isArticleOpen = route.kind === 'model';

  const boardView = useMemo(() => getBoardView(selectedPresetIds), [selectedPresetIds]);
  const visibleCompanies = useMemo(() => getVisibleCompanies(companies, selectedPresetIds), [selectedPresetIds]);
  const orderedVisibleCompanies = useMemo(
    () => orderCompanies(visibleCompanies, companyOrderIds, hiddenCompanyIds),
    [companyOrderIds, hiddenCompanyIds, visibleCompanies],
  );
  const displayedCompanyIds = useMemo(
    () => orderedVisibleCompanies.map((company) => company.id),
    [orderedVisibleCompanies],
  );
  const hiddenCompanyCount = useMemo(() => {
    const hiddenCompanyIdSet = new Set(hiddenCompanyIds);
    return visibleCompanies.filter((company) => hiddenCompanyIdSet.has(company.id)).length;
  }, [hiddenCompanyIds, visibleCompanies]);
  const presetStats = useMemo(() => buildPresetStats(companies), []);
  const timelineData = useMemo(() => buildTimelineData(orderedVisibleCompanies), [orderedVisibleCompanies]);
  const today = new Date();
  const currentGlobalDay = (today.getTime() - START_DATE.getTime()) / DAY_MS;
  const maxDays = Math.max(Math.ceil(currentGlobalDay) + 36, timelineData.latestGlobalDay + 36, 720);
  const baseTimelineWidth = Math.max(Math.round(maxDays * TIMELINE_PIXELS_PER_DAY), 1);
  const desktopMinZoom = getFitZoom(viewportWidths.desktop, LABEL_RAIL_WIDTH, baseTimelineWidth);
  const mobileMinZoom = getFitZoom(viewportWidths.mobile, MOBILE_LABEL_RAIL_WIDTH, baseTimelineWidth);
  const timelineWidth = Math.max(Math.round(baseTimelineWidth * zoom), 1);
  const mobileTimelineWidth = Math.max(Math.round(baseTimelineWidth * mobileZoom), 1);

  const {monthTicks, yearTicks} = useMemo(() => buildTicks(maxDays), [maxDays]);

  const latestCompany = useMemo(() => {
    return [...timelineData.processedCompanies]
      .filter((company) => company.latestRelease)
      .sort((left, right) => (right.latestRelease?.globalDay ?? 0) - (left.latestRelease?.globalDay ?? 0))[0] ?? null;
  }, [timelineData.processedCompanies]);

  const summaryCompanies = useMemo(() => {
    return timelineData.processedCompanies;
  }, [timelineData.processedCompanies]);

  const maxSummaryQuietDays = useMemo(() => {
    return summaryCompanies.reduce((max, company) => {
      const quietDays = getQuietDays(company, currentGlobalDay);
      return Math.max(max, quietDays);
    }, 0);
  }, [currentGlobalDay, summaryCompanies]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsReady(true), 120);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const updateRoute = () => setRoute(getCurrentAppRoute());

    updateRoute();
    window.addEventListener('hashchange', updateRoute);

    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    return () => {
      removeWheelCaptureListenerRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!activeArticleEntry) {
      return;
    }

    setSelectedPresetIds((currentIds) => {
      const missingPresetIds = activeArticleEntry.presets.filter((presetId) => !currentIds.includes(presetId));

      if (missingPresetIds.length === 0) {
        return currentIds;
      }

      return [...currentIds, ...missingPresetIds];
    });

    setHiddenCompanyIds((currentIds) => currentIds.filter((companyId) => companyId !== activeArticleEntry.companyId));
  }, [activeArticleEntry]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateDesktopViewport = () => setIsDesktopViewport(mediaQuery.matches);

    updateDesktopViewport();
    mediaQuery.addEventListener('change', updateDesktopViewport);

    return () => mediaQuery.removeEventListener('change', updateDesktopViewport);
  }, []);

  useEffect(() => {
    hasPositionedInitialView.current = false;
    hasPositionedInitialMobileView.current = false;
  }, [selectedPresetIds]);

  useEffect(() => {
    const updateViewportWidths = () => {
      setViewportWidths({
        desktop: scrollContainerRef.current?.clientWidth ?? 0,
        mobile: mobileScrollContainerRef.current?.clientWidth ?? 0,
      });
    };

    updateViewportWidths();
    const animationFrame = window.requestAnimationFrame(updateViewportWidths);
    window.addEventListener('resize', updateViewportWidths);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateViewportWidths);
    };
  }, [isReady]);

  useEffect(() => {
    if (hasPositionedInitialView.current) {
      return;
    }

    const positionInitialDesktopView = () => {
      if (hasPositionedInitialView.current || !scrollContainerRef.current) {
        return;
      }

      const container = scrollContainerRef.current;
      if (container.clientWidth === 0) {
        return;
      }

      const dayOffset = LABEL_RAIL_WIDTH + (currentGlobalDay / maxDays) * timelineWidth;
      container.scrollLeft = Math.max(0, dayOffset - container.clientWidth * 0.68);
      hasPositionedInitialView.current = true;
    };

    positionInitialDesktopView();

    if (hasPositionedInitialView.current) {
      return;
    }

    window.addEventListener('resize', positionInitialDesktopView);
    return () => window.removeEventListener('resize', positionInitialDesktopView);
  }, [currentGlobalDay, maxDays, selectedPresetIds, timelineWidth]);

  useEffect(() => {
    if (hasPositionedInitialMobileView.current) {
      return;
    }

    const positionInitialMobileView = () => {
      if (hasPositionedInitialMobileView.current || !mobileScrollContainerRef.current) {
        return;
      }

      const container = mobileScrollContainerRef.current;
      if (container.clientWidth === 0) {
        return;
      }

      const dayOffset = MOBILE_LABEL_RAIL_WIDTH + (currentGlobalDay / maxDays) * mobileTimelineWidth;
      container.scrollLeft = Math.max(0, dayOffset - container.clientWidth * 0.78);
      hasPositionedInitialMobileView.current = true;
    };

    positionInitialMobileView();

    if (hasPositionedInitialMobileView.current) {
      return;
    }

    window.addEventListener('resize', positionInitialMobileView);
    return () => window.removeEventListener('resize', positionInitialMobileView);
  }, [currentGlobalDay, maxDays, mobileTimelineWidth, selectedPresetIds]);

  const togglePreset = (presetId: PresetId) => {
    setSelectedPresetIds((currentIds) => {
      if (currentIds.includes(presetId)) {
        return currentIds.filter((currentId) => currentId !== presetId);
      }

      return [...currentIds, presetId];
    });
  };

  const resetPreset = () => {
    setSelectedPresetIds(DEFAULT_SELECTED_PRESET_IDS);
    setHiddenCompanyIds([]);
    setCompanyOrderIds(companies.map((company) => company.id));
  };

  const selectAllPresets = () => {
    setSelectedPresetIds(modelPresets.map((preset) => preset.id));
  };

  const clearAllPresets = () => {
    setSelectedPresetIds([]);
  };

  const hideCompany = (companyId: string) => {
    setHiddenCompanyIds((currentIds) => {
      if (currentIds.includes(companyId)) {
        return currentIds;
      }

      return [...currentIds, companyId];
    });
  };

  const showHiddenCompanies = () => {
    setHiddenCompanyIds([]);
  };

  const reorderCompany = (sourceCompanyId: string, targetCompanyId: string) => {
    setCompanyOrderIds((currentIds) =>
      reorderVisibleCompanyIds(currentIds, displayedCompanyIds, sourceCompanyId, targetCompanyId),
    );
  };

  const moveCompany = (companyId: string, direction: CompanyMoveDirection) => {
    setCompanyOrderIds((currentIds) => moveVisibleCompanyId(currentIds, displayedCompanyIds, companyId, direction));
  };

  const navigateToModelSlug = (slug: string) => {
    window.location.hash = `#/models/${encodeURIComponent(slug)}`;
  };

  const explorerProps = {
    boardView,
    isOpen: isExplorerOpen,
    onClearAll: clearAllPresets,
    onPresetToggle: togglePreset,
    onReset: resetPreset,
    onSelectAll: selectAllPresets,
    onToggle: () => setIsExplorerOpen((isOpen) => !isOpen),
    presetStats,
    selectedPresetIds,
  };

  const handleZoomSliderActiveChange = useCallback((isActive: boolean) => {
    isZoomSliderActiveRef.current = isActive;
    setIsZoomSliderActive((current) => (current === isActive ? current : isActive));
  }, []);

  const handleZoomChange = (updater: (zoomLevel: number) => number) => {
    const container = scrollContainerRef.current;
    const anchorOffsetX = container
      ? clampNumber(desktopPointerOffsetXRef.current ?? container.clientWidth / 2, 0, container.clientWidth)
      : null;
    const anchorRatio =
      container && anchorOffsetX !== null
        ? getTimelineAnchorRatio(container.scrollLeft, anchorOffsetX, LABEL_RAIL_WIDTH, timelineWidth)
        : null;

    const applyZoomChange = () => {
      setZoom((previousZoom) => {
        const nextZoom = Number(clampNumber(updater(previousZoom), desktopMinZoom, DESKTOP_MAX_ZOOM).toFixed(3));
        const nextTimelineWidth = Math.max(Math.round(baseTimelineWidth * nextZoom), 1);

        if (nextZoom === previousZoom) {
          return previousZoom;
        }

        if (anchorRatio !== null && anchorOffsetX !== null) {
          requestAnimationFrame(() => {
            if (!scrollContainerRef.current) {
              return;
            }

            scrollContainerRef.current.scrollLeft = getScrollLeftForTimelineAnchor(
              anchorRatio,
              anchorOffsetX,
              LABEL_RAIL_WIDTH,
              nextTimelineWidth,
            );
          });
        }

        return nextZoom;
      });
    };

    if (isZoomSliderActiveRef.current || activePointerIdRef.current !== null) {
      applyZoomChange();
      return;
    }

    startTransition(applyZoomChange);
  };

  const handleMobileZoomChange = (updater: (zoomLevel: number) => number) => {
    const container = mobileScrollContainerRef.current;
    const anchorOffsetX = container ? container.clientWidth / 2 : null;
    const anchorRatio =
      container && anchorOffsetX !== null
        ? getTimelineAnchorRatio(container.scrollLeft, anchorOffsetX, MOBILE_LABEL_RAIL_WIDTH, mobileTimelineWidth)
        : null;

    const applyMobileZoomChange = () => {
      setMobileZoom((previousZoom) => {
        const nextZoom = Number(clampNumber(updater(previousZoom), mobileMinZoom, MOBILE_MAX_ZOOM).toFixed(3));
        const nextTimelineWidth = Math.max(Math.round(baseTimelineWidth * nextZoom), 1);

        if (nextZoom === previousZoom) {
          return previousZoom;
        }

        if (anchorRatio !== null && anchorOffsetX !== null) {
          requestAnimationFrame(() => {
            if (!mobileScrollContainerRef.current) {
              return;
            }

            mobileScrollContainerRef.current.scrollLeft = getScrollLeftForTimelineAnchor(
              anchorRatio,
              anchorOffsetX,
              MOBILE_LABEL_RAIL_WIDTH,
              nextTimelineWidth,
            );
          });
        }

        return nextZoom;
      });
    };

    if (isZoomSliderActiveRef.current) {
      applyMobileZoomChange();
      return;
    }

    startTransition(applyMobileZoomChange);
  };

  timelineWheelHandlerRef.current = (event: WheelEvent) => {
    if (activePointerIdRef.current === null || !scrollContainerRef.current) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    if (event.deltaY === 0) {
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    desktopPointerOffsetXRef.current = clampNumber(event.clientX - containerRect.left, 0, container.clientWidth);

    const normalizedDeltaY =
      event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * container.clientHeight
          : event.deltaY;

    handleZoomChange((current) =>
      getSteppedZoom(current, -normalizedDeltaY * WHEEL_ZOOM_PROGRESS_PER_PIXEL, desktopMinZoom, DESKTOP_MAX_ZOOM),
    );
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    desktopPointerOffsetXRef.current = event.clientX - containerRect.left;

    activePointerIdRef.current = event.pointerId;
    panStateRef.current = {
      lastX: event.clientX,
    };

    container.setPointerCapture(event.pointerId);
    removeWheelCaptureListenerRef.current?.();

    const handleCapturedWheel = (wheelEvent: WheelEvent) => timelineWheelHandlerRef.current(wheelEvent);
    window.addEventListener('wheel', handleCapturedWheel, {capture: true, passive: false});
    removeWheelCaptureListenerRef.current = () => {
      window.removeEventListener('wheel', handleCapturedWheel, true);
    };

    flushSync(() => setIsPanning(true));
    event.preventDefault();
  };

  const applyDragCameraUpdate = () => {
    dragFrameRef.current = null;

    if (!scrollContainerRef.current) {
      return;
    }

    const latestDragPoint = latestDragPointRef.current;

    if (!latestDragPoint || activePointerIdRef.current === null) {
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const pointerOffsetX = latestDragPoint.clientX - containerRect.left;
    desktopPointerOffsetXRef.current = pointerOffsetX;

    const deltaX = latestDragPoint.clientX - panStateRef.current.lastX;
    container.scrollLeft -= deltaX;

    panStateRef.current.lastX = latestDragPoint.clientX;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    latestDragPointRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
    };

    if (dragFrameRef.current === null) {
      dragFrameRef.current = window.requestAnimationFrame(applyDragCameraUpdate);
    }

    event.preventDefault();
  };

  const stopPanning = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerIdRef.current || !scrollContainerRef.current) {
      return;
    }

    if (scrollContainerRef.current.hasPointerCapture(event.pointerId)) {
      scrollContainerRef.current.releasePointerCapture(event.pointerId);
    }

    activePointerIdRef.current = null;
    latestDragPointRef.current = null;
    removeWheelCaptureListenerRef.current?.();
    removeWheelCaptureListenerRef.current = null;

    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    setIsPanning(false);
  };

  if (companies.length === 0) {
    return (
      <StateScreen
        title="Timeline data is missing"
        detail="The page has no company data to render. Add at least one provider with product lines and release dates before rendering the timeline."
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
    <div className="relative isolate min-h-[100dvh] overflow-hidden bg-[var(--page-bg)] text-[var(--ink)] selection:bg-emerald-500/25 selection:text-[var(--ink)]">
      <AuroraBackdrop />

      <motion.div
        animate={
          isArticleOpen
            ? isDesktopViewport
              ? {opacity: 0.46, scale: 0.94, x: -260}
              : {opacity: 0, scale: 0.98, x: -48}
            : {opacity: 1, scale: 1, x: 0}
        }
        transition={{duration: 0.42, ease: [0.22, 1, 0.36, 1]}}
        className={`relative z-10 origin-left ${isArticleOpen && !isDesktopViewport ? 'pointer-events-none' : ''}`}
        aria-hidden={isArticleOpen && !isDesktopViewport}
      >
        <div className="md:hidden">
          <MobileTimelineExperience
            activeArticleSlug={activeArticleSlug}
            boardView={boardView}
            currentGlobalDay={currentGlobalDay}
            draggedCompanyId={draggedCompanyId}
            handleZoomChange={handleMobileZoomChange}
            hiddenCompanyCount={hiddenCompanyCount}
            isZoomSliderActive={isZoomSliderActive}
            latestCompany={latestCompany}
            minZoom={mobileMinZoom}
            maxZoom={MOBILE_MAX_ZOOM}
            maxDays={maxDays}
            maxSummaryQuietDays={maxSummaryQuietDays}
            modelExplorer={<ModelClassExplorer {...explorerProps} variant="panel" />}
            monthTicks={monthTicks}
            onCompanyDragEnd={() => setDraggedCompanyId(null)}
            onCompanyDragStart={setDraggedCompanyId}
            onCompanyHide={hideCompany}
            onCompanyMove={moveCompany}
            onCompanyReorder={reorderCompany}
            onModelSelect={navigateToModelSlug}
            onShowHiddenCompanies={showHiddenCompanies}
            onZoomSliderActiveChange={handleZoomSliderActiveChange}
            processedCompanies={timelineData.processedCompanies}
            scrollContainerRef={mobileScrollContainerRef}
            timelineWidth={mobileTimelineWidth}
            yearTicks={yearTicks}
            zoom={mobileZoom}
          />
        </div>

        <div className="hidden md:block">
          <DesktopTimelineExperience
            activeArticleSlug={activeArticleSlug}
            boardView={boardView}
            currentGlobalDay={currentGlobalDay}
            draggedCompanyId={draggedCompanyId}
            handlePointerDown={handlePointerDown}
            handlePointerMove={handlePointerMove}
            handleZoomChange={handleZoomChange}
            hiddenCompanyCount={hiddenCompanyCount}
            isPanning={isPanning}
            isZoomSliderActive={isZoomSliderActive}
            latestCompany={latestCompany}
            maxDays={maxDays}
            minZoom={desktopMinZoom}
            maxZoom={DESKTOP_MAX_ZOOM}
            maxSummaryQuietDays={maxSummaryQuietDays}
            modelExplorer={<ModelClassExplorer {...explorerProps} variant="rail" />}
            monthTicks={monthTicks}
            onCompanyDragEnd={() => setDraggedCompanyId(null)}
            onCompanyDragStart={setDraggedCompanyId}
            onCompanyHide={hideCompany}
            onCompanyMove={moveCompany}
            onCompanyReorder={reorderCompany}
            onModelSelect={navigateToModelSlug}
            onShowHiddenCompanies={showHiddenCompanies}
            onZoomSliderActiveChange={handleZoomSliderActiveChange}
            processedCompanies={timelineData.processedCompanies}
            scrollContainerRef={scrollContainerRef}
            stopPanning={stopPanning}
            summaryCompanies={summaryCompanies}
            timelineWidth={timelineWidth}
            yearTicks={yearTicks}
            zoom={zoom}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isArticleOpen ? (
          <motion.button
            key="article-click-away"
            type="button"
            aria-label="Return to timeline"
            tabIndex={-1}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.18, ease: [0.22, 1, 0.36, 1]}}
            onClick={navigateToTimeline}
            className="fixed inset-0 z-30 hidden cursor-pointer bg-transparent md:block"
          />
        ) : null}

        {isArticleOpen ? (
          <ModelArticlePanel
            entry={activeArticleEntry}
            onBack={navigateToTimeline}
            onNavigate={navigateToModelSlug}
            requestedSlug={activeArticleSlug ?? ''}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
