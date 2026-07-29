import type {ModelReleaseIndexEntry} from '../data/types';

export type DirectorAspectRatio = '16:9' | '9:16' | '1:1';
export type DirectorPace = 'fast' | 'balanced' | 'cinematic';
export type DirectorPlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type DirectorPreferences = {
  aspectRatio: DirectorAspectRatio;
  headline: string;
  includeIntro: boolean;
  includeOutro: boolean;
  pace: DirectorPace;
  subtitle: string;
  windowDays: 7 | 14 | 30;
};

export type DirectorState = DirectorPreferences & {
  fallbackSelection: boolean;
  sceneIndex: number;
  search: string;
  selectedSlugs: string[];
  status: DirectorPlaybackStatus;
};

export type DirectorScene =
  | {durationMs: number; key: 'intro'; kind: 'intro'}
  | {durationMs: number; entry: ModelReleaseIndexEntry; key: string; kind: 'node'}
  | {durationMs: number; key: 'outro'; kind: 'outro'};

export const DIRECTOR_STORAGE_KEY = 'ai-timeline-director-preferences-v1';

export const DEFAULT_DIRECTOR_PREFERENCES: DirectorPreferences = {
  aspectRatio: '16:9',
  headline: 'AI timeline update',
  includeIntro: true,
  includeOutro: true,
  pace: 'balanced',
  subtitle: 'The releases and events moving the field forward',
  windowDays: 14,
};

export const DIRECTOR_PACE_TIMINGS: Record<
  DirectorPace,
  {focusMs: number; introMs: number; nodeMs: number; outroMs: number; stiffness: number}
> = {
  fast: {focusMs: 750, introMs: 1200, nodeMs: 1600, outroMs: 1400, stiffness: 4.6},
  balanced: {focusMs: 1250, introMs: 1800, nodeMs: 2500, outroMs: 2200, stiffness: 3.1},
  cinematic: {focusMs: 1800, introMs: 2500, nodeMs: 3600, outroMs: 3000, stiffness: 2.2},
};

const DAY_MS = 1000 * 60 * 60 * 24;

function isAspectRatio(value: unknown): value is DirectorAspectRatio {
  return value === '16:9' || value === '9:16' || value === '1:1';
}

function isPace(value: unknown): value is DirectorPace {
  return value === 'fast' || value === 'balanced' || value === 'cinematic';
}

function isWindowDays(value: unknown): value is DirectorPreferences['windowDays'] {
  return value === 7 || value === 14 || value === 30;
}

export function loadDirectorPreferences(): DirectorPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_DIRECTOR_PREFERENCES;
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem(DIRECTOR_STORAGE_KEY) ?? '{}') as Partial<DirectorPreferences>;

    return {
      aspectRatio: isAspectRatio(saved.aspectRatio) ? saved.aspectRatio : DEFAULT_DIRECTOR_PREFERENCES.aspectRatio,
      headline: typeof saved.headline === 'string' ? saved.headline.slice(0, 90) : DEFAULT_DIRECTOR_PREFERENCES.headline,
      includeIntro: typeof saved.includeIntro === 'boolean' ? saved.includeIntro : true,
      includeOutro: typeof saved.includeOutro === 'boolean' ? saved.includeOutro : true,
      pace: isPace(saved.pace) ? saved.pace : DEFAULT_DIRECTOR_PREFERENCES.pace,
      subtitle: typeof saved.subtitle === 'string' ? saved.subtitle.slice(0, 160) : DEFAULT_DIRECTOR_PREFERENCES.subtitle,
      windowDays: isWindowDays(saved.windowDays) ? saved.windowDays : DEFAULT_DIRECTOR_PREFERENCES.windowDays,
    };
  } catch {
    return DEFAULT_DIRECTOR_PREFERENCES;
  }
}

export function saveDirectorPreferences(state: DirectorState) {
  const preferences: DirectorPreferences = {
    aspectRatio: state.aspectRatio,
    headline: state.headline,
    includeIntro: state.includeIntro,
    includeOutro: state.includeOutro,
    pace: state.pace,
    subtitle: state.subtitle,
    windowDays: state.windowDays,
  };

  window.localStorage.setItem(DIRECTOR_STORAGE_KEY, JSON.stringify(preferences));
}

function getEntryTimestamp(entry: ModelReleaseIndexEntry) {
  return Date.parse(`${entry.date}T00:00:00Z`);
}

function deduplicateAutomaticEntries(entries: ModelReleaseIndexEntry[]) {
  const entriesByEvent = new Map<string, ModelReleaseIndexEntry>();

  entries.forEach((entry) => {
    const key = `${entry.name.trim().toLowerCase()}|${entry.date}|${entry.eventType}`;
    const current = entriesByEvent.get(key);

    if (!current || (!current.article && entry.article) || entry.tags.length > current.tags.length) {
      entriesByEvent.set(key, entry);
    }
  });

  return [...entriesByEvent.values()];
}

export function getDefaultDirectorSelection(
  entries: ModelReleaseIndexEntry[],
  windowDays: DirectorPreferences['windowDays'],
  now = new Date(),
) {
  const endDate = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startDate = endDate - (windowDays - 1) * DAY_MS;
  const eligibleEntries = deduplicateAutomaticEntries(
    entries.filter((entry) => {
      const timestamp = getEntryTimestamp(entry);
      return Number.isFinite(timestamp) && timestamp >= startDate && timestamp <= endDate;
    }),
  ).sort((left, right) => getEntryTimestamp(left) - getEntryTimestamp(right));

  if (eligibleEntries.length > 0) {
    return {fallbackSelection: false, slugs: eligibleEntries.map((entry) => entry.slug)};
  }

  const fallbackEntries = deduplicateAutomaticEntries(
    entries.filter((entry) => {
      const timestamp = getEntryTimestamp(entry);
      return Number.isFinite(timestamp) && timestamp <= endDate;
    }),
  )
    .sort((left, right) => getEntryTimestamp(right) - getEntryTimestamp(left))
    .slice(0, 5)
    .sort((left, right) => getEntryTimestamp(left) - getEntryTimestamp(right));

  return {fallbackSelection: true, slugs: fallbackEntries.map((entry) => entry.slug)};
}

export function createInitialDirectorState(entries: ModelReleaseIndexEntry[]): DirectorState {
  const preferences = loadDirectorPreferences();
  const selection = getDefaultDirectorSelection(entries, preferences.windowDays);

  return {
    ...preferences,
    fallbackSelection: selection.fallbackSelection,
    sceneIndex: 0,
    search: '',
    selectedSlugs: selection.slugs,
    status: 'idle',
  };
}

export type DirectorAction =
  | {type: 'set_aspect_ratio'; value: DirectorAspectRatio}
  | {type: 'set_fallback_selection'; value: boolean}
  | {type: 'set_headline'; value: string}
  | {type: 'set_include_intro'; value: boolean}
  | {type: 'set_include_outro'; value: boolean}
  | {type: 'set_pace'; value: DirectorPace}
  | {type: 'set_scene'; value: number}
  | {type: 'set_search'; value: string}
  | {type: 'set_selected_slugs'; value: string[]}
  | {type: 'set_status'; value: DirectorPlaybackStatus}
  | {type: 'set_subtitle'; value: string}
  | {type: 'set_window'; value: DirectorPreferences['windowDays']; slugs: string[]; fallbackSelection: boolean}
  | {type: 'toggle_slug'; value: string};

export function directorReducer(state: DirectorState, action: DirectorAction): DirectorState {
  switch (action.type) {
    case 'set_aspect_ratio':
      return {...state, aspectRatio: action.value};
    case 'set_fallback_selection':
      return {...state, fallbackSelection: action.value};
    case 'set_headline':
      return {...state, headline: action.value.slice(0, 90)};
    case 'set_include_intro':
      return {...state, includeIntro: action.value, sceneIndex: 0, status: 'idle'};
    case 'set_include_outro':
      return {...state, includeOutro: action.value, sceneIndex: 0, status: 'idle'};
    case 'set_pace':
      return {...state, pace: action.value};
    case 'set_scene':
      return {...state, sceneIndex: Math.max(0, action.value)};
    case 'set_search':
      return {...state, search: action.value};
    case 'set_selected_slugs':
      return {...state, selectedSlugs: action.value, sceneIndex: 0, status: 'idle'};
    case 'set_status':
      return {...state, status: action.value};
    case 'set_subtitle':
      return {...state, subtitle: action.value.slice(0, 160)};
    case 'set_window':
      return {
        ...state,
        fallbackSelection: action.fallbackSelection,
        sceneIndex: 0,
        selectedSlugs: action.slugs,
        status: 'idle',
        windowDays: action.value,
      };
    case 'toggle_slug':
      return {
        ...state,
        fallbackSelection: false,
        sceneIndex: 0,
        selectedSlugs: state.selectedSlugs.includes(action.value)
          ? state.selectedSlugs.filter((slug) => slug !== action.value)
          : [...state.selectedSlugs, action.value],
        status: 'idle',
      };
    default:
      return state;
  }
}

export function getSelectedDirectorEntries(entries: ModelReleaseIndexEntry[], selectedSlugs: string[]) {
  const selectedSlugSet = new Set(selectedSlugs);
  const entriesBySlug = new Map<string, ModelReleaseIndexEntry>();
  entries.filter((entry) => selectedSlugSet.has(entry.slug)).forEach((entry) => {
    const current = entriesBySlug.get(entry.slug);
    if (!current || (!current.article && entry.article) || entry.tags.length > current.tags.length) {
      entriesBySlug.set(entry.slug, entry);
    }
  });

  return selectedSlugs.flatMap((slug) => {
    const entry = entriesBySlug.get(slug);
    return entry ? [entry] : [];
  });
}

export function getDirectorPickerEntries(entries: ModelReleaseIndexEntry[]) {
  const entriesBySlug = new Map<string, ModelReleaseIndexEntry>();
  entries.forEach((entry) => {
    const current = entriesBySlug.get(entry.slug);
    if (!current || (!current.article && entry.article) || entry.tags.length > current.tags.length) {
      entriesBySlug.set(entry.slug, entry);
    }
  });
  return [...entriesBySlug.values()];
}

export function buildDirectorScenes(state: DirectorState, entries: ModelReleaseIndexEntry[]) {
  const timings = DIRECTOR_PACE_TIMINGS[state.pace];
  const selectedEntries = getSelectedDirectorEntries(entries, state.selectedSlugs);
  const scenes: DirectorScene[] = [];

  if (state.includeIntro && selectedEntries.length > 0) {
    scenes.push({durationMs: timings.introMs, key: 'intro', kind: 'intro'});
  }

  selectedEntries.forEach((entry) => {
    scenes.push({durationMs: timings.nodeMs, entry, key: entry.slug, kind: 'node'});
  });

  if (state.includeOutro && selectedEntries.length > 0) {
    scenes.push({durationMs: timings.outroMs, key: 'outro', kind: 'outro'});
  }

  return scenes;
}

export function estimateDirectorRuntimeMs(state: DirectorState, entries: ModelReleaseIndexEntry[]) {
  const scenes = buildDirectorScenes(state, entries);
  const timings = DIRECTOR_PACE_TIMINGS[state.pace];
  return scenes.reduce((total, scene) => total + scene.durationMs + timings.focusMs, 0);
}

export function formatDirectorRuntime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;
}

export function buildDirectorCaption(state: DirectorState, entries: ModelReleaseIndexEntry[]) {
  const selectedEntries = getSelectedDirectorEntries(entries, state.selectedSlugs);
  const lines = selectedEntries.map((entry) => `• ${entry.companyName} — ${entry.name} (${entry.dateLabel})`);
  return [
    state.headline.trim(),
    state.subtitle.trim(),
    '',
    ...lines,
    '',
    'Explore the full AI timeline:',
    'https://kvick-games.github.io/AI_Model_Timeline_Website/',
  ]
    .filter((line, index, values) => line || (index > 0 && values[index - 1]))
    .join('\n')
    .trim();
}
