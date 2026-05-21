import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  AudioLines,
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
  Eye,
  EyeOff,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {
  companies,
  DEFAULT_PRESET_ID,
  DEFAULT_SELECTED_PRESET_IDS,
  filterPresetGroups,
  formatTimelineDate,
  formatTimelineDateRange,
  getReleaseEventType,
  getReleaseSlug,
  getReleaseTags,
  modelPresets,
  parseTimelineDate,
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

type CompanySortMode = 'significance' | 'latest' | 'alphabetical';
type SignificanceDisplayLimit = 5 | 10 | 20 | 'all';

const DEFAULT_SIGNIFICANCE_DISPLAY_LIMIT: SignificanceDisplayLimit = 5;
const SIGNIFICANCE_DISPLAY_LIMITS: SignificanceDisplayLimit[] = [5, 10, 20, 'all'];

function setsMatch<T>(left: T[], right: T[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

function getCompanyLatestReleaseTimestamp(company: CompanyRecord) {
  return company.productLines.reduce((latestTimestamp, productLine) => {
    const lineLatest = productLine.releases.reduce((lineTimestamp, release) => {
      const releaseTimestamp = parseTimelineDate(release.date).getTime();
      return Number.isNaN(releaseTimestamp) ? lineTimestamp : Math.max(lineTimestamp, releaseTimestamp);
    }, 0);

    return Math.max(latestTimestamp, lineLatest);
  }, 0);
}

function getPresetSignificanceBase(presetId: PresetId) {
  switch (presetId) {
    case 'llms':
      return 82;
    case 'open-source':
      return 78;
    case 'coding-harnesses':
      return 74;
    case 'video-generation':
      return 68;
    case 'audio-generation':
      return 66;
    case 'image-generation':
      return 64;
    case 'robotics':
      return 62;
    case 'vehicle-autonomy':
      return 58;
    case '3d-generation':
      return 54;
    case 'events':
      return 42;
    default:
      return 50;
  }
}

function getEventTypeSignificanceBonus(eventTypeId: string) {
  switch (eventTypeId) {
    case 'model-release':
      return 5;
    case 'coding-harness-release':
      return 4;
    case 'product-launch':
      return 3;
    case 'research-release':
      return 3;
    case 'deployment':
      return 2;
    case 'partnership':
      return 1;
    case 'announcement':
    case 'public-demo':
    case 'livestream':
      return 0;
    default:
      return -2;
  }
}

function getRecencySignificanceBonus(releaseEndGlobalDay: number, currentGlobalDay: number) {
  const ageDays = currentGlobalDay - releaseEndGlobalDay;

  if (ageDays < 0) {
    return 2;
  }

  if (ageDays <= 60) {
    return 12;
  }

  if (ageDays <= 180) {
    return 9;
  }

  if (ageDays <= 365) {
    return 6;
  }

  if (ageDays <= 730) {
    return 3;
  }

  return 0;
}

function getReleaseSignificanceScore(
  company: CompanyRecord,
  productLine: ProductLineRecord,
  release: ReleaseRecord,
  currentGlobalDay: number,
) {
  const releaseDate = parseTimelineDate(release.date);
  const releaseEndDate = release.endDate ? parseTimelineDate(release.endDate) : releaseDate;
  const releaseEndGlobalDay = Number.isNaN(releaseEndDate.getTime())
    ? 0
    : Math.round((releaseEndDate.getTime() - START_DATE.getTime()) / DAY_MS);
  const releasePresets = getReleasePresets(company, productLine, release);
  const releaseTags = getReleaseTags(company, productLine, release);
  const eventType = getReleaseEventType(release);
  const presetBase = releasePresets.reduce(
    (score, presetId) => Math.max(score, getPresetSignificanceBase(presetId)),
    40,
  );
  const tagBonus =
    (releaseTags.includes('ai-race-core') ? 10 : 0) +
    (releaseTags.includes('major-release') ? 5 : 0);
  const companyRankBonus = Math.max(0, 7 - (company.raceRank ?? 8));
  const score =
    presetBase +
    tagBonus +
    companyRankBonus +
    getEventTypeSignificanceBonus(eventType.id) +
    getRecencySignificanceBonus(releaseEndGlobalDay, currentGlobalDay);

  return clampNumber(Math.round(score), 1, 100);
}

function getProductLineSignificanceScore(
  company: CompanyRecord,
  productLine: ProductLineRecord,
  currentGlobalDay: number,
) {
  return productLine.releases.reduce(
    (score, release) => Math.max(score, getReleaseSignificanceScore(company, productLine, release, currentGlobalDay)),
    0,
  );
}

function getCompanySignificanceScore(company: CompanyRecord, currentGlobalDay: number) {
  return company.productLines.reduce(
    (score, productLine) =>
      Math.max(score, getProductLineSignificanceScore(company, productLine, currentGlobalDay)),
    0,
  );
}

function sortCompaniesByMode(data: CompanyRecord[], sortMode: CompanySortMode, currentGlobalDay: number) {
  const sortedCompanies = [...data];

  if (sortMode === 'significance') {
    sortedCompanies.sort(
      (left, right) =>
        getCompanySignificanceScore(right, currentGlobalDay) - getCompanySignificanceScore(left, currentGlobalDay) ||
        (left.raceRank ?? 999) - (right.raceRank ?? 999) ||
        left.name.localeCompare(right.name),
    );
    return sortedCompanies;
  }

  if (sortMode === 'latest') {
    sortedCompanies.sort(
      (left, right) =>
        getCompanyLatestReleaseTimestamp(right) - getCompanyLatestReleaseTimestamp(left) ||
        left.name.localeCompare(right.name),
    );
    return sortedCompanies;
  }

  sortedCompanies.sort((left, right) => left.name.localeCompare(right.name));
  return sortedCompanies;
}

type Tick = {
  days: number;
  label: string | number;
};

type TimelineDayWindow = {
  endDay: number;
  startDay: number;
};

type ViewportSize = {
  height: number;
  width: number;
};

type CameraState = {
  x: number;
  y: number;
};

type CameraViewState = {
  camera: CameraState;
  zoom: number;
};

type ZoomInterpolationAnchor = {
  viewportX: number;
  viewportY: number;
  worldX: number;
  worldY: number;
};

type CameraInterpolationState = {
  frameId: number | null;
  lastFrameAt: number | null;
  stiffness: number;
  target: CameraViewState;
  zoomAnchor: ZoomInterpolationAnchor | null;
};

type CameraTargetOptions = {
  stiffness?: number;
  zoomAnchor?: ZoomInterpolationAnchor | null;
};

type CanvasWorldLayout = {
  contentCards: {
    intro: {height: number; width: number; x: number; y: number};
    latest: {height: number; width: number; x: number; y: number};
    notes: {height: number; width: number; x: number; y: number};
    summaries: {width: number; x: number; y: number};
  };
  initialCameraX: number;
  initialCameraY: number;
  railWidth: number;
  timelineX: number;
  timelineY: number;
  worldHeight: number;
  worldWidth: number;
};

type CompanyRowLayout = {
  company: ProcessedCompany;
  height: number;
  index: number;
  y: number;
};

type TimelineWorldBounds = {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
};

type TimelineViewportInsets = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type TimelineJumpTarget =
  | {kind: 'bounds'; bounds: TimelineWorldBounds}
  | {kind: 'day'; endGlobalDay?: number; globalDay: number}
  | {
      kind: 'release';
      companyId: string;
      endGlobalDay?: number;
      globalDay: number;
      productLineId: string;
    }
  | {kind: 'slug'; slug: string};

type ProcessedReleaseMatch = {
  company: ProcessedCompany;
  productLineIndex: number;
  release: ProcessedRelease;
};

const DAY_MS = 1000 * 60 * 60 * 24;
const START_DATE = new Date('1998-01-01T00:00:00Z');
const TIMELINE_PIXELS_PER_DAY = 2.24;
const TIMELINE_MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const TIMELINE_FILTER_ENTER_TRANSITION = {duration: 0.34, ease: TIMELINE_MOTION_EASE};
const TIMELINE_FILTER_EXIT_TRANSITION = {duration: 0.24, ease: TIMELINE_MOTION_EASE};
const TIMELINE_LAYOUT_TRANSITION = {duration: 0.4, ease: TIMELINE_MOTION_EASE};
const LABEL_RAIL_WIDTH = 320;
const MOBILE_LABEL_RAIL_WIDTH = 196;
const PAGE_BACKGROUND_HEX = '#05070b';
const DESKTOP_COMPANY_MIN_HEIGHT = 72;
const MOBILE_COMPANY_MIN_HEIGHT = 80;
const DESKTOP_PRODUCT_LINE_HEIGHT = 56;
const MOBILE_PRODUCT_LINE_HEIGHT = 60;
const PRODUCT_LINE_GAP = 8;
const DESKTOP_TIMELINE_COMPANY_GAP = 44;
const MOBILE_TIMELINE_COMPANY_GAP = 32;
const DESKTOP_TIMELINE_TOP_PADDING = 96;
const DESKTOP_TIMELINE_BOTTOM_PADDING = 56;
const MOBILE_TIMELINE_TOP_PADDING = 80;
const MOBILE_TIMELINE_BOTTOM_PADDING = 40;
const DEFAULT_DESKTOP_ZOOM = 1;
const DEFAULT_MOBILE_ZOOM = 1.05;
const DESKTOP_MAX_ZOOM = 4;
const MOBILE_MAX_ZOOM = 3.4;
const DESKTOP_CANVAS_WORLD_MARGIN_X = 420;
const DESKTOP_CANVAS_WORLD_MARGIN_BOTTOM = 360;
const DESKTOP_CANVAS_TIMELINE_X = 180;
const DESKTOP_CANVAS_TIMELINE_Y = 300;
const MOBILE_CANVAS_WORLD_MARGIN_X = 180;
const MOBILE_CANVAS_WORLD_MARGIN_BOTTOM = 260;
const MOBILE_CANVAS_TIMELINE_X = 112;
const MOBILE_CANVAS_TIMELINE_Y = 380;
const ZOOM_PROGRESS_STEP = 0.06;
const SIGMOID_STEEPNESS = 6;
const FIT_BUFFER_MULTIPLIER = 0.92;
const WHEEL_ZOOM_PROGRESS_PER_PIXEL = 0.00025;
const ZOOM_SLIDER_KEYBOARD_STEP = 0.025;
const CAMERA_TARGET_INTERPOLATION_STIFFNESS = 18;
const MODEL_FOCUS_CAMERA_INTERPOLATION_STIFFNESS = 8;
const CAMERA_TARGET_SNAP_DISTANCE = 0.08;
const CAMERA_TARGET_SNAP_ZOOM = 0.0006;
const TIMELINE_RENDER_FUTURE_BUFFER_DAYS = 720;
const TIMELINE_RENDER_PAST_BUFFER_DAYS = 720;
const TIMELINE_RELEASE_RENDER_BUFFER_DAYS = 540;
const TIMELINE_RELEASE_RENDER_CHUNK_DAYS = 120;
const TIMELINE_TICK_PAST_BUFFER_DAYS = 90;
const TIMELINE_TICK_FUTURE_BUFFER_DAYS = 180;
const ARTICLE_FOCUS_MIN_BOUNDS_WIDTH = 420;
const ARTICLE_FOCUS_MIN_BOUNDS_HEIGHT = 168;
const TIMELINE_REGION_FOCUS_PADDING = 64;
const TIMELINE_REGION_FOCUS_ZOOM_FACTOR = 0.88;
const TIMELINE_REGION_FOCUS_MAX_ZOOM_DESKTOP = 1.65;
const TIMELINE_REGION_FOCUS_MAX_ZOOM_MOBILE = 1.45;
const TIMELINE_BACKGROUND_CLICK_MOVE_THRESHOLD_PX = 6;
const DEFAULT_TIMELINE_FOCUS_INSETS: TimelineViewportInsets = {
  bottom: 48,
  left: 24,
  right: 24,
  top: 72,
};
const ARTICLE_PANEL_MAX_WIDTH = 760;
const ARTICLE_PANEL_MAX_VIEWPORT_RATIO = 0.58;
const ARTICLE_TIMELINE_FOCUS_CENTER_RATIO = 0.58;
const DEFAULT_TIMELINE_FOCUS_ANCHOR = {x: 0.5, y: 0.46};

const ARTICLE_LOGO_ASSET_PATHS: Partial<Record<ArticleLogoMark, string>> = {
  anthropic: 'logos/anthropic.svg',
  cursor: 'logos/cursor.svg',
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

function isTimelineBackgroundPointerTarget(target: EventTarget): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  if (
    target.closest(
      'button, a, input, label, select, textarea, [data-row-focus-label], [data-timeline-pin]',
    )
  ) {
    return false;
  }

  return Boolean(target.closest('[data-timeline-field]'));
}

function getTimelineDismissPointerTarget(
  target: EventTarget,
  clientPosition?: {clientX: number; clientY: number},
): EventTarget {
  if (clientPosition && typeof document !== 'undefined') {
    const hitTarget = document.elementFromPoint(clientPosition.clientX, clientPosition.clientY);

    if (hitTarget) {
      return hitTarget;
    }
  }

  return target;
}

function tryDismissTimelineArticleOnBackgroundClick(
  target: EventTarget,
  activeArticleSlug: string | null,
  onDismissArticle: () => void,
  clientPosition?: {clientX: number; clientY: number},
) {
  if (!activeArticleSlug) {
    return;
  }

  const hitTarget = getTimelineDismissPointerTarget(target, clientPosition);

  if (!isTimelineBackgroundPointerTarget(hitTarget)) {
    return;
  }

  onDismissArticle();
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
  const isDefaultFilters = setsMatch(selectedPresetIds, DEFAULT_SELECTED_PRESET_IDS);

  if (selectedPresets.length === 0) {
    return {
      description: 'No product lines are currently selected.',
      isComposite: true,
      isDefault: false,
      isEmpty: true,
      label: 'No filters selected',
    };
  }

  if (isDefaultFilters) {
    return {
      description: 'Foundation models, open-weight labs, and coding harness releases on the timeline.',
      isComposite: true,
      isDefault: true,
      isEmpty: false,
      label: 'LLMs · open source · coding',
    };
  }

  if (selectedPresets.length === 1) {
    const preset = selectedPresets[0];

    return {
      description: preset.description,
      isComposite: false,
      isDefault: false,
      isEmpty: false,
      label: preset.label,
    };
  }

  if (selectedPresets.length === modelPresets.length) {
    return {
      description: 'Every tracked model, coding, creative-media, events, robotics, and vehicle-autonomy line is visible.',
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

function getVisibleCompanies(
  data: CompanyRecord[],
  selectedPresetIds: PresetId[],
) {
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
  const primaryProductLine = company.productLines.find((productLine) => productLine.classId !== 'events') ?? company.productLines[0];
  return primaryProductLine?.classId ?? company.defaultClasses[0] ?? 'frontier-llms';
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

function orderCompanies(
  data: CompanyRecord[],
  companyOrderIds: string[],
  hiddenCompanyIds: string[],
  sortMode: CompanySortMode,
  currentGlobalDay: number,
) {
  const companyById = new Map(data.map((company) => [company.id, company]));
  const hiddenCompanyIdSet = new Set(hiddenCompanyIds);
  const orderedCompanies = getCanonicalCompanyOrderIds(companyOrderIds)
    .map((companyId) => companyById.get(companyId))
    .filter((company): company is CompanyRecord => Boolean(company));
  const orderedCompanyIdSet = new Set(orderedCompanies.map((company) => company.id));
  const newCompanies = data.filter((company) => !orderedCompanyIdSet.has(company.id));

  return sortCompaniesByMode(
    [...orderedCompanies, ...newCompanies].filter((company) => !hiddenCompanyIdSet.has(company.id)),
    sortMode,
    currentGlobalDay,
  );
}

function getDisplayedCompanies(
  data: CompanyRecord[],
  displayLimit: SignificanceDisplayLimit,
  requiredCompanyId?: string,
) {
  if (displayLimit === 'all') {
    return data;
  }

  const limitedCompanies = data.slice(0, displayLimit);

  if (!requiredCompanyId || limitedCompanies.some((company) => company.id === requiredCompanyId)) {
    return limitedCompanies;
  }

  const requiredCompany = data.find((company) => company.id === requiredCompanyId);

  if (!requiredCompany) {
    return limitedCompanies;
  }

  return [...limitedCompanies, requiredCompany];
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

function buildTimelineData(data: CompanyRecord[], currentGlobalDay: number) {
  const invalidEntries: string[] = [];

  const processedCompanies = data.map<ProcessedCompany>((company) => {
    const processedProductLines = company.productLines.map<ProcessedProductLine>((productLine) => {
      const sortedReleases = productLine.releases.map((release) => ({
        ...release,
        classes: getReleaseClasses(company, productLine, release),
        presets: getReleasePresets(company, productLine, release),
        tags: getReleaseTags(company, productLine, release),
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
        const significanceScore = getReleaseSignificanceScore(company, productLine, release, currentGlobalDay);

        collection.push({
          ...release,
          articleSlug: getReleaseSlug(company.id, productLine.id, release),
          dateLabel: formatTimelineDate(releaseDate, undefined, release.datePrecision),
          dateRangeLabel: formatTimelineDateRange(release.date, release.endDate, release.datePrecision),
          durationDays: endGlobalDay - globalDay + 1,
          endDateLabel: release.endDate ? formatTimelineDate(release.endDate) : undefined,
          endGlobalDay,
          eventKind: eventType.kind,
          eventType: eventType.id,
          eventTypeLabel: eventType.label,
          eventTypeShortLabel: eventType.shortLabel,
          globalDay,
          gap,
          significanceScore,
        });

        return collection;
      }, []);

      const latestRelease = processedReleases[processedReleases.length - 1] ?? null;
      const totalGap = processedReleases.reduce((sum, release) => sum + release.gap, 0);
      const averageGap = processedReleases.length > 1 ? Math.round(totalGap / (processedReleases.length - 1)) : null;
      const firstRelease = processedReleases[0];
      const significanceScore = processedReleases.reduce(
        (score, release) => Math.max(score, release.significanceScore),
        0,
      );

      return {
        ...productLine,
        averageGap,
        latestRelease,
        releases: processedReleases,
        significanceScore,
        startDay: firstRelease?.globalDay ?? 0,
        totalSpan: latestRelease && firstRelease ? latestRelease.endGlobalDay - firstRelease.globalDay : 0,
      };
    }).sort(
      (left, right) =>
        right.significanceScore - left.significanceScore ||
        (right.latestRelease?.globalDay ?? 0) - (left.latestRelease?.globalDay ?? 0) ||
        left.label.localeCompare(right.label),
    );

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
    const significanceScore = processedProductLines.reduce(
      (score, productLine) => Math.max(score, productLine.significanceScore),
      0,
    );

    return {
      ...company,
      averageGap: totalGapSegments > 0 ? Math.round(totalGap / totalGapSegments) : null,
      latestProductLine,
      latestRelease,
      productLines: processedProductLines,
      significanceScore,
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

function buildTicks({endDay, startDay}: TimelineDayWindow) {
  const monthTicks: Tick[] = [];
  const yearTicks: Tick[] = [];
  const safeStartDay = Math.floor(startDay);
  const safeEndDay = Math.max(safeStartDay, Math.ceil(endDay));
  const startDate = new Date(START_DATE.getTime() + safeStartDay * DAY_MS);
  const endDate = new Date(START_DATE.getTime() + safeEndDay * DAY_MS);
  const cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));

  if (cursor.getTime() < startDate.getTime()) {
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

function getTimelineViewportDayWindow({
  camera,
  compact = false,
  futureBufferDays = 0,
  pastBufferDays = 0,
  viewport,
  zoom,
}: {
  camera: CameraState;
  compact?: boolean;
  futureBufferDays?: number;
  pastBufferDays?: number;
  viewport: ViewportSize;
  zoom: number;
}): TimelineDayWindow {
  if (viewport.width <= 0) {
    return {endDay: 0, startDay: 0};
  }

  const railWidth = compact ? MOBILE_LABEL_RAIL_WIDTH : LABEL_RAIL_WIDTH;
  const timelineX = compact ? MOBILE_CANVAS_TIMELINE_X : DESKTOP_CANVAS_TIMELINE_X;
  const safeZoom = Math.max(zoom, 0.001);
  const visibleLeftWorldX = camera.x;
  const visibleRightWorldX = camera.x + viewport.width / safeZoom;
  const visibleStartDay = (visibleLeftWorldX - timelineX - railWidth) / TIMELINE_PIXELS_PER_DAY;
  const visibleEndDay = (visibleRightWorldX - timelineX - railWidth) / TIMELINE_PIXELS_PER_DAY;
  const startDay = Math.floor(visibleStartDay - pastBufferDays);
  const endDay = Math.max(startDay + 30, Math.ceil(visibleEndDay + futureBufferDays));

  return {endDay, startDay};
}

function getChunkedTimelineDayWindow(window: TimelineDayWindow, chunkDays = TIMELINE_RELEASE_RENDER_CHUNK_DAYS) {
  const safeChunkDays = Math.max(1, chunkDays);

  return {
    endDay: Math.ceil(window.endDay / safeChunkDays) * safeChunkDays,
    startDay: Math.floor(window.startDay / safeChunkDays) * safeChunkDays,
  };
}

function getTimelineReleaseRenderWindow({
  camera,
  compact = false,
  viewport,
  zoom,
}: {
  camera: CameraState;
  compact?: boolean;
  viewport: ViewportSize;
  zoom: number;
}): TimelineDayWindow {
  if (viewport.width <= 0) {
    return {endDay: Number.POSITIVE_INFINITY, startDay: Number.NEGATIVE_INFINITY};
  }

  return getChunkedTimelineDayWindow(
    getTimelineViewportDayWindow({
      camera,
      compact,
      futureBufferDays: TIMELINE_RELEASE_RENDER_BUFFER_DAYS,
      pastBufferDays: TIMELINE_RELEASE_RENDER_BUFFER_DAYS,
      viewport,
      zoom,
    }),
  );
}

function timelineDayWindowsMatch(left: TimelineDayWindow, right: TimelineDayWindow) {
  return left.startDay === right.startDay && left.endDay === right.endDay;
}

function timelineDayRangesIntersect(
  leftStartDay: number,
  leftEndDay: number,
  rightWindow: TimelineDayWindow,
) {
  return leftEndDay >= rightWindow.startDay && leftStartDay <= rightWindow.endDay;
}

function getProceduralTimelineRange({
  camera,
  compact = false,
  minimumDays,
  viewport,
  zoom,
}: {
  camera: CameraState;
  compact?: boolean;
  minimumDays: number;
  viewport: ViewportSize;
  zoom: number;
}): TimelineDayWindow {
  const cameraWindow = getTimelineViewportDayWindow({
    camera,
    compact,
    futureBufferDays: TIMELINE_RENDER_FUTURE_BUFFER_DAYS,
    pastBufferDays: TIMELINE_RENDER_PAST_BUFFER_DAYS,
    viewport,
    zoom,
  });

  return {
    endDay: Math.max(minimumDays, cameraWindow.endDay),
    startDay: Math.min(0, cameraWindow.startDay),
  };
}

function getTimelineDayOffsetPx(day: number, timelineStartDay: number) {
  return (day - timelineStartDay) * TIMELINE_PIXELS_PER_DAY;
}

function getTimelineDurationWidthPx(startDay: number, endDay: number) {
  return Math.max(0, (endDay - startDay) * TIMELINE_PIXELS_PER_DAY);
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

function getScaledTimelineSpacing(value: number, verticalScale = 1) {
  return Math.max(1, Math.round(value * verticalScale));
}

function getProductLineHeight(compact = false, verticalScale = 1) {
  return getScaledTimelineSpacing(compact ? MOBILE_PRODUCT_LINE_HEIGHT : DESKTOP_PRODUCT_LINE_HEIGHT, verticalScale);
}

function getProductLineStackMetrics(lineCount: number, compact = false, verticalScale = 1) {
  const safeLineCount = Math.max(lineCount, 1);
  const minHeight = getScaledTimelineSpacing(compact ? MOBILE_COMPANY_MIN_HEIGHT : DESKTOP_COMPANY_MIN_HEIGHT, verticalScale);
  const lineGap = getScaledTimelineSpacing(PRODUCT_LINE_GAP, verticalScale);
  const lineHeight = getProductLineHeight(compact, verticalScale);
  const linesHeight = safeLineCount * lineHeight + Math.max(safeLineCount - 1, 0) * lineGap;
  const groupHeight = Math.max(minHeight, linesHeight + (safeLineCount > 1 ? getScaledTimelineSpacing(16, verticalScale) : 0));

  return {
    groupHeight,
    lineGap,
    lineHeight,
    topOffset: Math.max(0, (groupHeight - linesHeight) / 2),
  };
}

function getCompanyGroupHeight(company: Pick<ProcessedCompany, 'productLines'>, compact = false, verticalScale = 1) {
  return getProductLineStackMetrics(company.productLines.length, compact, verticalScale).groupHeight;
}

function getProductLineCenterY(lineCount: number, productLineIndex: number, compact = false, verticalScale = 1) {
  const {lineGap, lineHeight, topOffset} = getProductLineStackMetrics(lineCount, compact, verticalScale);
  return topOffset + productLineIndex * (lineHeight + lineGap) + lineHeight / 2;
}

function getTimelineLayout(compact = false, verticalScale = 1) {
  return {
    bottomPadding: getScaledTimelineSpacing(compact ? MOBILE_TIMELINE_BOTTOM_PADDING : DESKTOP_TIMELINE_BOTTOM_PADDING, verticalScale),
    companyGap: getScaledTimelineSpacing(compact ? MOBILE_TIMELINE_COMPANY_GAP : DESKTOP_TIMELINE_COMPANY_GAP, verticalScale),
    topPadding: getScaledTimelineSpacing(compact ? MOBILE_TIMELINE_TOP_PADDING : DESKTOP_TIMELINE_TOP_PADDING, verticalScale),
  };
}

function getTimelineMinHeight(companiesToRender: ProcessedCompany[], compact = false, verticalScale = 1) {
  const layout = getTimelineLayout(compact, verticalScale);
  const rowsHeight = companiesToRender.reduce((sum, company) => sum + getCompanyGroupHeight(company, compact, verticalScale), 0);
  const gapsHeight = Math.max(companiesToRender.length - 1, 0) * layout.companyGap;
  return Math.max(
    getScaledTimelineSpacing(compact ? 384 : 448, verticalScale),
    rowsHeight + gapsHeight + layout.topPadding + layout.bottomPadding + getScaledTimelineSpacing(compact ? 40 : 32, verticalScale),
  );
}

function getCompanyRowLayouts(
  companiesToRender: ProcessedCompany[],
  compact = false,
  verticalScale = 1,
  layout = getTimelineLayout(compact, verticalScale),
): CompanyRowLayout[] {
  let nextY = layout.topPadding;

  return companiesToRender.map((company, index) => {
    const height = getCompanyGroupHeight(company, compact, verticalScale);
    const rowLayout = {
      company,
      height,
      index,
      y: nextY,
    };
    nextY += height + layout.companyGap;
    return rowLayout;
  });
}

function getCanvasWorldLayout({
  compact = false,
  currentGlobalDay,
  maxDays,
  summaryCount,
  timelineStartDay = 0,
  timelineHeight,
  timelineWidth,
  viewport,
}: {
  compact?: boolean;
  currentGlobalDay: number;
  maxDays: number;
  summaryCount: number;
  timelineStartDay?: number;
  timelineHeight: number;
  timelineWidth: number;
  viewport: ViewportSize;
}): CanvasWorldLayout {
  const safeViewportWidth = Math.max(viewport.width, compact ? 360 : 1024);
  const safeViewportHeight = Math.max(viewport.height, compact ? 720 : 680);
  const railWidth = compact ? MOBILE_LABEL_RAIL_WIDTH : LABEL_RAIL_WIDTH;
  const timelineX = compact ? MOBILE_CANVAS_TIMELINE_X : DESKTOP_CANVAS_TIMELINE_X;
  const timelineY = compact ? MOBILE_CANVAS_TIMELINE_Y : DESKTOP_CANVAS_TIMELINE_Y;
  const marginX = compact ? MOBILE_CANVAS_WORLD_MARGIN_X : DESKTOP_CANVAS_WORLD_MARGIN_X;
  const marginBottom = compact ? MOBILE_CANVAS_WORLD_MARGIN_BOTTOM : DESKTOP_CANVAS_WORLD_MARGIN_BOTTOM;
  const currentDayWorldX = timelineX + railWidth + currentGlobalDay * TIMELINE_PIXELS_PER_DAY;
  const initialCameraX = Math.max(0, currentDayWorldX - safeViewportWidth * (compact ? 0.78 : 0.72));
  const introWidth = compact ? Math.min(390, Math.max(292, safeViewportWidth - 64)) : 720;
  const notesWidth = compact ? Math.min(360, Math.max(280, safeViewportWidth - 56)) : 360;
  const latestWidth = compact ? Math.min(420, Math.max(290, safeViewportWidth - 48)) : 520;
  const summaryWidth = compact ? Math.min(620, Math.max(320, safeViewportWidth - 32)) : 1180;
  const introX = Math.max(marginX * 0.34, initialCameraX + (compact ? 20 : safeViewportWidth * 0.24));
  const introY = compact ? 0 : 4;
  const initialCameraY = Math.max(
    0,
    Math.min(
      timelineY - safeViewportHeight * (compact ? 0.28 : 0.24),
      introY - (compact ? 18 : 24),
    ),
  );
  const notesX = compact
    ? introX + introWidth + 18
    : Math.min(introX + introWidth + 28, initialCameraX + safeViewportWidth - notesWidth - 24);
  const notesY = compact ? introY + 8 : introY + 8;
  const latestX = introX;
  const latestY = timelineY + timelineHeight + (compact ? 42 : 52);
  const summaryX = introX;
  const summaryY = latestY + (compact ? 132 : 118);
  const summaryColumns = compact ? (safeViewportWidth >= 640 ? 2 : 1) : 4;
  const summaryRows = Math.max(1, Math.ceil(Math.max(summaryCount, 1) / summaryColumns));
  const summaryRowHeight = compact ? 172 : 224;
  const summaryHeight = summaryRows * summaryRowHeight;
  const timelineRightX = timelineX + railWidth + Math.max(maxDays, 0) * TIMELINE_PIXELS_PER_DAY;
  const timelineLeftX = timelineX + timelineStartDay * TIMELINE_PIXELS_PER_DAY;
  const worldWidth = Math.max(
    timelineRightX + marginX,
    timelineLeftX + timelineWidth + railWidth + marginX,
    notesX + notesWidth + marginX,
    summaryX + summaryWidth + marginX,
    initialCameraX + safeViewportWidth + marginX,
  );
  const worldHeight = Math.max(
    timelineY + timelineHeight + marginBottom,
    summaryY + summaryHeight + marginBottom,
    notesY + (compact ? 152 : 172) + marginBottom,
    initialCameraY + safeViewportHeight + marginBottom,
  );

  return {
    contentCards: {
      intro: {height: compact ? 176 : 202, width: introWidth, x: introX, y: introY},
      latest: {height: compact ? 96 : 74, width: latestWidth, x: latestX, y: latestY},
      notes: {height: compact ? 142 : 170, width: notesWidth, x: notesX, y: notesY},
      summaries: {width: summaryWidth, x: summaryX, y: summaryY},
    },
    initialCameraX,
    initialCameraY,
    railWidth,
    timelineX,
    timelineY,
    worldHeight,
    worldWidth,
  };
}

function getInitialCamera(layout: CanvasWorldLayout): CameraState {
  return {
    x: layout.initialCameraX,
    y: layout.initialCameraY,
  };
}

function getDefaultCameraView(layout: CanvasWorldLayout, compact = false): CameraViewState {
  return {
    camera: getInitialCamera(layout),
    zoom: compact ? DEFAULT_MOBILE_ZOOM : DEFAULT_DESKTOP_ZOOM,
  };
}

function getMapZoomCssValue(zoom: number) {
  return Number.isFinite(zoom) ? Math.max(0.001, zoom) : 1;
}

function getTimelineWorldTransform(camera: CameraState, zoom: number) {
  return `translate3d(${-camera.x * zoom}px, ${-camera.y * zoom}px, 0) scale(${zoom})`;
}

function applyTimelineWorldTransform(
  element: HTMLDivElement | null,
  camera: CameraState,
  zoom: number,
) {
  if (!element) {
    return;
  }

  element.style.transform = getTimelineWorldTransform(camera, zoom);
  element.style.setProperty('--map-zoom', String(getMapZoomCssValue(zoom)));
}

function getTimelineMapLabelStyle(baseFontSizePx: number) {
  return {
    ['--label-size' as string]: String(baseFontSizePx),
  };
}

function expandBoundsToMinimumSize(
  bounds: TimelineWorldBounds,
  minWidth: number,
  minHeight: number,
): TimelineWorldBounds {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const expandX = Math.max(0, (minWidth - width) / 2);
  const expandY = Math.max(0, (minHeight - height) / 2);

  return {
    maxX: bounds.maxX + expandX,
    maxY: bounds.maxY + expandY,
    minX: bounds.minX - expandX,
    minY: bounds.minY - expandY,
  };
}

function findProcessedReleaseBySlug(
  processedCompanies: ProcessedCompany[],
  slug: string,
): ProcessedReleaseMatch | null {
  for (const company of processedCompanies) {
    for (let productLineIndex = 0; productLineIndex < company.productLines.length; productLineIndex += 1) {
      const productLine = company.productLines[productLineIndex];
      const release = productLine.releases.find((entry) => entry.articleSlug === slug);

      if (release) {
        return {company, productLineIndex, release};
      }
    }
  }

  return null;
}

type TimelinePinNavDirection = 'down' | 'left' | 'right' | 'up';

type TimelinePinNavTarget = {
  slug: string;
  x: number;
  y: number;
};

const TIMELINE_PIN_NAV_PRIMARY_EPS = 6;
const TIMELINE_PIN_NAV_SECONDARY_WEIGHT = 2.75;

function collectTimelinePinNavTargets(
  processedCompanies: ProcessedCompany[],
  layout: CanvasWorldLayout,
  compact: boolean,
  verticalScale: number,
): TimelinePinNavTarget[] {
  const timelineLayout = getTimelineLayout(compact, verticalScale);
  const rowLayouts = getCompanyRowLayouts(processedCompanies, compact, verticalScale, timelineLayout);
  const rowByCompanyId = new Map(rowLayouts.map((row) => [row.company.id, row]));
  const targets: TimelinePinNavTarget[] = [];

  processedCompanies.forEach((company) => {
    const row = rowByCompanyId.get(company.id);

    if (!row) {
      return;
    }

    company.productLines.forEach((productLine, productLineIndex) => {
      productLine.releases.forEach((release) => {
        targets.push({
          slug: release.articleSlug,
          x: layout.timelineX + layout.railWidth + release.globalDay * TIMELINE_PIXELS_PER_DAY,
          y:
            layout.timelineY +
            row.y +
            getProductLineCenterY(company.productLines.length, productLineIndex, compact, verticalScale),
        });
      });
    });
  });

  return targets;
}

function getTimelinePinNavOrigin(
  processedCompanies: ProcessedCompany[],
  layout: CanvasWorldLayout,
  compact: boolean,
  verticalScale: number,
  activeArticleSlug: string | null,
  camera: CameraState,
  zoom: number,
  viewport: ViewportSize,
): {x: number; y: number} {
  if (activeArticleSlug) {
    const match = findProcessedReleaseBySlug(processedCompanies, activeArticleSlug);

    if (match) {
      const rowLayouts = getCompanyRowLayouts(
        processedCompanies,
        compact,
        verticalScale,
        getTimelineLayout(compact, verticalScale),
      );
      const row = rowLayouts.find((entry) => entry.company.id === match.company.id);

      if (row) {
        return {
          x: layout.timelineX + layout.railWidth + match.release.globalDay * TIMELINE_PIXELS_PER_DAY,
          y:
            layout.timelineY +
            row.y +
            getProductLineCenterY(match.company.productLines.length, match.productLineIndex, compact, verticalScale),
        };
      }
    }
  }

  const safeZoom = Math.max(zoom, 0.001);

  return {
    x: camera.x + viewport.width / (2 * safeZoom),
    y: camera.y + viewport.height / (2 * safeZoom),
  };
}

function findNearestTimelinePinInDirection(
  origin: {x: number; y: number},
  targets: TimelinePinNavTarget[],
  direction: TimelinePinNavDirection,
  options?: {excludeSlug?: string | null; minPrimaryDistance?: number},
): TimelinePinNavTarget | null {
  const minPrimaryDistance = options?.minPrimaryDistance ?? TIMELINE_PIN_NAV_PRIMARY_EPS;
  let bestTarget: TimelinePinNavTarget | null = null;
  let bestScore = Infinity;
  let bestDistance = Infinity;

  targets.forEach((target) => {
    if (options?.excludeSlug && target.slug === options.excludeSlug) {
      return;
    }

    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    let primary = 0;
    let secondary = 0;

    if (direction === 'right') {
      if (dx < minPrimaryDistance) {
        return;
      }

      primary = dx;
      secondary = Math.abs(dy);
    } else if (direction === 'left') {
      if (dx > -minPrimaryDistance) {
        return;
      }

      primary = -dx;
      secondary = Math.abs(dy);
    } else if (direction === 'down') {
      if (dy < minPrimaryDistance) {
        return;
      }

      primary = dy;
      secondary = Math.abs(dx);
    } else {
      if (dy > -minPrimaryDistance) {
        return;
      }

      primary = -dy;
      secondary = Math.abs(dx);
    }

    const score = secondary * TIMELINE_PIN_NAV_SECONDARY_WEIGHT + primary;
    const distance = Math.hypot(dx, dy);

    if (score < bestScore || (score === bestScore && distance < bestDistance)) {
      bestTarget = target;
      bestScore = score;
      bestDistance = distance;
    }
  });

  return bestTarget;
}

function getTimelinePinNavDirectionFromKey(key: string): TimelinePinNavDirection | null {
  if (key === 'ArrowRight') {
    return 'right';
  }

  if (key === 'ArrowLeft') {
    return 'left';
  }

  if (key === 'ArrowDown') {
    return 'down';
  }

  if (key === 'ArrowUp') {
    return 'up';
  }

  return null;
}

function shouldIgnoreTimelinePinArrowNavigation(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return true;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest('[aria-label="Timeline zoom controls"]')) {
    return true;
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function getTimelineReleaseWorldBounds({
  compact = false,
  layout,
  productLineIndex,
  release,
  row,
  verticalScale = 1,
}: {
  compact?: boolean;
  layout: CanvasWorldLayout;
  productLineIndex: number;
  release: Pick<ProcessedRelease, 'endGlobalDay' | 'globalDay'>;
  row: CompanyRowLayout;
  verticalScale?: number;
}): TimelineWorldBounds {
  const lineHeight = getProductLineHeight(compact, verticalScale);
  const centerY =
    layout.timelineY +
    row.y +
    getProductLineCenterY(row.company.productLines.length, productLineIndex, compact, verticalScale);
  const startX = layout.timelineX + layout.railWidth + release.globalDay * TIMELINE_PIXELS_PER_DAY;
  const endX = layout.timelineX + layout.railWidth + release.endGlobalDay * TIMELINE_PIXELS_PER_DAY;
  const markerPadding = compact ? 28 : 36;

  return {
    maxX: Math.max(startX, endX) + markerPadding,
    maxY: centerY + lineHeight / 2 + 12,
    minX: Math.min(startX, endX) - markerPadding,
    minY: centerY - lineHeight / 2 - 12,
  };
}

function getTimelineFocusInsets(
  viewport: ViewportSize,
  compact: boolean,
  isArticleOpen: boolean,
): TimelineViewportInsets {
  if (!isArticleOpen) {
    return DEFAULT_TIMELINE_FOCUS_INSETS;
  }

  if (compact) {
    return {bottom: 40, left: 16, right: 16, top: 64};
  }

  return {
    bottom: 48,
    left: 100,
    right: Math.min(ARTICLE_PANEL_MAX_WIDTH, Math.round(viewport.width * ARTICLE_PANEL_MAX_VIEWPORT_RATIO)),
    top: 72,
  };
}

function getArticleTimelineFocusAnchor(
  viewport: ViewportSize,
  insets: TimelineViewportInsets,
): {x: number; y: number} {
  const articlePanelWidth = Math.min(
    ARTICLE_PANEL_MAX_WIDTH,
    Math.round(viewport.width * ARTICLE_PANEL_MAX_VIEWPORT_RATIO),
  );
  const timelineAreaWidth = viewport.width - articlePanelWidth;
  const timelineViewportCenterX = timelineAreaWidth * ARTICLE_TIMELINE_FOCUS_CENTER_RATIO;
  const availW = Math.max(
    1,
    viewport.width - insets.left - insets.right - TIMELINE_REGION_FOCUS_PADDING * 2,
  );
  const anchorX = clampNumber(
    (timelineViewportCenterX - insets.left - TIMELINE_REGION_FOCUS_PADDING) / availW,
    0.42,
    0.68,
  );

  return {x: anchorX, y: DEFAULT_TIMELINE_FOCUS_ANCHOR.y};
}

function getCameraViewForTimelineRegion({
  anchor,
  bounds,
  focusMaxZoom,
  insets,
  layout,
  maxZoom,
  minZoom,
  viewport,
}: {
  anchor: {x: number; y: number};
  bounds: TimelineWorldBounds;
  focusMaxZoom: number;
  insets: TimelineViewportInsets;
  layout: CanvasWorldLayout;
  maxZoom: number;
  minZoom: number;
  viewport: ViewportSize;
}): CameraViewState | null {
  if (viewport.width <= 0 || viewport.height <= 0) {
    return null;
  }

  const availW = Math.max(
    1,
    viewport.width - insets.left - insets.right - TIMELINE_REGION_FOCUS_PADDING * 2,
  );
  const availH = Math.max(
    1,
    viewport.height - insets.top - insets.bottom - TIMELINE_REGION_FOCUS_PADDING * 2,
  );
  const boundsW = Math.max(bounds.maxX - bounds.minX, 1);
  const boundsH = Math.max(bounds.maxY - bounds.minY, 1);
  const fitZoom =
    Math.min(availW / boundsW, availH / boundsH) * FIT_BUFFER_MULTIPLIER * TIMELINE_REGION_FOCUS_ZOOM_FACTOR;
  const nextZoom = Number(clampNumber(fitZoom, minZoom, Math.min(maxZoom, focusMaxZoom)).toFixed(3));
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const anchorScreenX = insets.left + TIMELINE_REGION_FOCUS_PADDING + availW * anchor.x;
  const anchorScreenY = insets.top + TIMELINE_REGION_FOCUS_PADDING + availH * anchor.y;
  const maxCameraX = Math.max(0, layout.worldWidth - viewport.width / nextZoom);
  const maxCameraY = Math.max(0, layout.worldHeight - viewport.height / nextZoom);

  return {
    camera: {
      x: clampNumber(centerX - anchorScreenX / nextZoom, 0, maxCameraX),
      y: clampNumber(centerY - anchorScreenY / nextZoom, 0, maxCameraY),
    },
    zoom: nextZoom,
  };
}

function resolveTimelineJumpTarget(
  target: TimelineJumpTarget,
  processedCompanies: ProcessedCompany[],
  layout: CanvasWorldLayout,
  timelineHeight: number,
  compact = false,
  verticalScale = 1,
): TimelineWorldBounds | null {
  if (target.kind === 'bounds') {
    return target.bounds;
  }

  const timelineLayout = getTimelineLayout(compact, verticalScale);
  const rowLayouts = getCompanyRowLayouts(processedCompanies, compact, verticalScale, timelineLayout);

  if (target.kind === 'slug') {
    const match = findProcessedReleaseBySlug(processedCompanies, target.slug);

    if (!match) {
      return null;
    }

    const row = rowLayouts.find((entry) => entry.company.id === match.company.id);

    if (!row) {
      return null;
    }

    const bounds = getTimelineReleaseWorldBounds({
      compact,
      layout,
      productLineIndex: match.productLineIndex,
      release: match.release,
      row,
      verticalScale,
    });

    return expandBoundsToMinimumSize(bounds, ARTICLE_FOCUS_MIN_BOUNDS_WIDTH, ARTICLE_FOCUS_MIN_BOUNDS_HEIGHT);
  }

  if (target.kind === 'release') {
    const row = rowLayouts.find((entry) => entry.company.id === target.companyId);

    if (!row) {
      return null;
    }

    const productLineIndex = row.company.productLines.findIndex((line) => line.id === target.productLineId);

    if (productLineIndex < 0) {
      return null;
    }

    const bounds = getTimelineReleaseWorldBounds({
      compact,
      layout,
      productLineIndex,
      release: {
        endGlobalDay: target.endGlobalDay ?? target.globalDay,
        globalDay: target.globalDay,
      },
      row,
      verticalScale,
    });

    return expandBoundsToMinimumSize(bounds, ARTICLE_FOCUS_MIN_BOUNDS_WIDTH, ARTICLE_FOCUS_MIN_BOUNDS_HEIGHT);
  }

  const startX = layout.timelineX + layout.railWidth + target.globalDay * TIMELINE_PIXELS_PER_DAY;
  const endGlobalDay = target.endGlobalDay ?? target.globalDay;
  const endX = layout.timelineX + layout.railWidth + endGlobalDay * TIMELINE_PIXELS_PER_DAY;
  const centerY = layout.timelineY + timelineHeight * 0.44;
  const bandHeight = compact ? 100 : 120;

  return expandBoundsToMinimumSize(
    {
      maxX: Math.max(startX, endX) + 40,
      maxY: centerY + bandHeight / 2,
      minX: Math.min(startX, endX) - 40,
      minY: centerY - bandHeight / 2,
    },
    ARTICLE_FOCUS_MIN_BOUNDS_WIDTH,
    ARTICLE_FOCUS_MIN_BOUNDS_HEIGHT,
  );
}

function getZoomWorldAnchor(
  camera: CameraState,
  zoom: number,
  viewportX: number,
  viewportY: number,
): Pick<ZoomInterpolationAnchor, 'worldX' | 'worldY'> {
  const safeZoom = Math.max(zoom, 0.001);

  return {
    worldX: camera.x + viewportX / safeZoom,
    worldY: camera.y + viewportY / safeZoom,
  };
}

function getCameraForZoomWorldAnchor(
  worldX: number,
  worldY: number,
  viewportX: number,
  viewportY: number,
  zoom: number,
): CameraState {
  const safeZoom = Math.max(zoom, 0.001);

  return {
    x: worldX - viewportX / safeZoom,
    y: worldY - viewportY / safeZoom,
  };
}

function resolveZoomInterpolationAnchor({
  anchorX,
  anchorY,
  camera,
  existingAnchor,
  zoom,
}: {
  anchorX: number;
  anchorY: number;
  camera: CameraState;
  existingAnchor: ZoomInterpolationAnchor | null;
  zoom: number;
}): ZoomInterpolationAnchor {
  if (
    existingAnchor &&
    existingAnchor.viewportX === anchorX &&
    existingAnchor.viewportY === anchorY
  ) {
    return existingAnchor;
  }

  const {worldX, worldY} = getZoomWorldAnchor(camera, zoom, anchorX, anchorY);

  return {
    viewportX: anchorX,
    viewportY: anchorY,
    worldX,
    worldY,
  };
}

function lerpNumber(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
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

  if (classId === 'audio-generation') {
    return <AudioLines className={iconClassName} strokeWidth={1.8} />;
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

type TimelineFilterSortPanelProps = {
  boardView: BoardView;
  className?: string;
  companySortMode: CompanySortMode;
  isOpen: boolean;
  onClearAll: () => void;
  onCompanySortModeChange: (sortMode: CompanySortMode) => void;
  onPresetToggle: (presetId: PresetId) => void;
  onReset: () => void;
  onSelectAll: () => void;
  onSignificanceDisplayLimitChange: (limit: SignificanceDisplayLimit) => void;
  onToggle: () => void;
  presetStats: Record<PresetId, {providerCount: number; releaseCount: number}>;
  selectedPresetIds: PresetId[];
  significanceDisplayLimit: SignificanceDisplayLimit;
  totalMatchedCompanyCount: number;
  variant?: 'panel' | 'rail';
  visibleCompanyCount: number;
};

function TimelineFilterSortPanel({
  boardView,
  className = '',
  companySortMode,
  isOpen,
  onClearAll,
  onCompanySortModeChange,
  onPresetToggle,
  onReset,
  onSelectAll,
  onSignificanceDisplayLimitChange,
  onToggle,
  presetStats,
  selectedPresetIds,
  significanceDisplayLimit,
  totalMatchedCompanyCount,
  variant = 'panel',
  visibleCompanyCount,
}: TimelineFilterSortPanelProps) {
  const selectedPresetCount = selectedPresetIds.length;
  const selectedFilterCount = selectedPresetCount;
  const isRail = variant === 'rail';
  const isCollapsedRail = isRail && !isOpen;
  const rootClassName = `${isRail ? (isOpen ? 'w-[var(--category-expanded-width,286px)]' : 'w-[74px]') : 'w-full'} timeline-fluid-obstacle overflow-hidden rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--soft-shadow)] backdrop-blur-xl transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCollapsedRail ? 'cursor-pointer hover:bg-[var(--surface-strong)]' : ''} ${className}`;

  const renderToggleButton = ({
    buttonKey,
    description,
    icon,
    isSelected,
    meta,
    onClick,
    title,
  }: {
    buttonKey: string;
    description: string;
    icon?: React.ReactNode;
    isSelected: boolean;
    meta: string;
    onClick: () => void;
    title: string;
  }) => (
    <button
      key={buttonKey}
      type="button"
      title={title}
      disabled={!isOpen}
      onClick={onClick}
      className={`flex h-11 w-full items-center gap-2 rounded-[0.85rem] border px-2.5 text-left transition duration-300 active:scale-[0.99] ${
        isSelected
          ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)]'
          : 'border-[var(--edge)] bg-transparent hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]'
      }`}
    >
      {icon ?? <Sparkles className="h-4 w-4 shrink-0 text-[var(--ink)]" strokeWidth={1.8} />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold tracking-tight text-[var(--ink)]">{description}</span>
        <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.11em] text-[var(--muted)]">{meta}</span>
      </span>
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          isSelected ? 'border-[var(--edge-strong)] bg-[var(--ink)] text-[var(--page-bg)]' : 'border-[var(--edge)] text-transparent'
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={2} />
      </span>
    </button>
  );

  const sortOptions: {id: CompanySortMode; label: string}[] = [
    {id: 'significance', label: 'AI significance'},
    {id: 'latest', label: 'Latest release'},
    {id: 'alphabetical', label: 'A–Z'},
  ];
  const selectedSortLabel = sortOptions.find((option) => option.id === companySortMode)?.label ?? 'Significance';
  const selectedSortSummary = companySortMode === 'significance' ? 'score' : selectedSortLabel;

  return (
    <aside className={rootClassName} onClick={isCollapsedRail ? onToggle : undefined}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Timeline filter and sort controls"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className={`flex w-full items-center gap-3 text-left transition duration-300 hover:bg-[var(--surface-strong)] active:scale-[0.99] ${
          isOpen ? 'justify-between border-b border-[var(--edge)] px-3 py-3' : 'justify-center px-0 py-4'
        }`}
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] text-[var(--ink)] shadow-[var(--soft-shadow)]">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
        </span>
        {isOpen ? (
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Filters</span>
            <span className="mt-1 block truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{boardView.label}</span>
            <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
              {visibleCompanyCount}/{totalMatchedCompanyCount} rows · sort {selectedSortSummary}
            </span>
          </span>
        ) : (
          <span className="sr-only">{boardView.label}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--ink-soft)] transition duration-300 ${isOpen ? 'rotate-180' : '-rotate-90'}`}
          strokeWidth={1.8}
        />
      </button>

      <div
        data-filter-panel
        aria-hidden={!isOpen}
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'max-h-[620px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{pointerEvents: isOpen ? 'auto' : 'none'}}
      >
        <motion.div
          initial={false}
          animate={{y: isOpen ? 0 : -10}}
          transition={{duration: 0.34, ease: [0.16, 1, 0.3, 1]}}
          className="max-h-[min(620px,calc(100dvh-18rem))] overflow-y-auto px-3 py-3"
        >
          <div className="space-y-3">
            {filterPresetGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{group.label}</p>
                <div className="space-y-1.5">
                  {group.presetIds.map((presetId) => {
                    const preset = modelPresets.find((candidate) => candidate.id === presetId);

                    if (!preset) {
                      return null;
                    }

                    const stats = presetStats[preset.id];

                    return renderToggleButton({
                      buttonKey: preset.id,
                      description: preset.label,
                      icon: <ModelClassIcon classId={preset.classId} className="h-4 w-4 shrink-0 text-[var(--ink)]" />,
                      isSelected: selectedPresetIds.includes(preset.id),
                      meta: `${stats.providerCount}c / ${stats.releaseCount}r`,
                      onClick: () => onPresetToggle(preset.id),
                      title: preset.description,
                    });
                  })}
                </div>
              </div>
            ))}

            <div className="border-t border-[var(--edge)] pt-3">
              <p className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Sorting settings</p>
              <div className="grid grid-cols-1 gap-1.5">
                {sortOptions.map((option) => {
                  const isActive = companySortMode === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!isOpen}
                      onClick={() => onCompanySortModeChange(option.id)}
                      className={`flex h-9 w-full items-center justify-between rounded-[0.85rem] border px-2.5 text-left text-xs font-semibold tracking-tight transition duration-300 active:scale-[0.99] ${
                        isActive
                          ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)] text-[var(--ink)]'
                          : 'border-[var(--edge)] text-[var(--ink-soft)] hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {option.label}
                      <span
                        className={`h-2.5 w-2.5 rounded-full border ${
                          isActive ? 'border-[var(--ink)] bg-[var(--ink)]' : 'border-[var(--edge)] bg-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="mb-1.5 mt-3 px-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Displayed rows</p>
              <div className="grid grid-cols-4 gap-1.5">
                {SIGNIFICANCE_DISPLAY_LIMITS.map((limit) => {
                  const isActive = significanceDisplayLimit === limit;
                  const label = limit === 'all' ? 'All' : String(limit);

                  return (
                    <button
                      key={String(limit)}
                      type="button"
                      disabled={!isOpen}
                      onClick={() => onSignificanceDisplayLimitChange(limit)}
                      className={`h-8 rounded-[0.85rem] border px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition duration-300 active:scale-[0.99] ${
                        isActive
                          ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)] text-[var(--ink)]'
                          : 'border-[var(--edge)] text-[var(--ink-soft)] hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              disabled={!isOpen}
              onClick={onSelectAll}
              title="Select all category filters"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-[var(--edge)] px-2 text-[11px] font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
            >
              <Layers3 className="h-3.5 w-3.5" strokeWidth={1.8} />
              All
            </button>
            <button
              type="button"
              disabled={!isOpen}
              onClick={onClearAll}
              title="Clear filters"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-[var(--edge)] px-2 text-[11px] font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
            >
              <X className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
              Clear
            </button>
            <button
              type="button"
              disabled={!isOpen}
              onClick={onReset}
              title="Reset filters and sort"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-[var(--edge)] px-2 text-[11px] font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
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
            key="filter-rail"
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 8}}
            transition={{duration: 0.2, ease: [0.22, 1, 0.36, 1]}}
            className="flex flex-col items-center gap-3 px-2 pb-5"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]" style={{writingMode: 'vertical-rl'}}>
              Filters
            </span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] font-mono text-[10px] text-[var(--ink-soft)]">
              {selectedFilterCount}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </aside>
  );
}

/** @deprecated Use TimelineFilterSortPanel */
function ModelClassExplorer(props: TimelineFilterSortPanelProps) {
  return <TimelineFilterSortPanel {...props} />;
}

function SurfaceButton({
  children,
  label,
  onClick,
  pressed,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium shadow-[var(--soft-shadow)] transition duration-300 hover:-translate-y-[1px] hover:border-[var(--edge-strong)] hover:bg-[var(--surface-strong)] active:translate-y-0 active:scale-[0.98] ${
        pressed
          ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)] text-[var(--ink)]'
          : 'border-[var(--edge)] bg-[var(--surface)] text-[var(--ink-soft)]'
      }`}
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

  if (mark === 'calendar') {
    return <CalendarDays className="relative h-7 w-7 text-[var(--ink)]" strokeWidth={1.8} />;
  }

  if (mark === 'gpt' || mark === 'openai') {
    return <span className={sharedClassName}>AI</span>;
  }

  if (mark === 'claude' || mark === 'anthropic') {
    return <span className={sharedClassName}>C</span>;
  }

  if (mark === 'cursor') {
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

function getMarkerShapeClass(markerShape: ProductMarkerShape) {
  if (markerShape === 'square') {
    return 'rounded-[5px]';
  }

  if (markerShape === 'diamond') {
    return 'rotate-45 rounded-[4px]';
  }

  return 'rounded-full';
}

function isBranchableProductLine(productLine: ProcessedProductLine) {
  return productLine.classId !== 'events';
}

function getBranchSourceLine(
  productLines: ProcessedProductLine[],
  targetProductLineIndex: number,
): {productLine: ProcessedProductLine; productLineIndex: number} | null {
  const targetLine = productLines[targetProductLineIndex];

  if (!targetLine || !isBranchableProductLine(targetLine)) {
    return null;
  }

  const sourceProductLineIndex = productLines.findIndex(isBranchableProductLine);

  if (sourceProductLineIndex < 0 || sourceProductLineIndex === targetProductLineIndex) {
    return null;
  }

  const sourceProductLine = productLines[sourceProductLineIndex];

  if (!sourceProductLine) {
    return null;
  }

  return {
    productLine: sourceProductLine,
    productLineIndex: sourceProductLineIndex,
  };
}

function getProductLineBranchEndOffsetPx({
  primaryLine,
  productLine,
  timelineStartDay,
}: {
  primaryLine: ProcessedProductLine;
  productLine: ProcessedProductLine;
  timelineStartDay: number;
}) {
  if (primaryLine.releases.length === 0 || productLine.releases.length === 0) {
    return null;
  }

  const primaryStartDay = primaryLine.releases[0]?.globalDay ?? 0;
  const targetRelease =
    productLine.releases.find((release) => release.globalDay >= primaryStartDay) ?? productLine.releases[0];

  return getTimelineDayOffsetPx(targetRelease.globalDay, timelineStartDay);
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
  renderWindow,
  timelineStartDay,
  verticalScale = 1,
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
  renderWindow: TimelineDayWindow;
  timelineStartDay: number;
  verticalScale?: number;
}) {
  const lineHeight = getProductLineHeight(compact, verticalScale);
  const isHarnessLine = productLine.classId === 'coding-harnesses';
  const harnessLineColor = mixHexColors(company.accent, PAGE_BACKGROUND_HEX, 0.34);
  const markerShapeClass = getMarkerShapeClass(productLine.markerShape);
  const markerSizeClass = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const releaseLabelShellClass = compact
    ? 'absolute left-3 top-0 origin-bottom-left -translate-y-1 -rotate-[22deg]'
    : 'absolute left-4 top-0 origin-bottom-left -translate-y-2 -rotate-[28deg] transition duration-300 group-hover:-translate-y-3';
  const releaseLabelBodyClass = compact
    ? 'timeline-map-screen-label whitespace-nowrap rounded-[0.7rem] border px-1.5 py-0.5 font-bold tracking-[0.01em] shadow-[var(--soft-shadow)] backdrop-blur-sm'
    : 'timeline-map-screen-label whitespace-nowrap rounded-[0.8rem] border bg-[var(--surface-strong)] px-2 py-1 font-bold tracking-[0.015em] shadow-[var(--soft-shadow)] backdrop-blur-sm group-hover:bg-[var(--surface)]';
  const releaseLabelFontSize = compact ? 10 : 12;
  const branchSource = getBranchSourceLine(company.productLines, productLineIndex);
  const trackStartOffsetPx =
    branchSource
      ? getProductLineBranchEndOffsetPx({
          primaryLine: branchSource.productLine,
          productLine,
          timelineStartDay,
        }) ?? 0
      : 0;

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0, transition: TIMELINE_FILTER_EXIT_TRANSITION}}
      transition={{
        opacity: TIMELINE_FILTER_ENTER_TRANSITION,
      }}
      className="relative z-10 shrink-0"
      style={{height: `${lineHeight}px`}}
    >
      <div
        className="absolute right-0 top-1/2 h-px -translate-y-1/2 bg-[var(--track-line)]"
        style={{left: `${trackStartOffsetPx}px`}}
      />
      <div className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
        <span
          className="timeline-map-label inline-flex items-center gap-1.5 rounded-full border bg-[rgba(10,13,19,0.88)] px-2 py-1 font-mono uppercase tracking-[0.13em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)] backdrop-blur-sm"
          style={{
            borderColor: toRgbaFromHex(company.accent, 0.28),
            ...getTimelineMapLabelStyle(compact ? 8 : 9),
          }}
        >
          <ModelClassIcon classId={productLine.classId} className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          {productLine.shortLabel}
        </span>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {productLine.releases.map((release, releaseIndex) => {
        const previousRelease = productLine.releases[releaseIndex - 1];
        const isActiveArticle = activeArticleSlug === release.articleSlug;
        const isReleaseVisible =
          isActiveArticle ||
          timelineDayRangesIntersect(release.globalDay, release.endGlobalDay, renderWindow);
        const isConnectorVisible =
          Boolean(previousRelease) &&
          timelineDayRangesIntersect(previousRelease?.globalDay ?? release.globalDay, release.globalDay, renderWindow);
        const isRangeVisible =
          release.endGlobalDay > release.globalDay &&
          timelineDayRangesIntersect(release.globalDay, release.endGlobalDay, renderWindow);

        if (!isReleaseVisible && !isConnectorVisible && !isRangeVisible) {
          return null;
        }

        const leftOffsetPx = getTimelineDayOffsetPx(release.globalDay, timelineStartDay);
        const previousOffsetPx = previousRelease
          ? getTimelineDayOffsetPx(previousRelease.globalDay, timelineStartDay)
          : leftOffsetPx;
        const connectorWidthPx = previousRelease ? Math.max(0, leftOffsetPx - previousOffsetPx) : 0;
        const rangeWidthPx = getTimelineDurationWidthPx(release.globalDay, release.endGlobalDay);
        const isLatestInLine =
          productLine.latestRelease?.name === release.name && productLine.latestRelease?.date === release.date;
        const labelTextColor = isLatestInLine
          ? mixHexColor(company.accent, 255, 0.12)
          : mixHexColor(company.accent, 255, 0.24);
        const labelBorderColor = toRgbaFromHex(company.accent, isLatestInLine ? 0.52 : 0.34);
        const labelBackground = isLatestInLine ? toRgbaFromHex(company.accent, 0.12) : undefined;
        const isGeneralEvent = release.eventKind === 'event';
        const openActionLabel = isGeneralEvent ? 'Open event' : 'Open release';

        return (
          <motion.div
            key={release.articleSlug}
            initial={{opacity: 0, scale: 0.84}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.84}}
            transition={{
              opacity: TIMELINE_FILTER_ENTER_TRANSITION,
              scale: TIMELINE_FILTER_ENTER_TRANSITION,
            }}
            className="absolute inset-0"
          >
            {previousRelease && isConnectorVisible ? (
              <motion.div
                initial={{opacity: 0, scaleX: 0}}
                animate={{opacity: isHarnessLine ? 0.72 : 0.58, scaleX: 1}}
                transition={TIMELINE_FILTER_ENTER_TRANSITION}
                className={`absolute top-1/2 -translate-y-1/2 origin-left ${isHarnessLine ? 'h-px' : 'h-[2px]'}`}
                style={{
                  backgroundColor: isHarnessLine ? harnessLineColor : company.accent,
                  left: `${previousOffsetPx}px`,
                  width: `${connectorWidthPx}px`,
                }}
              >
                <div className="absolute left-1/2 top-3 -translate-x-1/2">
                  <div className="timeline-map-screen-fixed">
                    <div
                      className="timeline-map-screen-label rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2 py-1 font-mono uppercase tracking-[0.1em] text-[var(--ink)] shadow-[var(--soft-shadow)]"
                      style={getTimelineMapLabelStyle(compact ? 9 : 10)}
                    >
                      {release.gap}d
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {isRangeVisible ? (
              <motion.div
                initial={{opacity: 0, scaleX: 0}}
                animate={{opacity: isLatestInLine ? 0.72 : 0.54, scaleX: 1}}
                transition={TIMELINE_FILTER_ENTER_TRANSITION}
                className={`absolute top-1/2 z-10 origin-left -translate-y-1/2 rounded-full ${
                  compact ? 'h-[7px]' : 'h-2'
                }`}
                style={{
                  backgroundColor: company.accent,
                  boxShadow: `0 0 18px color-mix(in srgb, ${company.accent} 34%, transparent)`,
                  left: `${leftOffsetPx}px`,
                  minWidth: compact ? '8px' : '10px',
                  width: `${rangeWidthPx}px`,
                }}
              />
            ) : null}

            {isReleaseVisible ? (
              <motion.div
                initial={{opacity: 0, scale: 0.82, y: compact ? 6 : 8}}
                animate={{opacity: 1, scale: 1, y: 0}}
                exit={{opacity: 0, scale: 0.82, y: compact ? 6 : 8}}
                transition={{
                  opacity: TIMELINE_FILTER_ENTER_TRANSITION,
                  scale: TIMELINE_FILTER_ENTER_TRANSITION,
                  y: TIMELINE_FILTER_ENTER_TRANSITION,
                }}
                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${isActiveArticle ? 'z-30' : 'z-20'}`}
                style={{left: `${leftOffsetPx}px`}}
              >
                <div className="overflow-visible">
                    <button
                      type="button"
                      data-timeline-pin
                      aria-current={isActiveArticle ? 'page' : undefined}
                      aria-label={`${openActionLabel} for ${release.name}, ${release.dateRangeLabel}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onModelSelect(release.articleSlug);
                      }}
                      onPointerDown={(event) => event.stopPropagation()}
                      className={`group relative block size-0 overflow-visible cursor-pointer text-left outline-none ${isActiveArticle ? 'timeline-pin--selected' : ''}`}
                    >
                    <div className="timeline-pin-marker-stack relative z-0 size-0 shrink-0">
                      {isActiveArticle ? (
                        <span
                          aria-hidden="true"
                          className={`timeline-pin-selection-ring ${compact ? 'timeline-pin-selection-ring--compact' : ''}`}
                          style={{['--pin-accent' as string]: company.accent}}
                        />
                      ) : null}
                      <div
                        className={`${markerSizeClass} absolute left-0 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 border-[3px] border-[var(--surface-strong)] transition duration-300 ${markerShapeClass} ${
                          isActiveArticle
                            ? 'timeline-pin-marker--selected scale-[1.18]'
                            : 'group-hover:scale-[1.22] group-focus-visible:scale-[1.22]'
                        }`}
                        style={{
                          backgroundColor: company.accent,
                          boxShadow: isActiveArticle
                            ? `0 0 0 ${compact ? 3 : 4}px rgba(237, 242, 250, 0.92), 0 0 0 ${compact ? 7 : 8}px color-mix(in srgb, ${company.accent} 48%, transparent)`
                            : isLatestInLine
                              ? `0 0 0 ${compact ? 4 : 5}px color-mix(in srgb, ${company.accent} 20%, transparent), 0 0 18px color-mix(in srgb, ${company.accent} 40%, transparent)`
                              : `0 0 0 4px color-mix(in srgb, ${company.accent} 11%, transparent)`,
                          filter: isActiveArticle
                            ? 'saturate(1.45) brightness(1.14)'
                            : isLatestInLine
                              ? 'saturate(1.35) brightness(1.08)'
                              : undefined,
                        }}
                      />
                    </div>

                    <div className={`${releaseLabelShellClass} z-[2]`}>
                      <div
                        className={`${releaseLabelBodyClass} ${isActiveArticle ? 'timeline-pin-label--selected' : ''}`}
                        style={{
                          backgroundColor: isActiveArticle
                            ? 'var(--surface-strong)'
                            : labelBackground,
                          borderColor: isActiveArticle
                            ? toRgbaFromHex(company.accent, 0.88)
                            : labelBorderColor,
                          borderWidth: isActiveArticle ? (compact ? 2 : 2) : undefined,
                          color: isActiveArticle ? mixHexColor(company.accent, 255, 0.06) : labelTextColor,
                          boxShadow: isActiveArticle
                            ? `0 0 0 1px color-mix(in srgb, ${company.accent} 55%, transparent)`
                            : undefined,
                          textShadow: isActiveArticle
                            ? '0 1px 14px rgba(0, 0, 0, 0.62)'
                            : isLatestInLine
                              ? '0 1px 12px rgba(0, 0, 0, 0.5)'
                              : '0 1px 10px rgba(0, 0, 0, 0.38)',
                          filter: isActiveArticle
                            ? 'saturate(1.28)'
                            : isLatestInLine
                              ? 'saturate(1.18)'
                              : undefined,
                          ...getTimelineMapLabelStyle(releaseLabelFontSize),
                        }}
                      >
                        {release.name}
                      </div>
                    </div>

                    {!compact ? (
                      <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 opacity-0 transition duration-300 group-hover:opacity-100">
                        <div
                          className="timeline-map-screen-label rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1 font-mono uppercase tracking-[0.12em] text-[var(--ink)] shadow-[0_18px_38px_-24px_rgba(0,0,0,0.5)]"
                          style={getTimelineMapLabelStyle(10)}
                        >
                          {productLine.shortLabel} / {release.eventTypeShortLabel} / {release.dateRangeLabel}
                        </div>
                      </div>
                    ) : null}
                    </button>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        );
      })}
      </AnimatePresence>

      {productLine.latestRelease &&
      currentGlobalDay > productLine.latestRelease.endGlobalDay &&
      timelineDayRangesIntersect(productLine.latestRelease.endGlobalDay, currentGlobalDay, renderWindow) ? (
        <>
          <motion.div
            initial={{opacity: 0, scaleX: 0}}
            animate={{opacity: isHarnessLine ? 0.48 : 0.42, scaleX: 1}}
            transition={TIMELINE_FILTER_ENTER_TRANSITION}
            className={`absolute top-1/2 origin-left -translate-y-1/2 ${
              isHarnessLine ? 'h-px' : 'quiet-extension-flow h-[2px]'
            }`}
            style={{
              backgroundColor: isHarnessLine ? harnessLineColor : undefined,
              left: `${getTimelineDayOffsetPx(productLine.latestRelease.endGlobalDay, timelineStartDay)}px`,
              ['--quiet-flow-duration' as string]: `${compact ? 5.4 : 6.4}s`,
              ['--quiet-line-color' as string]: company.accent,
              width: `${getTimelineDurationWidthPx(productLine.latestRelease.endGlobalDay, currentGlobalDay)}px`,
            }}
          />

          <div
            className="absolute top-1/2 z-0 -translate-y-1/2 pl-3"
            style={{left: `${getTimelineDayOffsetPx(currentGlobalDay, timelineStartDay)}px`}}
          >
            <div className="timeline-map-screen-fixed">
              <div
                className="timeline-map-screen-label rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1 font-mono uppercase tracking-[0.14em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)]"
                style={getTimelineMapLabelStyle(compact ? 9 : 10)}
              >
                +{getQuietDays(productLine, currentGlobalDay)}d
              </div>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

const MemoizedProductLineTimelineLane = React.memo(ProductLineTimelineLane);

function CompanyTimelineGroup({
  activeArticleSlug,
  compact = false,
  company,
  companyIndex,
  currentGlobalDay,
  maxDays,
  onCompanyBlur,
  onCompanyFocus,
  onModelSelect,
  renderWindow,
  timelineStartDay,
  verticalScale = 1,
}: {
  activeArticleSlug: string | null;
  compact?: boolean;
  company: ProcessedCompany;
  companyIndex: number;
  currentGlobalDay: number;
  maxDays: number;
  onCompanyBlur?: () => void;
  onCompanyFocus?: (companyId: string) => void;
  onModelSelect: (slug: string) => void;
  renderWindow: TimelineDayWindow;
  timelineStartDay: number;
  verticalScale?: number;
}) {
  const {lineGap} = getProductLineStackMetrics(company.productLines.length, compact, verticalScale);
  const focusCompany = () => onCompanyFocus?.(company.id);
  const blurCompany = () => onCompanyBlur?.();

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0, transition: TIMELINE_FILTER_EXIT_TRANSITION}}
      transition={{
        opacity: TIMELINE_FILTER_ENTER_TRANSITION,
      }}
      className="relative flex flex-col justify-center"
      onClick={(event) => {
        const target = event.target;

        if (
          target instanceof Element &&
          target.closest('button, a, input, label, select, textarea, [data-row-focus-label]')
        ) {
          return;
        }

        focusCompany();
      }}
      onMouseEnter={focusCompany}
      onMouseLeave={blurCompany}
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') {
          return;
        }

        focusCompany();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'touch') {
          return;
        }

        blurCompany();
      }}
      style={{height: `${getCompanyGroupHeight(company, compact, verticalScale)}px`, gap: `${lineGap}px`}}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {company.productLines.map((productLine, productLineIndex) => (
          <MemoizedProductLineTimelineLane
            key={`${company.id}-${productLine.id}`}
            activeArticleSlug={activeArticleSlug}
            compact={compact}
            company={company}
            companyIndex={companyIndex}
            currentGlobalDay={currentGlobalDay}
            maxDays={maxDays}
            onModelSelect={onModelSelect}
            productLine={productLine}
            productLineIndex={productLineIndex}
            renderWindow={renderWindow}
            timelineStartDay={timelineStartDay}
            verticalScale={verticalScale}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function companyIncludesArticleSlug(company: ProcessedCompany, articleSlug: string | null) {
  if (!articleSlug) {
    return false;
  }

  return company.productLines.some((productLine) =>
    productLine.releases.some((release) => release.articleSlug === articleSlug),
  );
}

const MemoizedCompanyTimelineGroup = React.memo(
  CompanyTimelineGroup,
  (previous, next) => {
    const previousHasActiveArticle = companyIncludesArticleSlug(previous.company, previous.activeArticleSlug);
    const nextHasActiveArticle = companyIncludesArticleSlug(next.company, next.activeArticleSlug);

    return (
      previous.compact === next.compact &&
      previous.company === next.company &&
      previous.companyIndex === next.companyIndex &&
      previous.currentGlobalDay === next.currentGlobalDay &&
      previous.maxDays === next.maxDays &&
      previous.timelineStartDay === next.timelineStartDay &&
      previous.verticalScale === next.verticalScale &&
      timelineDayWindowsMatch(previous.renderWindow, next.renderWindow) &&
      previousHasActiveArticle === nextHasActiveArticle &&
      (!previousHasActiveArticle || previous.activeArticleSlug === next.activeArticleSlug)
    );
  },
);

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
      layout
      initial={{opacity: 0, y: compact ? 12 : 14}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: compact ? 12 : 14}}
      transition={{
        layout: TIMELINE_LAYOUT_TRANSITION,
        opacity: TIMELINE_FILTER_ENTER_TRANSITION,
        y: TIMELINE_FILTER_ENTER_TRANSITION,
      }}
      className={`rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--soft-shadow)] ${
        compact ? 'p-4' : 'p-4'
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <CompanyTypeIconBadge className="h-7 w-7" company={company} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{company.name}</p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--muted)]">
              AI significance {company.significanceScore}
            </p>
          </div>
        </div>

        {hasMultipleLines ? (
          <div className="mt-3 space-y-2">
            {company.productLines.map((productLine) => {
              return (
                <div key={`${company.id}-${productLine.id}-summary-line`} className="min-w-0 rounded-[0.85rem] border border-[var(--edge)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold tracking-tight text-[var(--ink)]">
                      <ModelClassIcon classId={productLine.classId} className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{productLine.shortLabel}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                      {productLine.significanceScore}
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

const MemoizedCompanySummaryCard = React.memo(CompanySummaryCard);

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
  const accessibleLabel = mark === 'calendar' ? `${label} event icon` : `${label} logo`;

  return (
    <span
      aria-label={accessibleLabel}
      className={`${boxClassName} relative grid shrink-0 place-items-center overflow-hidden border border-white/10 ${
        assetPath ? 'bg-[#f4f3ef]' : 'bg-[rgba(255,255,255,0.045)]'
      } shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
      title={accessibleLabel}
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
  const logo = entry
    ? entry.eventKind === 'event'
      ? {
          modelLabel: entry.name,
          modelMark: 'calendar' as const,
        }
      : (article?.logo ?? getFallbackModelLogo(entry))
    : null;
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
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

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

vec3 grayscaleColor(vec3 color) {
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  return clamp(vec3(luma), vec3(0.0), vec3(0.56));
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float triangularNoise(vec2 pixel, vec2 seed) {
  vec2 seededPixel = pixel + seed * 4096.0;
  float a = hash21(seededPixel);
  float b = hash21(seededPixel * 1.37 + seed.yx * 4096.0 + 17.0);
  return a + b - 1.0;
}

float isotropicHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float isotropicTriangularNoise(vec2 pixel, vec2 seed) {
  vec2 seededPixel = pixel + seed * 8192.0;
  float a = isotropicHash(seededPixel);
  float b = isotropicHash(seededPixel + vec2(19.19, 73.13));
  return a + b - 1.0;
}

float blueDitherNoise(vec2 pixel, vec4 seed, float time) {
  float frame = floor(time * 12.0);
  vec2 p = pixel + vec2(frame * 19.37, frame * 47.11);
  vec2 r0 = mat2(0.8660254, -0.5, 0.5, 0.8660254) * p;
  vec2 r1 = mat2(0.6087614, 0.7933533, -0.7933533, 0.6087614) * (p + seed.zw * 113.0);
  vec2 e0 = vec2(0.9238795, 0.3826834);
  vec2 e1 = vec2(-0.3826834, 0.9238795);
  float center = isotropicTriangularNoise(r0, seed.xy) * 0.62 + isotropicTriangularNoise(r1, seed.zw) * 0.38;
  float neighborMean = 0.0;
  neighborMean += isotropicTriangularNoise(r0 + e0, seed.zw);
  neighborMean += isotropicTriangularNoise(r0 - e0, seed.wz);
  neighborMean += isotropicTriangularNoise(r0 + e1, seed.yw);
  neighborMean += isotropicTriangularNoise(r0 - e1, seed.zy);
  neighborMean *= 0.25;

  return clamp((center - neighborMean) * 1.38, -1.0, 1.0);
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

float filmGrain(vec2 pixel, vec4 seed, float time) {
  float frame = floor(time * 8.0);
  vec2 p = pixel + vec2(frame * 37.0, frame * 17.0);
  float coarse = valueNoise(p / 32.0 + seed.xy * 83.0) - 0.5;
  float mid = valueNoise(p / 13.0 + seed.zw * 131.0) - 0.5;
  float fine = triangularNoise(p + vec2(29.0, 71.0), vec2(seed.y, seed.x)) * 0.5;
  float blue = blueDitherNoise(p, seed, time) * 0.5;

  return clamp(coarse * 0.58 + mid * 0.3 + fine * 0.08 + blue * 0.08, -0.5, 0.5) * 2.0;
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

vec2 rotate2d(vec2 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c) * p;
}

float starLayer(vec2 uv, float scale, float threshold, float size, float time) {
  vec2 cell = uv * scale;
  vec2 id = floor(cell);
  vec2 local = fract(cell) - 0.5;
  vec2 offset = vec2(hash21(id + 13.2), hash21(id + 47.7)) - 0.5;
  float seed = hash21(id + 91.4);
  float star = 1.0 - smoothstep(0.0, size, length(local - offset * 0.38));
  float twinkle = 0.72 + 0.28 * sin(time * (0.34 + seed * 0.42) + seed * 6.28318);
  return star * step(threshold, seed) * twinkle;
}

float galaxyDust(vec2 space, float time) {
  vec2 bandSpace = rotate2d(space, -0.36);
  float warp = (fbm(bandSpace * vec2(1.6, 4.7) + vec2(time * 0.012, -time * 0.006)) - 0.5) * 0.16;
  float band = exp(-pow((bandSpace.y + warp) / 0.18, 2.0));
  float taper = smoothstep(1.18, 0.04, abs(bandSpace.x));
  float granularity = smoothstep(0.3, 0.88, fbm(bandSpace * vec2(4.2, 11.0) + vec2(-time * 0.018, time * 0.01)));
  return band * taper * (0.38 + granularity * 0.62);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 space = (uv - vec2(0.5)) * aspect;
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
  color = clamp(color, vec3(0.0), vec3(0.32));
  float alpha = clamp(layeredDensity * 0.48 + caustic * 0.08 + innerScatter * 0.04 + backGlow * 0.08 + edgeEnergy * 0.022 + smoothstep(0.018, 0.28, speed) * 0.055, 0.0, 0.34);
  float panelSmokeMask = widgetMask(uv, aspect.x) * smoothstep(0.018, 0.38, layeredDensity + haloDensity * 0.42);
  vec3 panelGrayscaleColor = grayscaleColor(color);
  color = mix(color, panelGrayscaleColor, panelSmokeMask);
  alpha = clamp(alpha + panelSmokeMask * 0.02, 0.0, 0.36);

  float galaxyTime = uElapsedTime * 0.62;
  float dust = galaxyDust(space, galaxyTime);
  float core = exp(-dot(space - vec2(-0.09, 0.035), space - vec2(-0.09, 0.035)) / 0.085);
  float farStars = starLayer(uv + vec2(galaxyTime * 0.0009, -galaxyTime * 0.0005), 112.0, 0.982, 0.05, galaxyTime);
  float nearStars = starLayer(uv + vec2(-galaxyTime * 0.00055, galaxyTime * 0.0007), 58.0, 0.965, 0.038, galaxyTime);
  float pinStars = starLayer(uv, 182.0, 0.991, 0.028, galaxyTime);
  float stars = clamp(farStars * 0.45 + nearStars * 0.62 + pinStars * 0.34, 0.0, 1.0);
  vec3 dustColor = vec3(0.055, 0.09, 0.13) * dust;
  dustColor += vec3(0.08, 0.04, 0.065) * dust * smoothstep(-0.18, 0.32, space.x);
  dustColor += vec3(0.13, 0.102, 0.052) * core * 0.16;
  vec3 starColor = mix(vec3(0.54, 0.67, 0.72), vec3(0.86, 0.78, 0.62), smoothstep(0.2, 0.88, hash21(floor(uv * 96.0)))) * stars;
  float vignette = smoothstep(1.12, 0.18, length(space));
  vec3 galaxyColor = (dustColor * 0.82 + starColor * 0.22) * vignette;
  float galaxyAlpha = clamp(dust * 0.18 + core * 0.055 + stars * 0.11, 0.0, 0.3) * vignette;
  color = clamp(color * 0.58 + galaxyColor, vec3(0.0), vec3(0.38));
  alpha = clamp(alpha * 0.68 + galaxyAlpha, 0.0, 0.42);

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
  color *= 2.0;
  alpha = max(alpha, debugAlpha);

  float lowContrastMask = 1.0 - smoothstep(0.02, 0.22, length(dyeGradient) * 8.0 + stars * 0.42 + dust * 0.16);
  float dither = blueDitherNoise(gl_FragCoord.xy, uEmitterSeed, uElapsedTime);
  float grain = filmGrain(gl_FragCoord.xy, uEmitterSeed, uElapsedTime);
  vec3 baseBackground = vec3(0.0196, 0.0275, 0.0431);
  float baseTeal = exp(-dot((uv - vec2(0.16, 0.82)) * aspect, (uv - vec2(0.16, 0.82)) * aspect) / 0.48);
  float baseCool = exp(-dot((uv - vec2(0.48, 0.46)) * aspect, (uv - vec2(0.48, 0.46)) * aspect) / 0.62);
  float baseAmber = exp(-dot((uv - vec2(0.88, 0.22)) * aspect, (uv - vec2(0.88, 0.22)) * aspect) / 0.44);
  baseBackground += vec3(0.0025, 0.018, 0.016) * baseTeal;
  baseBackground += vec3(0.012, 0.018, 0.026) * baseCool;
  baseBackground += vec3(0.014, 0.009, 0.004) * baseAmber;
  vec3 composedColor = mix(baseBackground, color, alpha);
  float ditherStrength = mix(0.004, 0.01, lowContrastMask);
  float grainStrength = mix(0.0035, 0.0085, lowContrastMask);
  composedColor = clamp(
    composedColor + vec3(dither * ditherStrength + grain * grainStrength),
    vec3(0.0),
    vec3(1.0)
  );

  gl_FragColor = vec4(composedColor, 1.0);
}
`;

function AuroraBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorFluidEnabledRef = useRef(false);
  const emitterDebugVisibleRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      return;
    }

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
      const pixelRatio = 1;
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

type ZoomAnchor = {
  x: number;
  y: number;
};
type ZoomHandler = (updater: (zoomLevel: number) => number, anchor?: ZoomAnchor) => void;
type TimelinePointerHandler = (event: React.PointerEvent<HTMLDivElement>) => void;
type TimelineTouchHandler = (event: React.TouchEvent<HTMLDivElement>) => void;
type CompanyMoveDirection = 'up' | 'down';
type CompanyMoveHandler = (companyId: string, direction: CompanyMoveDirection) => void;
type PointerPoint = {
  clientX: number;
  clientY: number;
};
type MobileTouchGestureState = {
  distance: number;
  lastMidpointX: number;
  lastMidpointY: number;
  lastX: number;
  lastY: number;
  startX: number;
  startY: number;
  type: 'pan' | 'pinch';
};

type DesktopTimelineExperienceProps = {
  activeArticleSlug: string | null;
  boardView: BoardView;
  camera: CameraState;
  currentGlobalDay: number;
  handlePointerDown: TimelinePointerHandler;
  handlePointerMove: TimelinePointerHandler;
  hiddenCompanyCount: number;
  handleZoomChange: ZoomHandler;
  isPanning: boolean;
  latestCompany: ProcessedCompany | null;
  maxDays: number;
  minZoom: number;
  maxZoom: number;
  maxSummaryQuietDays: number;
  modelExplorer: React.ReactNode;
  monthTicks: Tick[];
  onCompanyHide: (companyId: string) => void;
  onCompanyMove: CompanyMoveHandler;
  onDismissArticle: (target: EventTarget, clientPosition?: {clientX: number; clientY: number}) => void;
  onModelSelect: (slug: string) => void;
  onResetCamera: () => void;
  onShowHiddenCompanies: () => void;
  onToggleTimelineGrid: () => void;
  processedCompanies: ProcessedCompany[];
  renderWindow: TimelineDayWindow;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  showTimelineGrid: boolean;
  stopPanning: TimelinePointerHandler;
  summaryCompanies: ProcessedCompany[];
  timelineStartDay: number;
  timelineWidth: number;
  viewport: ViewportSize;
  worldRef: React.RefObject<HTMLDivElement | null>;
  yearTicks: Tick[];
  zoom: number;
};

type MobileTimelineExperienceProps = {
  activeArticleSlug: string | null;
  boardView: BoardView;
  camera: CameraState;
  currentGlobalDay: number;
  handleTouchEnd: TimelineTouchHandler;
  handleTouchMove: TimelineTouchHandler;
  handleTouchStart: TimelineTouchHandler;
  handleZoomChange: ZoomHandler;
  latestCompany: ProcessedCompany | null;
  hiddenCompanyCount: number;
  minZoom: number;
  maxZoom: number;
  maxDays: number;
  maxSummaryQuietDays: number;
  modelExplorer: React.ReactNode;
  monthTicks: Tick[];
  onCompanyHide: (companyId: string) => void;
  onCompanyMove: CompanyMoveHandler;
  onDismissArticle: (target: EventTarget, clientPosition?: {clientX: number; clientY: number}) => void;
  onModelSelect: (slug: string) => void;
  onResetCamera: () => void;
  onShowHiddenCompanies: () => void;
  onToggleTimelineGrid: () => void;
  processedCompanies: ProcessedCompany[];
  renderWindow: TimelineDayWindow;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  showTimelineGrid: boolean;
  timelineStartDay: number;
  timelineWidth: number;
  viewport: ViewportSize;
  worldRef: React.RefObject<HTMLDivElement | null>;
  yearTicks: Tick[];
  zoom: number;
};

function TimelineRowFocusBands({
  activeCompanyId,
  compact = false,
  onCompanyBlur,
  onCompanyFocus,
  onCompanyTap,
  railWidth,
  rowLayouts,
  timelineWidth,
}: {
  activeCompanyId: string | null;
  compact?: boolean;
  onCompanyBlur?: () => void;
  onCompanyFocus: (companyId: string) => void;
  onCompanyTap?: (companyId: string) => void;
  railWidth: number;
  rowLayouts: CompanyRowLayout[];
  timelineWidth: number;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[6]">
      {rowLayouts.map((row) => {
        const isActive = activeCompanyId === row.company.id;

        return (
          <div
            key={`${row.company.id}-${compact ? 'mobile' : 'desktop'}-focus-band`}
            data-row-focus-band
            className="pointer-events-auto absolute left-0 rounded-[1.25rem]"
            onClick={(event) => {
              if (!onCompanyTap) {
                return;
              }

              event.stopPropagation();
              onCompanyTap(row.company.id);
            }}
            onMouseEnter={() => onCompanyFocus(row.company.id)}
            onMouseLeave={() => onCompanyBlur?.()}
            onPointerEnter={(event) => {
              if (event.pointerType === 'touch') {
                return;
              }

              onCompanyFocus(row.company.id);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'touch') {
                return;
              }

              onCompanyBlur?.();
            }}
            style={{
              height: `${row.height}px`,
              top: `${row.y}px`,
              width: `${timelineWidth + railWidth}px`,
            }}
          >
            <div
              className={`absolute inset-x-0 top-1/2 h-[calc(100%+1.25rem)] -translate-y-1/2 border-y transition duration-200 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: `linear-gradient(90deg, ${toRgbaFromHex(row.company.accent, compact ? 0.16 : 0.12)}, transparent 42%, ${toRgbaFromHex(
                  row.company.accent,
                  0.08,
                )})`,
                borderColor: toRgbaFromHex(row.company.accent, compact ? 0.28 : 0.22),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function CompanyRowFocusLabel({
  compact = false,
  onClearFocus,
  onCompanyHide,
  onCompanyMove,
  onPointerEnter,
  onPointerLeave,
  row,
  rowCount,
  screenX,
  screenY,
}: {
  compact?: boolean;
  onClearFocus: () => void;
  onCompanyHide: (companyId: string) => void;
  onCompanyMove: CompanyMoveHandler;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  row: CompanyRowLayout;
  rowCount: number;
  screenX: number;
  screenY: number;
}) {
  const company = row.company;
  const latestRelease = company.latestRelease;
  const latestLabel = latestRelease ? latestRelease.name : 'No releases';
  const lineLabel = company.productLines.map((productLine) => productLine.shortLabel).join(' / ');
  const actionClassName =
    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--edge)] bg-[rgba(255,255,255,0.035)] text-[var(--ink-soft)] transition duration-200 hover:border-[var(--edge-strong)] hover:bg-[rgba(255,255,255,0.075)] hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-30';

  return (
    <div
      data-row-focus-label
      className="pointer-events-none absolute z-30 will-change-transform"
      style={{
        transform: `translate3d(${screenX}px, ${screenY}px, 0) translateY(-50%)`,
      }}
    >
      <motion.div
        initial={{opacity: 0, scale: 0.96, x: -8}}
        animate={{opacity: 1, scale: 1, x: 0}}
        exit={{opacity: 0, scale: 0.96, x: -8}}
        transition={{duration: 0.16, ease: [0.22, 1, 0.36, 1]}}
        className={`pointer-events-auto rounded-[1.15rem] border border-[var(--edge-strong)] bg-[rgba(8,11,16,0.92)] shadow-[0_22px_48px_-30px_rgba(0,0,0,0.88)] backdrop-blur-xl ${
          compact ? 'w-[min(15.5rem,calc(100vw-8rem))] p-3' : 'w-[18rem] p-3.5'
        }`}
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <div className="flex min-w-0 items-start gap-3">
          <CompanyLogoBadge compact={compact} company={company} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold leading-tight tracking-tight text-[var(--ink)]">{company.name}</p>
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{backgroundColor: company.accent}}
              />
            </div>
            <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
              {lineLabel}
            </p>
            <p className="mt-2 truncate text-xs font-medium text-[var(--ink-soft)]">{latestLabel}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--edge)] pt-2.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Score {company.significanceScore} · Row {row.index + 1}/{rowCount}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Move ${company.name} up`}
              title={`Move ${company.name} up`}
              className={actionClassName}
              disabled={row.index === 0}
              onClick={(event) => {
                event.stopPropagation();
                onCompanyMove(company.id, 'up');
              }}
            >
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label={`Move ${company.name} down`}
              title={`Move ${company.name} down`}
              className={actionClassName}
              disabled={row.index === rowCount - 1}
              onClick={(event) => {
                event.stopPropagation();
                onCompanyMove(company.id, 'down');
              }}
            >
              <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label={`Hide ${company.name}`}
              title={`Hide ${company.name}`}
              className={actionClassName}
              onClick={(event) => {
                event.stopPropagation();
                onCompanyHide(company.id);
                onClearFocus();
              }}
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DesktopTimelineExperience({
  activeArticleSlug,
  boardView,
  camera,
  currentGlobalDay,
  handlePointerDown,
  handlePointerMove,
  hiddenCompanyCount,
  handleZoomChange,
  isPanning,
  latestCompany,
  maxDays,
  minZoom,
  maxZoom,
  maxSummaryQuietDays,
  modelExplorer,
  monthTicks,
  onCompanyHide,
  onCompanyMove,
  onDismissArticle,
  onModelSelect,
  onResetCamera,
  onShowHiddenCompanies,
  onToggleTimelineGrid,
  processedCompanies,
  renderWindow,
  scrollContainerRef,
  showTimelineGrid,
  stopPanning,
  summaryCompanies,
  timelineStartDay,
  timelineWidth,
  viewport,
  worldRef,
  yearTicks,
  zoom,
}: DesktopTimelineExperienceProps) {
  const timelineVerticalScale = 1;
  const timelineLayout = getTimelineLayout(false, timelineVerticalScale);
  const timelineMinHeight = getTimelineMinHeight(processedCompanies, false, timelineVerticalScale);
  const canvasLayout = getCanvasWorldLayout({
    currentGlobalDay,
    maxDays,
    summaryCount: summaryCompanies.length,
    timelineStartDay,
    timelineHeight: timelineMinHeight,
    timelineWidth,
    viewport,
  });
  const companyRowLayouts = getCompanyRowLayouts(processedCompanies, false, timelineVerticalScale, timelineLayout);
  const [focusedCompanyId, setFocusedCompanyId] = useState<string | null>(null);
  const focusClearTimeoutRef = useRef<number | null>(null);
  const cancelFocusClear = () => {
    if (focusClearTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(focusClearTimeoutRef.current);
    focusClearTimeoutRef.current = null;
  };
  const focusCompany = (companyId: string) => {
    cancelFocusClear();
    setFocusedCompanyId(companyId);
  };
  const clearFocus = () => {
    cancelFocusClear();
    setFocusedCompanyId(null);
  };
  const scheduleFocusClear = () => {
    cancelFocusClear();
    focusClearTimeoutRef.current = window.setTimeout(() => {
      setFocusedCompanyId(null);
      focusClearTimeoutRef.current = null;
    }, 120);
  };
  useEffect(() => () => cancelFocusClear(), []);
  const focusedRow = companyRowLayouts.find((row) => row.company.id === focusedCompanyId) ?? null;
  const focusLabelWidth = 288;
  const focusLabelX = clampNumber(116, 16, Math.max(16, viewport.width - focusLabelWidth - 16));
  const focusLabelY = focusedRow
    ? clampNumber(
        (canvasLayout.timelineY + focusedRow.y + focusedRow.height / 2 - camera.y) * zoom,
        82,
        Math.max(82, viewport.height - 84),
      )
    : 0;
  const boardDescription = boardView.isDefault
    ? 'Explore important AI milestones across LLMs, open-source labs, generative media, audio, coding tools, events, robotics, vehicle autonomy, and the companies shaping them.'
    : boardView.isEmpty
      ? 'Turn on one or more product lines to compose the timeline.'
      : boardView.isComposite
        ? `${boardView.label} puts selected product lines onto one shared timeline for full-field comparison.`
        : `${boardView.label} is shown on the same absolute timeline, so newer product lines can be scanned without flattening every company into separate rows.`;
  const timelineWorldLeft = canvasLayout.timelineX + timelineStartDay * TIMELINE_PIXELS_PER_DAY;
  const timelineWidthWithRail = timelineWidth + LABEL_RAIL_WIDTH;

  return (
    <section className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden">
      <div className="absolute left-5 top-5 z-40 [--category-expanded-width:286px]">
        {modelExplorer}
      </div>

      <div
        ref={scrollContainerRef}
        className={`absolute inset-0 overflow-hidden [overflow-anchor:none] ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onClickCapture={(event) =>
          onDismissArticle(event.target, {clientX: event.clientX, clientY: event.clientY})
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopPanning}
        onPointerCancel={stopPanning}
        onLostPointerCapture={stopPanning}
      >
        <div
          ref={worldRef}
          className="relative will-change-transform"
          style={{
            height: `${canvasLayout.worldHeight}px`,
            transform: getTimelineWorldTransform(camera, zoom),
            transformOrigin: '0 0',
            width: `${canvasLayout.worldWidth}px`,
            ['--map-zoom' as string]: String(getMapZoomCssValue(zoom)),
          }}
        >
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.75, ease: [0.22, 1, 0.36, 1]}}
            className="timeline-border-sheen timeline-fluid-obstacle absolute z-30 rounded-[2rem] border border-[var(--edge)] bg-[rgba(10,13,19,0.86)] p-7 shadow-[var(--panel-shadow)] backdrop-blur-xl"
            style={{
              left: `${canvasLayout.contentCards.intro.x}px`,
              top: `${canvasLayout.contentCards.intro.y}px`,
              width: `${canvasLayout.contentCards.intro.width}px`,
            }}
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{boardView.label}</p>
            <h1 className="mt-4 max-w-4xl text-5xl leading-none tracking-tighter text-[var(--ink)]">
              Mapping major AI progress across time
            </h1>
            <p className="mt-5 max-w-[68ch] text-base leading-7 text-[var(--ink-soft)]">{boardDescription}</p>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1]}}
            className="timeline-border-sheen timeline-fluid-obstacle absolute z-30 rounded-[1.45rem] border border-[var(--edge)] bg-[rgba(10,13,19,0.78)] p-5 shadow-[var(--soft-shadow)] backdrop-blur-xl"
            style={{
              left: `${canvasLayout.contentCards.notes.x}px`,
              top: `${canvasLayout.contentCards.notes.y}px`,
              width: `${canvasLayout.contentCards.notes.width}px`,
              ['--border-sheen-delay' as string]: '2.8s',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Reading notes</p>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              Drag the field to pan the board like a canvas. Wheel or use the zoom rail to move the camera in and out.
            </p>
          </motion.div>

        <motion.section
          data-timeline-field
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.9, delay: 0.14, ease: [0.22, 1, 0.36, 1]}}
            className="absolute z-10 overflow-visible"
            style={{
              height: `${timelineMinHeight}px`,
              left: `${timelineWorldLeft}px`,
              top: `${canvasLayout.timelineY}px`,
              width: `${timelineWidthWithRail}px`,
            }}
        >
          <div className="relative">
            <TimelineRowFocusBands
              activeCompanyId={focusedCompanyId}
              onCompanyBlur={scheduleFocusClear}
              onCompanyFocus={focusCompany}
              onCompanyTap={focusCompany}
              railWidth={LABEL_RAIL_WIDTH}
              rowLayouts={companyRowLayouts}
              timelineWidth={timelineWidth}
            />

            {processedCompanies.length === 0 ? (
              <div className="absolute bottom-0 left-[320px] right-0 top-0 z-20 flex items-center justify-center px-6">
                <TimelineEmptyState
                  boardView={boardView}
                  hiddenCompanyCount={hiddenCompanyCount}
                  onShowHiddenCompanies={onShowHiddenCompanies}
                />
              </div>
            ) : null}

              <div
                className="relative"
                style={{minWidth: `${timelineWidthWithRail}px`}}
              >
                <div style={{paddingLeft: `${LABEL_RAIL_WIDTH}px`}}>
                  <div
                    className="relative"
                    style={{width: `${timelineWidth}px`, minHeight: `${timelineMinHeight}px`}}
                  >
                    {showTimelineGrid ? (
                      <div className="pointer-events-none absolute inset-0" data-timeline-grid>
                        {monthTicks.map((tick) => (
                          <div
                            key={`month-${tick.days}`}
                            className="absolute bottom-0 top-0 border-l border-[var(--grid-line)]"
                            style={{left: `${getTimelineDayOffsetPx(tick.days, timelineStartDay)}px`}}
                          >
                            <div className="absolute left-0 top-10 -translate-x-1/2">
                              <div className="timeline-map-screen-fixed">
                                <div
                                  className="timeline-map-screen-label rounded-full bg-[var(--surface-strong)] px-2 py-1 font-medium uppercase tracking-[0.18em] text-[var(--muted)] shadow-[var(--soft-shadow)]"
                                  style={getTimelineMapLabelStyle(10)}
                                >
                                  {tick.label}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {yearTicks.map((tick) => (
                          <div
                            key={`year-${tick.label}`}
                            className="absolute bottom-0 top-0 border-l-2 border-[var(--grid-line-strong)]"
                            style={{left: `${getTimelineDayOffsetPx(tick.days, timelineStartDay)}px`}}
                          >
                            <div className="absolute left-0 top-2 -translate-x-1/2">
                              <div className="timeline-map-screen-fixed">
                                <div
                                  className="timeline-map-screen-label rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1.5 font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)]"
                                  style={getTimelineMapLabelStyle(11)}
                                >
                                  {tick.label}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div
                          className="absolute bottom-0 top-0 border-l-2 border-[var(--today-line)]"
                          style={{left: `${getTimelineDayOffsetPx(currentGlobalDay, timelineStartDay)}px`}}
                        >
                          <div className="absolute left-0 top-1 -translate-x-1/2">
                            <div className="timeline-map-screen-fixed">
                              <div
                                className="timeline-map-screen-label inline-flex items-center gap-2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-2 font-semibold uppercase tracking-[0.18em] text-[var(--ink)] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]"
                                style={getTimelineMapLabelStyle(11)}
                              >
                                Today
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {processedCompanies.length > 0 ? (
                      <motion.div
                        className="relative flex flex-col"
                        style={{
                          gap: `${timelineLayout.companyGap}px`,
                          paddingBottom: `${timelineLayout.bottomPadding}px`,
                          paddingTop: `${timelineLayout.topPadding}px`,
                        }}
                      >
                        <AnimatePresence initial={false} mode="popLayout">
                          {processedCompanies.map((company, companyIndex) => (
                            <MemoizedCompanyTimelineGroup
                              key={company.id}
                              activeArticleSlug={activeArticleSlug}
                              company={company}
                              companyIndex={companyIndex}
                              currentGlobalDay={currentGlobalDay}
                              maxDays={maxDays}
                              onCompanyBlur={scheduleFocusClear}
                              onCompanyFocus={focusCompany}
                              onModelSelect={onModelSelect}
                              renderWindow={renderWindow}
                              timelineStartDay={timelineStartDay}
                              verticalScale={timelineVerticalScale}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    ) : null}

                    <div aria-hidden="true" className="timeline-tail-fade" />
                  </div>
                </div>
              </div>
          </div>
        </motion.section>

          <motion.div
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1]}}
            className="absolute grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            style={{
              left: `${canvasLayout.contentCards.latest.x}px`,
              top: `${canvasLayout.contentCards.latest.y}px`,
              width: `${canvasLayout.contentCards.latest.width}px`,
            }}
          >
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
              Latest company on the board: <span className="font-semibold text-[var(--ink)]">{latestCompany?.name ?? 'n/a'}</span>
              {' '}with <span className="font-semibold text-[var(--ink)]">{latestCompany?.latestRelease?.name ?? 'n/a'}</span>.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">All dates rendered in UTC</p>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.72, delay: 0.24, ease: [0.22, 1, 0.36, 1]}}
            className="absolute"
            style={{
              left: `${canvasLayout.contentCards.summaries.x}px`,
              top: `${canvasLayout.contentCards.summaries.y}px`,
              width: `${canvasLayout.contentCards.summaries.width}px`,
            }}
          >
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Provider recency</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <AnimatePresence initial={false} mode="popLayout">
                {summaryCompanies.map((company, index) => (
                  <MemoizedCompanySummaryCard
                    key={company.id}
                    company={company}
                    currentGlobalDay={currentGlobalDay}
                    index={index}
                    maxSummaryQuietDays={maxSummaryQuietDays}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {focusedRow ? (
          <React.Fragment key={`${focusedRow.company.id}-desktop-focus-label`}>
            <CompanyRowFocusLabel
              onClearFocus={clearFocus}
              onCompanyHide={onCompanyHide}
              onCompanyMove={onCompanyMove}
              onPointerEnter={cancelFocusClear}
              onPointerLeave={scheduleFocusClear}
              row={focusedRow}
              rowCount={companyRowLayouts.length}
              screenX={focusLabelX}
              screenY={focusLabelY}
            />
          </React.Fragment>
        ) : null}
      </AnimatePresence>

      <TimelineZoomRail
        className="right-5 top-1/2 -translate-y-1/2"
        maxZoom={maxZoom}
        minZoom={minZoom}
        onZoomChange={handleZoomChange}
        zoom={zoom}
      />

      <div className="absolute right-6 top-[calc(50%+12.5rem)] z-40 flex flex-col items-end gap-2">
        <SurfaceButton
          label={showTimelineGrid ? 'Hide timeline grid' : 'Show timeline grid'}
          onClick={onToggleTimelineGrid}
          pressed={showTimelineGrid}
        >
          {showTimelineGrid ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.8} />
          )}
          <span>Grid</span>
        </SurfaceButton>
        <SurfaceButton label="Reset camera" onClick={onResetCamera}>
          <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
          <span>Reset</span>
        </SurfaceButton>
        {hiddenCompanyCount > 0 ? (
          <SurfaceButton label="Show hidden companies" onClick={onShowHiddenCompanies}>
            <Layers3 className="h-4 w-4" strokeWidth={1.8} />
            <span>Companies</span>
          </SurfaceButton>
        ) : null}
      </div>
    </section>
  );
}

function MobileTimelineExperience({
  activeArticleSlug,
  boardView,
  camera,
  currentGlobalDay,
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
  handleZoomChange,
  hiddenCompanyCount,
  latestCompany,
  minZoom,
  maxZoom,
  maxDays,
  maxSummaryQuietDays,
  modelExplorer,
  monthTicks,
  onCompanyHide,
  onCompanyMove,
  onDismissArticle,
  onModelSelect,
  onResetCamera,
  onShowHiddenCompanies,
  onToggleTimelineGrid,
  processedCompanies,
  renderWindow,
  scrollContainerRef,
  showTimelineGrid,
  timelineStartDay,
  timelineWidth,
  viewport,
  worldRef,
  yearTicks,
  zoom,
}: MobileTimelineExperienceProps) {
  const timelineVerticalScale = 1;
  const timelineLayout = getTimelineLayout(true, timelineVerticalScale);
  const timelineMinHeight = getTimelineMinHeight(processedCompanies, true, timelineVerticalScale);
  const canvasLayout = getCanvasWorldLayout({
    compact: true,
    currentGlobalDay,
    maxDays,
    summaryCount: processedCompanies.length,
    timelineStartDay,
    timelineHeight: timelineMinHeight,
    timelineWidth,
    viewport,
  });
  const companyRowLayouts = getCompanyRowLayouts(processedCompanies, true, timelineVerticalScale, timelineLayout);
  const [focusedCompanyId, setFocusedCompanyId] = useState<string | null>(null);
  const focusCompany = (companyId: string) => setFocusedCompanyId(companyId);
  const clearFocus = () => setFocusedCompanyId(null);
  const focusedRow = companyRowLayouts.find((row) => row.company.id === focusedCompanyId) ?? null;
  const focusLabelWidth = 248;
  const focusLabelX = Math.max(16, Math.min(126, Math.max(16, viewport.width - focusLabelWidth - 12)));
  const focusLabelY = focusedRow
    ? clampNumber(
        (canvasLayout.timelineY + focusedRow.y + focusedRow.height / 2 - camera.y) * zoom,
        98,
        Math.max(98, viewport.height - 104),
      )
    : 0;
  const boardDescription = boardView.isDefault
    ? 'Explore important AI milestones across LLMs, open-source labs, generative media, audio, coding tools, events, robotics, vehicle autonomy, and the companies shaping them.'
    : boardView.isEmpty
      ? 'Turn on one or more product lines to compose the timeline.'
      : boardView.isComposite
        ? `${boardView.label} shows selected product lines together. Use zoom when the field gets dense.`
        : `${boardView.label} is isolated into its own board, keeping the release field readable on mobile.`;
  const timelineWorldLeft = canvasLayout.timelineX + timelineStartDay * TIMELINE_PIXELS_PER_DAY;
  const timelineWidthWithRail = timelineWidth + MOBILE_LABEL_RAIL_WIDTH;

  return (
    <section className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden">
      <div className="absolute left-3 top-3 z-40 [--category-expanded-width:min(20rem,calc(100vw-5rem))]">
        {modelExplorer}
      </div>

      <div
        ref={scrollContainerRef}
        className="absolute inset-0 touch-none overflow-hidden [overflow-anchor:none]"
        onClickCapture={(event) =>
          onDismissArticle(event.target, {clientX: event.clientX, clientY: event.clientY})
        }
        onClick={(event) => {
          const target = event.target;

          if (!(target instanceof Element)) {
            return;
          }

          if (
            target.closest('[data-row-focus-band], [data-row-focus-label], button, a, input, label, select, textarea')
          ) {
            return;
          }

          clearFocus();
        }}
        onTouchCancel={handleTouchEnd}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
      >
        <div
          ref={worldRef}
          className="relative will-change-transform"
          style={{
            height: `${canvasLayout.worldHeight}px`,
            transform: getTimelineWorldTransform(camera, zoom),
            transformOrigin: '0 0',
            width: `${canvasLayout.worldWidth}px`,
            ['--map-zoom' as string]: String(getMapZoomCssValue(zoom)),
          }}
        >
          <motion.div
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.72, ease: [0.22, 1, 0.36, 1]}}
            className="timeline-border-sheen timeline-fluid-obstacle absolute z-30 rounded-[1.7rem] border border-[var(--edge)] bg-[rgba(10,13,19,0.86)] p-5 shadow-[var(--panel-shadow)] backdrop-blur-xl"
            style={{
              left: `${canvasLayout.contentCards.intro.x}px`,
              top: `${canvasLayout.contentCards.intro.y}px`,
              width: `${canvasLayout.contentCards.intro.width}px`,
            }}
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{boardView.label}</p>
            <h1 className="mt-3 max-w-sm text-[2.25rem] leading-none tracking-tighter text-[var(--ink)]">
              Mapping major AI progress across time
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{boardDescription}</p>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.68, delay: 0.08, ease: [0.22, 1, 0.36, 1]}}
            className="timeline-border-sheen timeline-fluid-obstacle absolute z-30 rounded-[1.25rem] border border-[var(--edge)] bg-[rgba(10,13,19,0.78)] p-4 shadow-[var(--soft-shadow)] backdrop-blur-xl"
            style={{
              left: `${canvasLayout.contentCards.notes.x}px`,
              top: `${canvasLayout.contentCards.notes.y}px`,
              width: `${canvasLayout.contentCards.notes.width}px`,
              ['--border-sheen-delay' as string]: '2.8s',
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Reading notes</p>
            <p className="mt-3 text-xs leading-5 text-[var(--ink-soft)]">
              Drag to pan the board. Pinch or use the zoom rail to move the camera.
            </p>
          </motion.div>

        <motion.section
          data-timeline-field
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1]}}
            className="absolute z-10 overflow-visible"
            style={{
              height: `${timelineMinHeight}px`,
              left: `${timelineWorldLeft}px`,
              top: `${canvasLayout.timelineY}px`,
              width: `${timelineWidthWithRail}px`,
            }}
        >
          <div className="relative">
            <TimelineRowFocusBands
              activeCompanyId={focusedCompanyId}
              compact
              onCompanyFocus={focusCompany}
              onCompanyTap={focusCompany}
              railWidth={MOBILE_LABEL_RAIL_WIDTH}
              rowLayouts={companyRowLayouts}
              timelineWidth={timelineWidth}
            />

            {processedCompanies.length === 0 ? (
              <div className="absolute bottom-0 left-[196px] right-0 top-0 z-20 flex items-center justify-center px-3">
                <TimelineEmptyState
                  boardView={boardView}
                  hiddenCompanyCount={hiddenCompanyCount}
                  onShowHiddenCompanies={onShowHiddenCompanies}
                />
              </div>
            ) : null}

              <div
                className="relative"
                style={{minWidth: `${timelineWidthWithRail}px`}}
              >
                <div style={{paddingLeft: `${MOBILE_LABEL_RAIL_WIDTH}px`}}>
                  <div
                    className="relative"
                    style={{width: `${timelineWidth}px`, minHeight: `${timelineMinHeight}px`}}
                  >
                    {showTimelineGrid ? (
                      <div className="pointer-events-none absolute inset-0" data-timeline-grid>
                        {monthTicks.map((tick) => (
                          <div
                            key={`mobile-month-${tick.days}`}
                            className="absolute bottom-0 top-0 border-l border-[var(--grid-line)]"
                            style={{left: `${getTimelineDayOffsetPx(tick.days, timelineStartDay)}px`}}
                          >
                            <div className="absolute left-0 top-9 -translate-x-1/2">
                              <div className="timeline-map-screen-fixed">
                                <div
                                  className="timeline-map-screen-label rounded-full bg-[var(--surface-strong)] px-2 py-1 font-medium uppercase tracking-[0.16em] text-[var(--muted)] shadow-[var(--soft-shadow)]"
                                  style={getTimelineMapLabelStyle(9)}
                                >
                                  {tick.label}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {yearTicks.map((tick) => (
                          <div
                            key={`mobile-year-${tick.label}`}
                            className="absolute bottom-0 top-0 border-l-2 border-[var(--grid-line-strong)]"
                            style={{left: `${getTimelineDayOffsetPx(tick.days, timelineStartDay)}px`}}
                          >
                            <div className="absolute left-0 top-1 -translate-x-1/2">
                              <div className="timeline-map-screen-fixed">
                                <div
                                  className="timeline-map-screen-label rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2.5 py-1 font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)]"
                                  style={getTimelineMapLabelStyle(10)}
                                >
                                  {tick.label}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div
                          className="absolute bottom-0 top-0 border-l-2 border-[var(--today-line)]"
                          style={{left: `${getTimelineDayOffsetPx(currentGlobalDay, timelineStartDay)}px`}}
                        >
                          <div className="absolute left-0 top-1 -translate-x-1/2">
                            <div className="timeline-map-screen-fixed">
                              <div
                                className="timeline-map-screen-label inline-flex items-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2.5 py-1.5 font-semibold uppercase tracking-[0.16em] text-[var(--ink)] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]"
                                style={getTimelineMapLabelStyle(10)}
                              >
                                Today
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {processedCompanies.length > 0 ? (
                      <motion.div
                        className="relative flex flex-col"
                        style={{
                          gap: `${timelineLayout.companyGap}px`,
                          paddingBottom: `${timelineLayout.bottomPadding}px`,
                          paddingTop: `${timelineLayout.topPadding}px`,
                        }}
                      >
                        <AnimatePresence initial={false} mode="popLayout">
                          {processedCompanies.map((company, companyIndex) => (
                            <MemoizedCompanyTimelineGroup
                              key={company.id}
                              activeArticleSlug={activeArticleSlug}
                              compact
                              company={company}
                              companyIndex={companyIndex}
                              currentGlobalDay={currentGlobalDay}
                              maxDays={maxDays}
                              onCompanyFocus={focusCompany}
                              onModelSelect={onModelSelect}
                              renderWindow={renderWindow}
                              timelineStartDay={timelineStartDay}
                              verticalScale={timelineVerticalScale}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    ) : null}

                    <div aria-hidden="true" className="timeline-tail-fade timeline-tail-fade--compact" />
                  </div>
                </div>
              </div>
          </div>
        </motion.section>

          <motion.div
            initial={{opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.62, delay: 0.18, ease: [0.22, 1, 0.36, 1]}}
            className="absolute"
            style={{
              left: `${canvasLayout.contentCards.latest.x}px`,
              top: `${canvasLayout.contentCards.latest.y}px`,
              width: `${canvasLayout.contentCards.latest.width}px`,
            }}
          >
            <p className="text-xs leading-5 text-[var(--ink-soft)]">
              Latest: <span className="font-semibold text-[var(--ink)]">{latestCompany?.name ?? 'n/a'}</span>
              {' '}with <span className="font-semibold text-[var(--ink)]">{latestCompany?.latestRelease?.name ?? 'n/a'}</span>.
            </p>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--muted)]">All dates rendered in UTC</p>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.68, delay: 0.24, ease: [0.22, 1, 0.36, 1]}}
            className="absolute"
            style={{
              left: `${canvasLayout.contentCards.summaries.x}px`,
              top: `${canvasLayout.contentCards.summaries.y}px`,
              width: `${canvasLayout.contentCards.summaries.width}px`,
            }}
          >
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Provider recency</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence initial={false} mode="popLayout">
                {processedCompanies.map((company, index) => (
                  <MemoizedCompanySummaryCard
                    key={company.id}
                    compact
                    company={company}
                    currentGlobalDay={currentGlobalDay}
                    index={index}
                    maxSummaryQuietDays={maxSummaryQuietDays}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {focusedRow ? (
          <React.Fragment key={`${focusedRow.company.id}-mobile-focus-label`}>
            <CompanyRowFocusLabel
              compact
              onClearFocus={clearFocus}
              onCompanyHide={onCompanyHide}
              onCompanyMove={onCompanyMove}
              row={focusedRow}
              rowCount={companyRowLayouts.length}
              screenX={focusLabelX}
              screenY={focusLabelY}
            />
          </React.Fragment>
        ) : null}
      </AnimatePresence>

      <TimelineZoomRail
        compact
        className="right-1 top-1/2 -translate-y-1/2"
        maxZoom={maxZoom}
        minZoom={minZoom}
        onZoomChange={handleZoomChange}
        zoom={zoom}
      />

      <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        <SurfaceButton
          label={showTimelineGrid ? 'Hide timeline grid' : 'Show timeline grid'}
          onClick={onToggleTimelineGrid}
          pressed={showTimelineGrid}
        >
          {showTimelineGrid ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.8} />
          )}
          <span className="sr-only">Grid</span>
        </SurfaceButton>
        <SurfaceButton label="Reset camera" onClick={onResetCamera}>
          <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
          <span className="sr-only">Reset</span>
        </SurfaceButton>
        {hiddenCompanyCount > 0 ? (
          <SurfaceButton label="Show hidden companies" onClick={onShowHiddenCompanies}>
            <Layers3 className="h-4 w-4" strokeWidth={1.8} />
            <span className="sr-only">Companies</span>
          </SurfaceButton>
        ) : null}
      </div>
    </section>
  );
}

export default function App() {
  const [selectedPresetIds, setSelectedPresetIds] = useState<PresetId[]>(DEFAULT_SELECTED_PRESET_IDS);
  const [companySortMode, setCompanySortMode] = useState<CompanySortMode>('significance');
  const [significanceDisplayLimit, setSignificanceDisplayLimit] = useState<SignificanceDisplayLimit>(
    DEFAULT_SIGNIFICANCE_DISPLAY_LIMIT,
  );
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches,
  );
  const [zoom, setZoom] = useState(DEFAULT_DESKTOP_ZOOM);
  const [mobileZoom, setMobileZoom] = useState(DEFAULT_MOBILE_ZOOM);
  const [isPanning, setIsPanning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showTimelineGrid, setShowTimelineGrid] = useState(true);
  const [hiddenCompanyIds, setHiddenCompanyIds] = useState<string[]>([]);
  const [companyOrderIds, setCompanyOrderIds] = useState<string[]>(() => companies.map((company) => company.id));
  const [desktopCamera, setDesktopCamera] = useState<CameraState>({x: 0, y: 0});
  const [mobileCamera, setMobileCamera] = useState<CameraState>({x: 0, y: 0});
  const [route, setRoute] = useState<AppRoute>(() => getCurrentAppRoute());
  const zoomRef = useRef(DEFAULT_DESKTOP_ZOOM);
  const mobileZoomRef = useRef(DEFAULT_MOBILE_ZOOM);
  const desktopCameraRef = useRef<CameraState>({x: 0, y: 0});
  const mobileCameraRef = useRef<CameraState>({x: 0, y: 0});
  const desktopCameraInterpolationRef = useRef<CameraInterpolationState>({
    frameId: null,
    lastFrameAt: null,
    stiffness: CAMERA_TARGET_INTERPOLATION_STIFFNESS,
    target: {
      camera: {x: 0, y: 0},
      zoom: DEFAULT_DESKTOP_ZOOM,
    },
    zoomAnchor: null,
  });
  const mobileCameraInterpolationRef = useRef<CameraInterpolationState>({
    frameId: null,
    lastFrameAt: null,
    stiffness: CAMERA_TARGET_INTERPOLATION_STIFFNESS,
    target: {
      camera: {x: 0, y: 0},
      zoom: DEFAULT_MOBILE_ZOOM,
    },
    zoomAnchor: null,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null);
  const desktopWorldRef = useRef<HTMLDivElement>(null);
  const mobileWorldRef = useRef<HTMLDivElement>(null);
  const desktopPointerOffsetXRef = useRef<number | null>(null);
  const desktopPointerOffsetYRef = useRef<number | null>(null);
  const mobilePointerOffsetXRef = useRef<number | null>(null);
  const mobilePointerOffsetYRef = useRef<number | null>(null);
  const hasPositionedInitialView = useRef(false);
  const hasPositionedInitialMobileView = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const lastFocusedArticleSlugRef = useRef<string | null>(null);
  const blockTimelineArticleDismissClickRef = useRef(false);
  const dragFrameRef = useRef<number | null>(null);
  const timelineWheelHandlerRef = useRef<(event: WheelEvent) => void>(() => undefined);
  const removeWheelCaptureListenerRef = useRef<(() => void) | null>(null);
  const latestDragPointRef = useRef<{
    clientX: number;
    clientY: number;
  } | null>(null);
  const panStateRef = useRef({
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  });
  const mobileTouchPointsRef = useRef<Map<number, PointerPoint>>(new Map<number, PointerPoint>());
  const mobileTouchGestureRef = useRef<MobileTouchGestureState | null>(null);
  const [viewportSizes, setViewportSizes] = useState<{desktop: ViewportSize; mobile: ViewportSize}>({
    desktop: {height: 0, width: 0},
    mobile: {height: 0, width: 0},
  });
  const activeArticleSlug = route.kind === 'model' ? route.slug : null;
  const activeArticleEntry = activeArticleSlug ? (modelReleaseIndexBySlug[activeArticleSlug] ?? null) : null;
  const isArticleOpen = route.kind === 'model';

  const today = useMemo(() => new Date(), []);
  const currentGlobalDay = (today.getTime() - START_DATE.getTime()) / DAY_MS;
  const boardView = useMemo(() => getBoardView(selectedPresetIds), [selectedPresetIds]);
  const visibleCompanies = useMemo(
    () => getVisibleCompanies(companies, selectedPresetIds),
    [selectedPresetIds],
  );
  const orderedVisibleCompanies = useMemo(
    () => orderCompanies(visibleCompanies, companyOrderIds, hiddenCompanyIds, companySortMode, currentGlobalDay),
    [companyOrderIds, companySortMode, currentGlobalDay, hiddenCompanyIds, visibleCompanies],
  );
  const displayedVisibleCompanies = useMemo(
    () => getDisplayedCompanies(orderedVisibleCompanies, significanceDisplayLimit, activeArticleEntry?.companyId),
    [activeArticleEntry?.companyId, orderedVisibleCompanies, significanceDisplayLimit],
  );
  const displayedCompanyIds = useMemo(
    () => displayedVisibleCompanies.map((company) => company.id),
    [displayedVisibleCompanies],
  );
  const hiddenCompanyCount = useMemo(() => {
    const hiddenCompanyIdSet = new Set(hiddenCompanyIds);
    return visibleCompanies.filter((company) => hiddenCompanyIdSet.has(company.id)).length;
  }, [hiddenCompanyIds, visibleCompanies]);
  const presetStats = useMemo(() => buildPresetStats(companies), []);
  const timelineData = useMemo(
    () => buildTimelineData(displayedVisibleCompanies, currentGlobalDay),
    [currentGlobalDay, displayedVisibleCompanies],
  );
  const baseTimelineDays = Math.max(Math.ceil(currentGlobalDay) + 36, timelineData.latestGlobalDay + 36, 720);
  const baseTimelineWidth = Math.max(baseTimelineDays * TIMELINE_PIXELS_PER_DAY, 1);
  const desktopMinZoom = getFitZoom(viewportSizes.desktop.width, LABEL_RAIL_WIDTH, baseTimelineWidth);
  const mobileMinZoom = getFitZoom(viewportSizes.mobile.width, MOBILE_LABEL_RAIL_WIDTH, baseTimelineWidth);
  const desktopTimelineRange = getProceduralTimelineRange({
    camera: desktopCamera,
    minimumDays: baseTimelineDays,
    viewport: viewportSizes.desktop,
    zoom,
  });
  const mobileTimelineRange = getProceduralTimelineRange({
    camera: mobileCamera,
    compact: true,
    minimumDays: baseTimelineDays,
    viewport: viewportSizes.mobile,
    zoom: mobileZoom,
  });
  const maxDays = desktopTimelineRange.endDay;
  const timelineStartDay = desktopTimelineRange.startDay;
  const mobileMaxDays = mobileTimelineRange.endDay;
  const mobileTimelineStartDay = mobileTimelineRange.startDay;
  const timelineWidth = Math.max(getTimelineDurationWidthPx(timelineStartDay, maxDays), 1);
  const mobileTimelineWidth = Math.max(
    getTimelineDurationWidthPx(mobileTimelineStartDay, mobileMaxDays),
    1,
  );
  const desktopReleaseRenderWindow = useMemo(
    () =>
      getTimelineReleaseRenderWindow({
        camera: desktopCamera,
        viewport: viewportSizes.desktop,
        zoom,
      }),
    [desktopCamera, viewportSizes.desktop, zoom],
  );
  const mobileReleaseRenderWindow = useMemo(
    () =>
      getTimelineReleaseRenderWindow({
        camera: mobileCamera,
        compact: true,
        viewport: viewportSizes.mobile,
        zoom: mobileZoom,
      }),
    [mobileCamera, mobileZoom, viewportSizes.mobile],
  );
  const desktopTimelineVerticalScale = 1;
  const mobileTimelineVerticalScale = 1;
  const desktopTimelineContentHeight = getTimelineMinHeight(timelineData.processedCompanies, false, desktopTimelineVerticalScale);
  const mobileTimelineContentHeight = getTimelineMinHeight(timelineData.processedCompanies, true, mobileTimelineVerticalScale);
  const desktopTickWindow = useMemo(
    () =>
      getTimelineViewportDayWindow({
        camera: desktopCamera,
        futureBufferDays: TIMELINE_TICK_FUTURE_BUFFER_DAYS,
        pastBufferDays: TIMELINE_TICK_PAST_BUFFER_DAYS,
        viewport: viewportSizes.desktop,
        zoom,
      }),
    [desktopCamera, viewportSizes.desktop, zoom],
  );
  const mobileTickWindow = useMemo(
    () =>
      getTimelineViewportDayWindow({
        camera: mobileCamera,
        compact: true,
        futureBufferDays: TIMELINE_TICK_FUTURE_BUFFER_DAYS,
        pastBufferDays: TIMELINE_TICK_PAST_BUFFER_DAYS,
        viewport: viewportSizes.mobile,
        zoom: mobileZoom,
      }),
    [mobileCamera, mobileZoom, viewportSizes.mobile],
  );
  const {monthTicks, yearTicks} = useMemo(() => buildTicks(desktopTickWindow), [desktopTickWindow]);
  const {monthTicks: mobileMonthTicks, yearTicks: mobileYearTicks} = useMemo(
    () => buildTicks(mobileTickWindow),
    [mobileTickWindow],
  );

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
  const desktopCanvasLayout = useMemo(
    () =>
      getCanvasWorldLayout({
        currentGlobalDay,
        maxDays,
        summaryCount: summaryCompanies.length,
        timelineStartDay,
        timelineHeight: desktopTimelineContentHeight,
        timelineWidth,
        viewport: viewportSizes.desktop,
      }),
    [
      currentGlobalDay,
      desktopTimelineContentHeight,
      maxDays,
      summaryCompanies.length,
      timelineStartDay,
      timelineWidth,
      viewportSizes.desktop,
    ],
  );
  const mobileCanvasLayout = useMemo(
    () =>
      getCanvasWorldLayout({
        compact: true,
        currentGlobalDay,
        maxDays: mobileMaxDays,
        summaryCount: timelineData.processedCompanies.length,
        timelineStartDay: mobileTimelineStartDay,
        timelineHeight: mobileTimelineContentHeight,
        timelineWidth: mobileTimelineWidth,
        viewport: viewportSizes.mobile,
      }),
    [
      currentGlobalDay,
      mobileMaxDays,
      mobileTimelineStartDay,
      mobileTimelineContentHeight,
      mobileTimelineWidth,
      timelineData.processedCompanies.length,
      viewportSizes.mobile,
    ],
  );

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

      if (desktopCameraInterpolationRef.current.frameId !== null) {
        window.cancelAnimationFrame(desktopCameraInterpolationRef.current.frameId);
      }

      if (mobileCameraInterpolationRef.current.frameId !== null) {
        window.cancelAnimationFrame(mobileCameraInterpolationRef.current.frameId);
      }
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
    const updateViewportSizes = () => {
      setViewportSizes({
        desktop: {
          height: scrollContainerRef.current?.clientHeight ?? window.innerHeight,
          width: scrollContainerRef.current?.clientWidth ?? window.innerWidth,
        },
        mobile: {
          height: mobileScrollContainerRef.current?.clientHeight ?? window.innerHeight,
          width: mobileScrollContainerRef.current?.clientWidth ?? window.innerWidth,
        },
      });
    };

    updateViewportSizes();
    const animationFrame = window.requestAnimationFrame(updateViewportSizes);
    window.addEventListener('resize', updateViewportSizes);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateViewportSizes);
    };
  }, [isDesktopViewport, isReady]);

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

      const defaultView = getDefaultCameraView(desktopCanvasLayout);
      desktopCameraRef.current = defaultView.camera;
      desktopCameraInterpolationRef.current.target = defaultView;
      commitDesktopCameraZoomState(defaultView.zoom, defaultView.camera);
      hasPositionedInitialView.current = true;
    };

    positionInitialDesktopView();

    if (hasPositionedInitialView.current) {
      return;
    }

    window.addEventListener('resize', positionInitialDesktopView);
    return () => window.removeEventListener('resize', positionInitialDesktopView);
  }, [desktopCanvasLayout, viewportSizes.desktop, zoom]);

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

      const defaultView = getDefaultCameraView(mobileCanvasLayout, true);
      mobileCameraRef.current = defaultView.camera;
      mobileCameraInterpolationRef.current.target = defaultView;
      commitMobileCameraZoomState(defaultView.zoom, defaultView.camera);
      hasPositionedInitialMobileView.current = true;
    };

    positionInitialMobileView();

    if (hasPositionedInitialMobileView.current) {
      return;
    }

    window.addEventListener('resize', positionInitialMobileView);
    return () => window.removeEventListener('resize', positionInitialMobileView);
  }, [mobileCanvasLayout, mobileZoom, viewportSizes.mobile]);

  const togglePreset = (presetId: PresetId) => {
    setSignificanceDisplayLimit('all');
    setSelectedPresetIds((currentIds) => {
      if (currentIds.includes(presetId)) {
        return currentIds.filter((currentId) => currentId !== presetId);
      }

      return [...currentIds, presetId];
    });
  };

  const resetFilters = () => {
    setSelectedPresetIds(DEFAULT_SELECTED_PRESET_IDS);
    setCompanySortMode('significance');
    setSignificanceDisplayLimit(DEFAULT_SIGNIFICANCE_DISPLAY_LIMIT);
    setHiddenCompanyIds([]);
    setCompanyOrderIds(companies.map((company) => company.id));
  };

  const selectAllPresets = () => {
    setSignificanceDisplayLimit('all');
    setSelectedPresetIds(modelPresets.map((preset) => preset.id));
  };

  const clearAllPresets = () => {
    setSignificanceDisplayLimit('all');
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

  const toggleTimelineGrid = useCallback(() => {
    setShowTimelineGrid((isVisible) => !isVisible);
  }, []);

  const moveCompany = (companyId: string, direction: CompanyMoveDirection) => {
    setCompanyOrderIds((currentIds) => moveVisibleCompanyId(currentIds, displayedCompanyIds, companyId, direction));
  };

  const navigateToModelSlug = (slug: string) => {
    window.location.hash = `#/models/${encodeURIComponent(slug)}`;
  };

  const dismissActiveTimelineArticle = () => {
    if (route.kind !== 'model') {
      return;
    }

    lastFocusedArticleSlugRef.current = null;
    navigateToTimeline();
  };

  const handleTimelineBackgroundDismiss = (
    target: EventTarget,
    clientPosition?: {clientX: number; clientY: number},
  ) => {
    if (blockTimelineArticleDismissClickRef.current) {
      blockTimelineArticleDismissClickRef.current = false;
      return;
    }

    tryDismissTimelineArticleOnBackgroundClick(
      target,
      activeArticleSlug,
      dismissActiveTimelineArticle,
      clientPosition,
    );
  };

  const explorerProps = {
    boardView,
    companySortMode,
    isOpen: isExplorerOpen,
    onClearAll: clearAllPresets,
    onCompanySortModeChange: setCompanySortMode,
    onPresetToggle: togglePreset,
    onReset: resetFilters,
    onSelectAll: selectAllPresets,
    onSignificanceDisplayLimitChange: setSignificanceDisplayLimit,
    onToggle: () => setIsExplorerOpen((isOpen) => !isOpen),
    presetStats,
    selectedPresetIds,
    significanceDisplayLimit,
    totalMatchedCompanyCount: orderedVisibleCompanies.length,
    visibleCompanyCount: displayedVisibleCompanies.length,
  };

  const commitDesktopCameraZoomState = (nextZoom: number, nextCamera: CameraState) => {
    zoomRef.current = nextZoom;
    desktopCameraRef.current = nextCamera;
    applyTimelineWorldTransform(desktopWorldRef.current, nextCamera, nextZoom);
    setZoom(nextZoom);
    setDesktopCamera(nextCamera);
  };

  const commitMobileCameraZoomState = (nextZoom: number, nextCamera: CameraState) => {
    mobileZoomRef.current = nextZoom;
    mobileCameraRef.current = nextCamera;
    applyTimelineWorldTransform(mobileWorldRef.current, nextCamera, nextZoom);
    setMobileZoom(nextZoom);
    setMobileCamera(nextCamera);
  };

  const runDesktopCameraInterpolationFrame = (timestamp: number) => {
    const interpolation = desktopCameraInterpolationRef.current;
    const deltaSeconds =
      interpolation.lastFrameAt === null
        ? 1 / 60
        : clampNumber((timestamp - interpolation.lastFrameAt) / 1000, 0, 0.064);
    interpolation.lastFrameAt = timestamp;

    const {target, zoomAnchor} = interpolation;
    const alpha = 1 - Math.exp(-interpolation.stiffness * deltaSeconds);
    const nextZoom = lerpNumber(zoomRef.current, target.zoom, alpha);
    const nextCamera = zoomAnchor
      ? getCameraForZoomWorldAnchor(
          zoomAnchor.worldX,
          zoomAnchor.worldY,
          zoomAnchor.viewportX,
          zoomAnchor.viewportY,
          nextZoom,
        )
      : {
          x: lerpNumber(desktopCameraRef.current.x, target.camera.x, alpha),
          y: lerpNumber(desktopCameraRef.current.y, target.camera.y, alpha),
        };

    commitDesktopCameraZoomState(nextZoom, nextCamera);

    const cameraDistance = Math.hypot(target.camera.x - nextCamera.x, target.camera.y - nextCamera.y);
    const zoomDistance = Math.abs(target.zoom - nextZoom);

    if (cameraDistance > CAMERA_TARGET_SNAP_DISTANCE || zoomDistance > CAMERA_TARGET_SNAP_ZOOM) {
      interpolation.frameId = window.requestAnimationFrame(runDesktopCameraInterpolationFrame);
      return;
    }

    interpolation.frameId = null;
    interpolation.lastFrameAt = null;
    const snappedCamera = zoomAnchor
      ? getCameraForZoomWorldAnchor(
          zoomAnchor.worldX,
          zoomAnchor.worldY,
          zoomAnchor.viewportX,
          zoomAnchor.viewportY,
          target.zoom,
        )
      : target.camera;
    interpolation.zoomAnchor = null;
    commitDesktopCameraZoomState(target.zoom, snappedCamera);
  };

  const runMobileCameraInterpolationFrame = (timestamp: number) => {
    const interpolation = mobileCameraInterpolationRef.current;
    const deltaSeconds =
      interpolation.lastFrameAt === null
        ? 1 / 60
        : clampNumber((timestamp - interpolation.lastFrameAt) / 1000, 0, 0.064);
    interpolation.lastFrameAt = timestamp;

    const {target, zoomAnchor} = interpolation;
    const alpha = 1 - Math.exp(-interpolation.stiffness * deltaSeconds);
    const nextZoom = lerpNumber(mobileZoomRef.current, target.zoom, alpha);
    const nextCamera = zoomAnchor
      ? getCameraForZoomWorldAnchor(
          zoomAnchor.worldX,
          zoomAnchor.worldY,
          zoomAnchor.viewportX,
          zoomAnchor.viewportY,
          nextZoom,
        )
      : {
          x: lerpNumber(mobileCameraRef.current.x, target.camera.x, alpha),
          y: lerpNumber(mobileCameraRef.current.y, target.camera.y, alpha),
        };

    commitMobileCameraZoomState(nextZoom, nextCamera);

    const cameraDistance = Math.hypot(target.camera.x - nextCamera.x, target.camera.y - nextCamera.y);
    const zoomDistance = Math.abs(target.zoom - nextZoom);

    if (cameraDistance > CAMERA_TARGET_SNAP_DISTANCE || zoomDistance > CAMERA_TARGET_SNAP_ZOOM) {
      interpolation.frameId = window.requestAnimationFrame(runMobileCameraInterpolationFrame);
      return;
    }

    interpolation.frameId = null;
    interpolation.lastFrameAt = null;
    const snappedCamera = zoomAnchor
      ? getCameraForZoomWorldAnchor(
          zoomAnchor.worldX,
          zoomAnchor.worldY,
          zoomAnchor.viewportX,
          zoomAnchor.viewportY,
          target.zoom,
        )
      : target.camera;
    interpolation.zoomAnchor = null;
    commitMobileCameraZoomState(target.zoom, snappedCamera);
  };

  const setDesktopCameraTarget = (target: CameraViewState, options?: CameraTargetOptions) => {
    const interpolation = desktopCameraInterpolationRef.current;
    interpolation.target = target;
    interpolation.stiffness = options?.stiffness ?? CAMERA_TARGET_INTERPOLATION_STIFFNESS;

    if (options) {
      interpolation.zoomAnchor = options.zoomAnchor ?? null;
    } else {
      interpolation.zoomAnchor = null;
    }

    if (interpolation.frameId === null) {
      interpolation.lastFrameAt = null;
      interpolation.frameId = window.requestAnimationFrame(runDesktopCameraInterpolationFrame);
    }
  };

  const setMobileCameraTarget = (target: CameraViewState, options?: CameraTargetOptions) => {
    const interpolation = mobileCameraInterpolationRef.current;
    interpolation.target = target;
    interpolation.stiffness = options?.stiffness ?? CAMERA_TARGET_INTERPOLATION_STIFFNESS;

    if (options) {
      interpolation.zoomAnchor = options.zoomAnchor ?? null;
    } else {
      interpolation.zoomAnchor = null;
    }

    if (interpolation.frameId === null) {
      interpolation.lastFrameAt = null;
      interpolation.frameId = window.requestAnimationFrame(runMobileCameraInterpolationFrame);
    }
  };

  const jumpToTimelineRegion = useCallback(
    (target: TimelineJumpTarget) => {
      const compact = !isDesktopViewport;
      const viewport = compact ? viewportSizes.mobile : viewportSizes.desktop;

      if (viewport.width <= 0 || viewport.height <= 0) {
        return;
      }

      const layout = compact ? mobileCanvasLayout : desktopCanvasLayout;
      const timelineHeight = compact ? mobileTimelineContentHeight : desktopTimelineContentHeight;
      const bounds = resolveTimelineJumpTarget(
        target,
        timelineData.processedCompanies,
        layout,
        timelineHeight,
        compact,
        1,
      );

      if (!bounds) {
        return;
      }

      const insets = getTimelineFocusInsets(viewport, compact, isArticleOpen);
      const anchor =
        isArticleOpen && !compact
          ? getArticleTimelineFocusAnchor(viewport, insets)
          : DEFAULT_TIMELINE_FOCUS_ANCHOR;
      const view = getCameraViewForTimelineRegion({
        anchor,
        bounds,
        focusMaxZoom: compact ? TIMELINE_REGION_FOCUS_MAX_ZOOM_MOBILE : TIMELINE_REGION_FOCUS_MAX_ZOOM_DESKTOP,
        insets,
        layout,
        maxZoom: compact ? MOBILE_MAX_ZOOM : DESKTOP_MAX_ZOOM,
        minZoom: compact ? mobileMinZoom : desktopMinZoom,
        viewport,
      });

      if (!view) {
        return;
      }

      const targetOptions: CameraTargetOptions =
        target.kind === 'slug' ? {stiffness: MODEL_FOCUS_CAMERA_INTERPOLATION_STIFFNESS} : {};

      if (compact) {
        setMobileCameraTarget(view, targetOptions);
        return;
      }

      setDesktopCameraTarget(view, targetOptions);
    },
    [
      desktopCanvasLayout,
      desktopMinZoom,
      desktopTimelineContentHeight,
      isArticleOpen,
      isDesktopViewport,
      mobileCanvasLayout,
      mobileMinZoom,
      mobileTimelineContentHeight,
      timelineData.processedCompanies,
      viewportSizes.desktop,
      viewportSizes.mobile,
    ],
  );

  useEffect(() => {
    if (!isArticleOpen || !activeArticleSlug) {
      if (!isArticleOpen) {
        lastFocusedArticleSlugRef.current = null;
      }

      return;
    }

    if (!isReady || isPanning || activePointerIdRef.current !== null) {
      return;
    }

    const viewport = isDesktopViewport ? viewportSizes.desktop : viewportSizes.mobile;

    if (viewport.width <= 0) {
      return;
    }

    if (lastFocusedArticleSlugRef.current === activeArticleSlug) {
      return;
    }

    if (!findProcessedReleaseBySlug(timelineData.processedCompanies, activeArticleSlug)) {
      return;
    }

    jumpToTimelineRegion({kind: 'slug', slug: activeArticleSlug});
    lastFocusedArticleSlugRef.current = activeArticleSlug;
    // jumpToTimelineRegion is intentionally omitted: it changes when the camera pans because
    // procedural layout depends on viewport position, which would re-snap the camera every frame.
  }, [
    activeArticleSlug,
    isArticleOpen,
    isDesktopViewport,
    isPanning,
    isReady,
    timelineData.processedCompanies,
    viewportSizes.desktop,
    viewportSizes.mobile,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = getTimelinePinNavDirectionFromKey(event.key);

      if (!direction || shouldIgnoreTimelinePinArrowNavigation(event) || !isReady) {
        return;
      }

      const compact = !isDesktopViewport;
      const viewport = compact ? viewportSizes.mobile : viewportSizes.desktop;

      if (viewport.width <= 0 || viewport.height <= 0) {
        return;
      }

      const layout = compact ? mobileCanvasLayout : desktopCanvasLayout;
      const verticalScale = compact ? mobileTimelineVerticalScale : desktopTimelineVerticalScale;
      const pinTargets = collectTimelinePinNavTargets(
        timelineData.processedCompanies,
        layout,
        compact,
        verticalScale,
      );

      if (pinTargets.length === 0) {
        return;
      }

      const camera = compact ? mobileCameraRef.current : desktopCameraRef.current;
      const zoomLevel = compact ? mobileZoomRef.current : zoomRef.current;
      const origin = getTimelinePinNavOrigin(
        timelineData.processedCompanies,
        layout,
        compact,
        verticalScale,
        activeArticleSlug,
        camera,
        zoomLevel,
        viewport,
      );
      const nextPin = findNearestTimelinePinInDirection(origin, pinTargets, direction, {
        excludeSlug: activeArticleSlug,
        minPrimaryDistance: activeArticleSlug ? TIMELINE_PIN_NAV_PRIMARY_EPS : 0,
      });

      if (!nextPin || nextPin.slug === activeArticleSlug) {
        return;
      }

      event.preventDefault();
      lastFocusedArticleSlugRef.current = null;
      navigateToModelSlug(nextPin.slug);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeArticleSlug,
    desktopCanvasLayout,
    isDesktopViewport,
    isReady,
    mobileCanvasLayout,
    mobileTimelineVerticalScale,
    desktopTimelineVerticalScale,
    timelineData.processedCompanies,
    viewportSizes.desktop,
    viewportSizes.mobile,
  ]);

  const cancelDesktopCameraInterpolation = () => {
    const interpolation = desktopCameraInterpolationRef.current;

    if (interpolation.frameId !== null) {
      window.cancelAnimationFrame(interpolation.frameId);
      interpolation.frameId = null;
    }

    interpolation.lastFrameAt = null;
    interpolation.target = {
      camera: desktopCameraRef.current,
      zoom: zoomRef.current,
    };
    interpolation.stiffness = CAMERA_TARGET_INTERPOLATION_STIFFNESS;
    interpolation.zoomAnchor = null;
  };

  const cancelMobileCameraInterpolation = () => {
    const interpolation = mobileCameraInterpolationRef.current;

    if (interpolation.frameId !== null) {
      window.cancelAnimationFrame(interpolation.frameId);
      interpolation.frameId = null;
    }

    interpolation.lastFrameAt = null;
    interpolation.target = {
      camera: mobileCameraRef.current,
      zoom: mobileZoomRef.current,
    };
    interpolation.stiffness = CAMERA_TARGET_INTERPOLATION_STIFFNESS;
    interpolation.zoomAnchor = null;
  };

  const resetDesktopCamera = () => {
    const container = scrollContainerRef.current;
    desktopPointerOffsetXRef.current = (container?.clientWidth ?? viewportSizes.desktop.width) / 2;
    desktopPointerOffsetYRef.current = (container?.clientHeight ?? viewportSizes.desktop.height) / 2;
    setDesktopCameraTarget(getDefaultCameraView(desktopCanvasLayout));
  };

  const resetMobileCamera = () => {
    const container = mobileScrollContainerRef.current;
    mobilePointerOffsetXRef.current = (container?.clientWidth ?? viewportSizes.mobile.width) / 2;
    mobilePointerOffsetYRef.current = (container?.clientHeight ?? viewportSizes.mobile.height) / 2;
    setMobileCameraTarget(getDefaultCameraView(mobileCanvasLayout, true));
  };

  const handleZoomChange: ZoomHandler = (updater, anchor) => {
    const container = scrollContainerRef.current;
    const viewport = viewportSizes.desktop;
    const anchorX = clampNumber(
      anchor?.x ?? desktopPointerOffsetXRef.current ?? (container?.clientWidth ?? viewport.width) / 2,
      0,
      container?.clientWidth ?? viewport.width,
    );
    const anchorY = clampNumber(
      anchor?.y ?? desktopPointerOffsetYRef.current ?? (container?.clientHeight ?? viewport.height) / 2,
      0,
      container?.clientHeight ?? viewport.height,
    );

    const interpolation = desktopCameraInterpolationRef.current;
    const previousZoom = zoomRef.current;
    const nextZoom = Number(clampNumber(updater(previousZoom), desktopMinZoom, DESKTOP_MAX_ZOOM).toFixed(3));

    if (nextZoom === previousZoom) {
      return;
    }

    const zoomAnchor = resolveZoomInterpolationAnchor({
      anchorX,
      anchorY,
      camera: desktopCameraRef.current,
      existingAnchor: interpolation.zoomAnchor,
      zoom: previousZoom,
    });
    const nextCamera = getCameraForZoomWorldAnchor(
      zoomAnchor.worldX,
      zoomAnchor.worldY,
      anchorX,
      anchorY,
      nextZoom,
    );

    setDesktopCameraTarget(
      {
        camera: nextCamera,
        zoom: nextZoom,
      },
      {zoomAnchor},
    );
  };

  const handleMobileZoomChange: ZoomHandler = (updater, anchor) => {
    const container = mobileScrollContainerRef.current;
    const viewport = viewportSizes.mobile;
    const anchorX = clampNumber(
      anchor?.x ?? mobilePointerOffsetXRef.current ?? (container?.clientWidth ?? viewport.width) / 2,
      0,
      container?.clientWidth ?? viewport.width,
    );
    const anchorY = clampNumber(
      anchor?.y ?? mobilePointerOffsetYRef.current ?? (container?.clientHeight ?? viewport.height) / 2,
      0,
      container?.clientHeight ?? viewport.height,
    );

    const interpolation = mobileCameraInterpolationRef.current;
    const previousZoom = mobileZoomRef.current;
    const nextZoom = Number(clampNumber(updater(previousZoom), mobileMinZoom, MOBILE_MAX_ZOOM).toFixed(3));

    if (nextZoom === previousZoom) {
      return;
    }

    const zoomAnchor = resolveZoomInterpolationAnchor({
      anchorX,
      anchorY,
      camera: mobileCameraRef.current,
      existingAnchor: interpolation.zoomAnchor,
      zoom: previousZoom,
    });
    const nextCamera = getCameraForZoomWorldAnchor(
      zoomAnchor.worldX,
      zoomAnchor.worldY,
      anchorX,
      anchorY,
      nextZoom,
    );

    setMobileCameraTarget(
      {
        camera: nextCamera,
        zoom: nextZoom,
      },
      {zoomAnchor},
    );
  };

  timelineWheelHandlerRef.current = (event: WheelEvent) => {
    if (!scrollContainerRef.current || event.deltaY === 0) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const anchor = {
      x: clampNumber(event.clientX - containerRect.left, 0, container.clientWidth),
      y: clampNumber(event.clientY - containerRect.top, 0, container.clientHeight),
    };
    desktopPointerOffsetXRef.current = anchor.x;
    desktopPointerOffsetYRef.current = anchor.y;

    const normalizedDeltaY =
      event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * container.clientHeight
          : event.deltaY;

    handleZoomChange(
      (current) =>
        getSteppedZoom(current, -normalizedDeltaY * WHEEL_ZOOM_PROGRESS_PER_PIXEL, desktopMinZoom, DESKTOP_MAX_ZOOM),
      anchor,
    );
  };

  useEffect(() => {
    if (!isReady || !isDesktopViewport) {
      return undefined;
    }

    const container = scrollContainerRef.current;

    if (!container) {
      return undefined;
    }

    const handleNativeWheel = (event: WheelEvent) => timelineWheelHandlerRef.current(event);
    container.addEventListener('wheel', handleNativeWheel, {passive: false});

    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [isDesktopViewport, isReady]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    desktopPointerOffsetXRef.current = event.clientX - containerRect.left;
    desktopPointerOffsetYRef.current = event.clientY - containerRect.top;
    cancelDesktopCameraInterpolation();

    blockTimelineArticleDismissClickRef.current = false;
    activePointerIdRef.current = event.pointerId;
    panStateRef.current = {
      lastX: event.clientX,
      lastY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
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
    desktopPointerOffsetYRef.current = latestDragPoint.clientY - containerRect.top;

    const deltaX = latestDragPoint.clientX - panStateRef.current.lastX;
    const deltaY = latestDragPoint.clientY - panStateRef.current.lastY;
    const nextCamera = {
      x: desktopCameraRef.current.x - deltaX / Math.max(zoomRef.current, 0.001),
      y: desktopCameraRef.current.y - deltaY / Math.max(zoomRef.current, 0.001),
    };
    desktopCameraInterpolationRef.current.target = {
      camera: nextCamera,
      zoom: zoomRef.current,
    };
    desktopCameraRef.current = nextCamera;
    applyTimelineWorldTransform(desktopWorldRef.current, nextCamera, zoomRef.current);

    panStateRef.current.lastX = latestDragPoint.clientX;
    panStateRef.current.lastY = latestDragPoint.clientY;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && scrollContainerRef.current) {
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      desktopPointerOffsetXRef.current = clampNumber(
        event.clientX - containerRect.left,
        0,
        scrollContainerRef.current.clientWidth,
      );
      desktopPointerOffsetYRef.current = clampNumber(
        event.clientY - containerRect.top,
        0,
        scrollContainerRef.current.clientHeight,
      );
    }

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

    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
      applyDragCameraUpdate();
    }

    if (scrollContainerRef.current.hasPointerCapture(event.pointerId)) {
      scrollContainerRef.current.releasePointerCapture(event.pointerId);
    }

    activePointerIdRef.current = null;
    latestDragPointRef.current = null;
    removeWheelCaptureListenerRef.current?.();
    removeWheelCaptureListenerRef.current = null;

    const pointerTravel = Math.hypot(
      event.clientX - panStateRef.current.startX,
      event.clientY - panStateRef.current.startY,
    );

    if (pointerTravel > TIMELINE_BACKGROUND_CLICK_MOVE_THRESHOLD_PX) {
      blockTimelineArticleDismissClickRef.current = true;
    } else {
      tryDismissTimelineArticleOnBackgroundClick(
        event.target,
        activeArticleSlug,
        dismissActiveTimelineArticle,
        {clientX: event.clientX, clientY: event.clientY},
      );
    }

    setDesktopCamera(desktopCameraRef.current);
    setIsPanning(false);
  };

  const getMobileTouchPair = () => Array.from<PointerPoint>(mobileTouchPointsRef.current.values()).slice(0, 2);

  const getTouchDistance = (left: PointerPoint, right: PointerPoint) =>
    Math.hypot(right.clientX - left.clientX, right.clientY - left.clientY);

  const getTouchMidpoint = (left: PointerPoint, right: PointerPoint) => ({
    clientX: (left.clientX + right.clientX) / 2,
    clientY: (left.clientY + right.clientY) / 2,
  });

  const updateMobilePointerAnchor = (point: PointerPoint, container: HTMLDivElement) => {
    const rect = container.getBoundingClientRect();
    mobilePointerOffsetXRef.current = clampNumber(point.clientX - rect.left, 0, container.clientWidth);
    mobilePointerOffsetYRef.current = clampNumber(point.clientY - rect.top, 0, container.clientHeight);
  };

  const resetMobileGestureFromRemainingPointers = () => {
    const points = Array.from<PointerPoint>(mobileTouchPointsRef.current.values());

    if (points.length === 0) {
      mobileTouchGestureRef.current = null;
      mobilePointerOffsetXRef.current = null;
      mobilePointerOffsetYRef.current = null;
      return;
    }

    if (points.length === 1) {
      const point = points[0];
      mobileTouchGestureRef.current = {
        distance: 0,
        lastMidpointX: point.clientX,
        lastMidpointY: point.clientY,
        lastX: point.clientX,
        lastY: point.clientY,
        startX: point.clientX,
        startY: point.clientY,
        type: 'pan',
      };
      return;
    }

    const [left, right] = points;
    const midpoint = getTouchMidpoint(left, right);
    mobileTouchGestureRef.current = {
      distance: Math.max(getTouchDistance(left, right), 1),
      lastMidpointX: midpoint.clientX,
      lastMidpointY: midpoint.clientY,
      lastX: midpoint.clientX,
      lastY: midpoint.clientY,
      startX: midpoint.clientX,
      startY: midpoint.clientY,
      type: 'pinch',
    };
  };

  const applyMobileCameraPanDelta = (deltaX: number, deltaY: number) => {
    const nextCamera = {
      x: mobileCameraRef.current.x - deltaX / Math.max(mobileZoomRef.current, 0.001),
      y: mobileCameraRef.current.y - deltaY / Math.max(mobileZoomRef.current, 0.001),
    };
    mobileCameraInterpolationRef.current.target = {
      camera: nextCamera,
      zoom: mobileZoomRef.current,
    };
    mobileCameraRef.current = nextCamera;
    applyTimelineWorldTransform(mobileWorldRef.current, nextCamera, mobileZoomRef.current);
  };

  const handleMobilePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || !mobileScrollContainerRef.current) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    mobileTouchPointsRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });
    cancelMobileCameraInterpolation();
    resetMobileGestureFromRemainingPointers();
    event.preventDefault();
  };

  const handleMobilePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || !mobileScrollContainerRef.current) {
      return;
    }

    if (!mobileTouchPointsRef.current.has(event.pointerId)) {
      return;
    }

    const container = mobileScrollContainerRef.current;
    mobileTouchPointsRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    const gesture = mobileTouchGestureRef.current;
    const points = Array.from<PointerPoint>(mobileTouchPointsRef.current.values());

    if (points.length === 1) {
      const point = points[0];
      updateMobilePointerAnchor(point, container);

      if (gesture?.type === 'pan') {
        const deltaX = point.clientX - gesture.lastX;
        const deltaY = point.clientY - gesture.lastY;
        applyMobileCameraPanDelta(deltaX, deltaY);
        gesture.lastX = point.clientX;
        gesture.lastY = point.clientY;
      } else {
        resetMobileGestureFromRemainingPointers();
      }

      event.preventDefault();
      return;
    }

    const [left, right] = getMobileTouchPair();

    if (!left || !right) {
      return;
    }

    const midpoint = getTouchMidpoint(left, right);
    const distance = Math.max(getTouchDistance(left, right), 1);
    updateMobilePointerAnchor(midpoint, container);

    if (gesture?.type !== 'pinch') {
      resetMobileGestureFromRemainingPointers();
      event.preventDefault();
      return;
    }

    const deltaX = midpoint.clientX - gesture.lastMidpointX;
    const deltaY = midpoint.clientY - gesture.lastMidpointY;
    applyMobileCameraPanDelta(deltaX, deltaY);

    const zoomRatio = clampNumber(distance / Math.max(gesture.distance, 1), 0.78, 1.28);
    handleMobileZoomChange((current) => current * zoomRatio, {
      x: mobilePointerOffsetXRef.current ?? container.clientWidth / 2,
      y: mobilePointerOffsetYRef.current ?? container.clientHeight / 2,
    });

    gesture.distance = distance;
    gesture.lastMidpointX = midpoint.clientX;
    gesture.lastMidpointY = midpoint.clientY;
    gesture.lastX = midpoint.clientX;
    gesture.lastY = midpoint.clientY;
    event.preventDefault();
  };

  const stopMobilePointerGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    mobileTouchPointsRef.current.delete(event.pointerId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetMobileGestureFromRemainingPointers();
    setMobileCamera(mobileCameraRef.current);
  };

  const isInteractiveTouchTarget = (target: EventTarget | null) =>
    target instanceof Element &&
    Boolean(target.closest('button, a, input, label, select, textarea, [data-timeline-pin]'));

  const getTouchPoint = (touch: React.Touch): PointerPoint => ({
    clientX: touch.clientX,
    clientY: touch.clientY,
  });

  const resetMobileTouchGesture = (touches: React.TouchList) => {
    if (touches.length === 0) {
      mobileTouchGestureRef.current = null;
      mobilePointerOffsetXRef.current = null;
      mobilePointerOffsetYRef.current = null;
      return;
    }

    if (touches.length === 1) {
      const point = getTouchPoint(touches[0]);
      mobileTouchGestureRef.current = {
        distance: 0,
        lastMidpointX: point.clientX,
        lastMidpointY: point.clientY,
        lastX: point.clientX,
        lastY: point.clientY,
        startX: point.clientX,
        startY: point.clientY,
        type: 'pan',
      };
      return;
    }

    const left = getTouchPoint(touches[0]);
    const right = getTouchPoint(touches[1]);
    const midpoint = getTouchMidpoint(left, right);
    mobileTouchGestureRef.current = {
      distance: Math.max(getTouchDistance(left, right), 1),
      lastMidpointX: midpoint.clientX,
      lastMidpointY: midpoint.clientY,
      lastX: midpoint.clientX,
      lastY: midpoint.clientY,
      startX: midpoint.clientX,
      startY: midpoint.clientY,
      type: 'pinch',
    };
  };

  const handleMobileTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!mobileScrollContainerRef.current || isInteractiveTouchTarget(event.target)) {
      return;
    }

    cancelMobileCameraInterpolation();
    resetMobileTouchGesture(event.touches);
  };

  const handleMobileTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!mobileScrollContainerRef.current || isInteractiveTouchTarget(event.target)) {
      return;
    }

    const container = mobileScrollContainerRef.current;
    const gesture = mobileTouchGestureRef.current;

    if (!gesture) {
      resetMobileTouchGesture(event.touches);
      return;
    }

    if (event.touches.length === 1) {
      const point = getTouchPoint(event.touches[0]);
      updateMobilePointerAnchor(point, container);

      if (gesture.type === 'pan') {
        const deltaX = point.clientX - gesture.lastX;
        const deltaY = point.clientY - gesture.lastY;
        applyMobileCameraPanDelta(deltaX, deltaY);
        gesture.lastX = point.clientX;
        gesture.lastY = point.clientY;
      } else {
        resetMobileTouchGesture(event.touches);
      }

      return;
    }

    if (event.touches.length < 2) {
      return;
    }

    const left = getTouchPoint(event.touches[0]);
    const right = getTouchPoint(event.touches[1]);
    const midpoint = getTouchMidpoint(left, right);
    const distance = Math.max(getTouchDistance(left, right), 1);
    updateMobilePointerAnchor(midpoint, container);

    if (gesture.type !== 'pinch') {
      resetMobileTouchGesture(event.touches);
      return;
    }

    const deltaX = midpoint.clientX - gesture.lastMidpointX;
    const deltaY = midpoint.clientY - gesture.lastMidpointY;
    applyMobileCameraPanDelta(deltaX, deltaY);

    const zoomRatio = clampNumber(distance / Math.max(gesture.distance, 1), 0.78, 1.28);
    handleMobileZoomChange((current) => current * zoomRatio, {
      x: mobilePointerOffsetXRef.current ?? container.clientWidth / 2,
      y: mobilePointerOffsetYRef.current ?? container.clientHeight / 2,
    });

    gesture.distance = distance;
    gesture.lastMidpointX = midpoint.clientX;
    gesture.lastMidpointY = midpoint.clientY;
    gesture.lastX = midpoint.clientX;
    gesture.lastY = midpoint.clientY;
  };

  const handleMobileTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const gesture = mobileTouchGestureRef.current;
    resetMobileTouchGesture(event.touches);
    setMobileCamera(mobileCameraRef.current);

    if (!gesture || gesture.type !== 'pan' || event.changedTouches.length === 0) {
      return;
    }

    const touch = event.changedTouches[0];
    const travel = Math.hypot(touch.clientX - gesture.startX, touch.clientY - gesture.startY);

    if (travel > TIMELINE_BACKGROUND_CLICK_MOVE_THRESHOLD_PX) {
      return;
    }

    tryDismissTimelineArticleOnBackgroundClick(
      touch.target,
      activeArticleSlug,
      dismissActiveTimelineArticle,
      {clientX: touch.clientX, clientY: touch.clientY},
    );
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
      <div className="relative z-10">
        {!isDesktopViewport ? (
          <div className="md:hidden">
            <MobileTimelineExperience
              activeArticleSlug={activeArticleSlug}
              boardView={boardView}
              camera={mobileCamera}
              currentGlobalDay={currentGlobalDay}
              handleTouchEnd={handleMobileTouchEnd}
              handleTouchMove={handleMobileTouchMove}
              handleTouchStart={handleMobileTouchStart}
              handleZoomChange={handleMobileZoomChange}
              hiddenCompanyCount={hiddenCompanyCount}
              latestCompany={latestCompany}
              minZoom={mobileMinZoom}
              maxZoom={MOBILE_MAX_ZOOM}
              maxDays={mobileMaxDays}
              maxSummaryQuietDays={maxSummaryQuietDays}
              modelExplorer={<ModelClassExplorer {...explorerProps} variant="rail" />}
              monthTicks={mobileMonthTicks}
              onCompanyHide={hideCompany}
              onCompanyMove={moveCompany}
              onDismissArticle={handleTimelineBackgroundDismiss}
              onModelSelect={navigateToModelSlug}
              onResetCamera={resetMobileCamera}
              onShowHiddenCompanies={showHiddenCompanies}
              onToggleTimelineGrid={toggleTimelineGrid}
              processedCompanies={timelineData.processedCompanies}
              renderWindow={mobileReleaseRenderWindow}
              scrollContainerRef={mobileScrollContainerRef}
              showTimelineGrid={showTimelineGrid}
              timelineStartDay={mobileTimelineStartDay}
              timelineWidth={mobileTimelineWidth}
              viewport={viewportSizes.mobile}
              worldRef={mobileWorldRef}
              yearTicks={mobileYearTicks}
              zoom={mobileZoom}
            />
          </div>
        ) : null}

        {isDesktopViewport ? (
          <div className="hidden md:block">
            <DesktopTimelineExperience
              activeArticleSlug={activeArticleSlug}
              boardView={boardView}
              camera={desktopCamera}
              currentGlobalDay={currentGlobalDay}
              handlePointerDown={handlePointerDown}
              handlePointerMove={handlePointerMove}
              handleZoomChange={handleZoomChange}
              hiddenCompanyCount={hiddenCompanyCount}
              isPanning={isPanning}
              latestCompany={latestCompany}
              maxDays={maxDays}
              minZoom={desktopMinZoom}
              maxZoom={DESKTOP_MAX_ZOOM}
              maxSummaryQuietDays={maxSummaryQuietDays}
              modelExplorer={<ModelClassExplorer {...explorerProps} variant="rail" />}
              monthTicks={monthTicks}
              onCompanyHide={hideCompany}
              onCompanyMove={moveCompany}
              onDismissArticle={handleTimelineBackgroundDismiss}
              onModelSelect={navigateToModelSlug}
              onResetCamera={resetDesktopCamera}
              onShowHiddenCompanies={showHiddenCompanies}
              onToggleTimelineGrid={toggleTimelineGrid}
              processedCompanies={timelineData.processedCompanies}
              renderWindow={desktopReleaseRenderWindow}
              scrollContainerRef={scrollContainerRef}
              showTimelineGrid={showTimelineGrid}
              stopPanning={stopPanning}
              summaryCompanies={summaryCompanies}
              timelineStartDay={timelineStartDay}
              timelineWidth={timelineWidth}
              viewport={viewportSizes.desktop}
              worldRef={desktopWorldRef}
              yearTicks={yearTicks}
              zoom={zoom}
            />
          </div>
        ) : null}
      </div>

      <AnimatePresence>
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
