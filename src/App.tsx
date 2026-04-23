import React, {startTransition, useEffect, useMemo, useRef, useState} from 'react';
import {
  ArrowDown,
  ArrowUp,
  Box,
  BrainCircuit,
  Check,
  ChevronDown,
  Globe2,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {motion} from 'motion/react';

type ModelClassId = 'frontier-llms' | 'open-source-llms' | 'image-generation' | '3d-generation';
type PresetId =
  | 'frontier-llms'
  | 'chinese-open-source'
  | 'mistral'
  | 'image-generation'
  | '3d-generation';

type ModelClassConfig = {
  id: ModelClassId;
  label: string;
  description: string;
};

type PresetConfig = {
  id: PresetId;
  classId: ModelClassId;
  label: string;
  description: string;
};

type BoardView = {
  description: string;
  isComposite: boolean;
  isDefault: boolean;
  isEmpty: boolean;
  label: string;
};

type ReleaseRecord = {
  classes?: ModelClassId[];
  name: string;
  presets?: PresetId[];
  date: string;
};

type LabRecord = {
  id: string;
  name: string;
  accent: string;
  defaultClasses: ModelClassId[];
  defaultPresets: PresetId[];
  releases: ReleaseRecord[];
};

type ProcessedRelease = ReleaseRecord & {
  classes: ModelClassId[];
  dateLabel: string;
  globalDay: number;
  gap: number;
  presets: PresetId[];
};

type ProcessedLab = Omit<LabRecord, 'releases'> & {
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
const TIMELINE_PIXELS_PER_DAY = 2.24;
const LABEL_RAIL_WIDTH = 320;
const MOBILE_LABEL_RAIL_WIDTH = 196;
const DEFAULT_DESKTOP_ZOOM = 1;
const DEFAULT_MOBILE_ZOOM = 1.05;
const DESKTOP_MAX_ZOOM = 4;
const MOBILE_MAX_ZOOM = 3.4;
const ZOOM_PROGRESS_STEP = 0.12;
const SIGMOID_STEEPNESS = 6;
const FIT_BUFFER_MULTIPLIER = 0.92;
const DRAG_ZOOM_PROGRESS_PER_PIXEL = 0.0011;
const DRAG_ZOOM_DEADZONE_PX = 12;
const DEFAULT_PRESET_ID: PresetId = 'frontier-llms';
const DEFAULT_SELECTED_PRESET_IDS: PresetId[] = [DEFAULT_PRESET_ID];

const modelClasses: ModelClassConfig[] = [
  {
    id: 'frontier-llms',
    label: 'Frontier LLMs',
    description: 'Closed and frontier text/reasoning labs.',
  },
  {
    id: 'open-source-llms',
    label: 'Open-Source LLMs',
    description: 'Open-weight and community-distributed language models.',
  },
  {
    id: 'image-generation',
    label: 'Image Generation',
    description: 'Text-to-image and multimodal image model releases.',
  },
  {
    id: '3d-generation',
    label: '3D Generation',
    description: 'Image-to-3D and asset-generation model releases.',
  },
];

const modelPresets: PresetConfig[] = [
  {
    id: 'frontier-llms',
    classId: 'frontier-llms',
    label: 'Frontier LLMs',
    description: 'The default board for OpenAI, Anthropic, Google, and xAI.',
  },
  {
    id: 'chinese-open-source',
    classId: 'open-source-llms',
    label: 'Chinese Open Source',
    description: 'DeepSeek, Qwen, Kimi, and GLM release cadence.',
  },
  {
    id: 'mistral',
    classId: 'open-source-llms',
    label: 'Mistral',
    description: 'Mistral open and commercial model milestones.',
  },
  {
    id: 'image-generation',
    classId: 'image-generation',
    label: 'Image Generation',
    description: 'Major image model generations across creative labs.',
  },
  {
    id: '3d-generation',
    classId: '3d-generation',
    label: '3D Generation',
    description: '3D asset and reconstruction models from specialized labs.',
  },
];

const labs: LabRecord[] = [
  {
    id: 'openai-gpt',
    name: 'OpenAI (GPT)',
    accent: '#139a74',
    defaultClasses: ['frontier-llms'],
    defaultPresets: ['frontier-llms'],
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
      {name: 'GPT-5.5', date: '2026-04-23'},
    ],
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic (Claude)',
    accent: '#d38b14',
    defaultClasses: ['frontier-llms'],
    defaultPresets: ['frontier-llms'],
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
    id: 'google-gemini',
    name: 'Google (Gemini)',
    accent: '#2d6ed8',
    defaultClasses: ['frontier-llms'],
    defaultPresets: ['frontier-llms'],
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
    id: 'xai-grok',
    name: 'xAI (Grok)',
    accent: '#777f90',
    defaultClasses: ['frontier-llms'],
    defaultPresets: ['frontier-llms'],
    releases: [
      {name: 'Grok 1', date: '2023-11-04'},
      {name: 'Grok 1.5', date: '2024-03-28'},
      {name: 'Grok 2', date: '2024-08-13'},
      {name: 'Grok 3', date: '2025-02-17'},
      {name: 'Grok 4', date: '2025-07-09'},
      {name: 'Grok 4.1', date: '2025-11-17'},
      {name: 'Grok 4.20', date: '2026-02-17'},
      {name: 'Grok 4.3 (Beta)', date: '2026-04-17'},
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    accent: '#4d8bd6',
    defaultClasses: ['open-source-llms'],
    defaultPresets: ['chinese-open-source'],
    releases: [
      {name: 'DeepSeek-V2', date: '2024-05-06'},
      {name: 'DeepSeek-V2.5', date: '2024-09-05'},
      {name: 'DeepSeek-V3', date: '2024-12-26'},
      {name: 'DeepSeek-R1', date: '2025-01-20'},
      {name: 'DeepSeek-R1-0528', date: '2025-05-28'},
      {name: 'DeepSeek-V3.1', date: '2025-08-21'},
    ],
  },
  {
    id: 'qwen',
    name: 'Alibaba (Qwen)',
    accent: '#8c79d6',
    defaultClasses: ['open-source-llms'],
    defaultPresets: ['chinese-open-source'],
    releases: [
      {name: 'Qwen2', date: '2024-06-07'},
      {name: 'Qwen2.5', date: '2024-09-19'},
      {name: 'Qwen2.5-VL', date: '2025-01-28'},
      {name: 'Qwen3', date: '2025-04-29'},
      {name: 'Qwen3-Coder', date: '2025-07-29'},
      {name: 'Qwen3.6-35B-A3B', date: '2026-04-17'},
    ],
  },
  {
    id: 'moonshot-kimi',
    name: 'Moonshot AI (Kimi)',
    accent: '#56a3a6',
    defaultClasses: ['open-source-llms'],
    defaultPresets: ['chinese-open-source'],
    releases: [
      {name: 'Kimi Chat', date: '2023-10-09'},
      {name: 'Kimi k1.5', date: '2025-01-20'},
      {name: 'Kimi K2', date: '2025-07-11'},
    ],
  },
  {
    id: 'zhipu-glm',
    name: 'Zhipu AI (GLM)',
    accent: '#c78f38',
    defaultClasses: ['open-source-llms'],
    defaultPresets: ['chinese-open-source'],
    releases: [
      {name: 'GLM-4', date: '2024-01-16'},
      {name: 'GLM-4-9B', date: '2024-06-05'},
      {name: 'GLM-4.5', date: '2025-07-28'},
    ],
  },
  {
    id: 'mistral-ai',
    name: 'Mistral AI',
    accent: '#ff9f1c',
    defaultClasses: ['open-source-llms'],
    defaultPresets: ['mistral'],
    releases: [
      {name: 'Mistral 7B', date: '2023-09-27'},
      {name: 'Mixtral 8x7B', date: '2023-12-11'},
      {name: 'Mistral Large', date: '2024-02-26'},
      {name: 'Mixtral 8x22B', date: '2024-04-17'},
      {name: 'Codestral', date: '2024-05-29'},
      {name: 'Mistral Large 2', date: '2024-07-24'},
      {name: 'Mistral Small 3', date: '2025-01-30'},
      {name: 'Mistral Medium 3', date: '2025-05-07'},
    ],
  },
  {
    id: 'openai-image',
    name: 'OpenAI (Image)',
    accent: '#1da17d',
    defaultClasses: ['image-generation'],
    defaultPresets: ['image-generation'],
    releases: [
      {name: 'DALL-E 2', date: '2022-09-28'},
      {name: 'DALL-E 3', date: '2023-09-20'},
      {name: 'GPT-4o Image', date: '2025-03-25'},
      {name: 'GPT Image 2', date: '2026-04-21'},
    ],
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    accent: '#c0537a',
    defaultClasses: ['image-generation'],
    defaultPresets: ['image-generation'],
    releases: [
      {name: 'Midjourney V5', date: '2023-03-15'},
      {name: 'Midjourney V6', date: '2023-12-20'},
      {name: 'Midjourney V6.1', date: '2024-07-30'},
      {name: 'Midjourney V7', date: '2025-04-03'},
      {name: 'Niji 7', date: '2026-01-09'},
    ],
  },
  {
    id: 'stability-image',
    name: 'Stability AI (Image)',
    accent: '#6b8e4e',
    defaultClasses: ['image-generation'],
    defaultPresets: ['image-generation'],
    releases: [
      {name: 'Stable Diffusion 2.0', date: '2022-11-24'},
      {name: 'SDXL 1.0', date: '2023-07-26'},
      {name: 'Stable Diffusion 3 Medium', date: '2024-06-12'},
      {name: 'Stable Diffusion 3.5', date: '2024-10-22'},
    ],
  },
  {
    id: 'black-forest-labs',
    name: 'Black Forest Labs',
    accent: '#7b6bd6',
    defaultClasses: ['image-generation'],
    defaultPresets: ['image-generation'],
    releases: [
      {name: 'FLUX.1', date: '2024-08-01'},
      {name: 'FLUX.1 Tools', date: '2024-11-21'},
      {name: 'FLUX.1 Kontext', date: '2025-05-29'},
    ],
  },
  {
    id: 'stability-3d',
    name: 'Stability AI (3D)',
    accent: '#9b8a52',
    defaultClasses: ['3d-generation'],
    defaultPresets: ['3d-generation'],
    releases: [
      {name: 'Stable Zero123', date: '2023-12-13'},
      {name: 'TripoSR', date: '2024-03-04'},
      {name: 'Stable Video 3D', date: '2024-03-18'},
      {name: 'Stable Fast 3D', date: '2024-08-01'},
      {name: 'Stable Point Aware 3D', date: '2025-03-18'},
    ],
  },
  {
    id: 'tencent-hunyuan-3d',
    name: 'Tencent (Hunyuan3D)',
    accent: '#327ec7',
    defaultClasses: ['3d-generation'],
    defaultPresets: ['3d-generation'],
    releases: [
      {name: 'Hunyuan3D 1.0', date: '2024-11-05'},
      {name: 'Hunyuan3D 2.0', date: '2025-01-21'},
      {name: 'Hunyuan3D 2.1', date: '2025-06-18'},
    ],
  },
  {
    id: 'tripo-ai',
    name: 'Tripo AI',
    accent: '#d15f45',
    defaultClasses: ['3d-generation'],
    defaultPresets: ['3d-generation'],
    releases: [
      {name: 'Tripo AI', date: '2023-09-12'},
      {name: 'TripoSR', date: '2024-03-04'},
      {name: 'Tripo 2.0', date: '2025-01-21'},
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

function getReleaseClasses(lab: LabRecord, release: ReleaseRecord): ModelClassId[] {
  return release.classes ?? lab.defaultClasses;
}

function getReleasePresets(lab: LabRecord, release: ReleaseRecord): PresetId[] {
  return release.presets ?? lab.defaultPresets;
}

function getModelClassById(classId: ModelClassId) {
  return modelClasses.find((modelClass) => modelClass.id === classId) ?? modelClasses[0];
}

function getPresetById(presetId: PresetId) {
  return modelPresets.find((preset) => preset.id === presetId) ?? modelPresets[0];
}

function getBoardView(selectedPresetIds: PresetId[]): BoardView {
  const selectedPresets = modelPresets.filter((preset) => selectedPresetIds.includes(preset.id));

  if (selectedPresets.length === 0) {
    return {
      description: 'No model groups are currently selected.',
      isComposite: true,
      isDefault: false,
      isEmpty: true,
      label: 'No groups selected',
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
      description: 'Every tracked LLM, image, and 3D model release is visible.',
      isComposite: true,
      isDefault: false,
      isEmpty: false,
      label: 'All groups selected',
    };
  }

  return {
    description: selectedPresets.map((preset) => preset.label).join(', '),
    isComposite: true,
    isDefault: false,
    isEmpty: false,
    label: `${selectedPresets.length} groups selected`,
  };
}

function getVisibleLabs(data: LabRecord[], selectedPresetIds: PresetId[]) {
  if (selectedPresetIds.length === 0) {
    return [];
  }

  return data
    .map<LabRecord>((lab) => ({
      ...lab,
      releases: lab.releases.filter((release) => {
        const releasePresets = getReleasePresets(lab, release);
        return selectedPresetIds.some((presetId) => releasePresets.includes(presetId));
      }),
    }))
    .filter((lab) => lab.releases.length > 0);
}

function buildPresetStats(data: LabRecord[]) {
  return modelPresets.reduce<Record<PresetId, {providerCount: number; releaseCount: number}>>((stats, preset) => {
    const visibleLabs = getVisibleLabs(data, [preset.id]);

    stats[preset.id] = {
      providerCount: visibleLabs.length,
      releaseCount: visibleLabs.reduce((sum, lab) => sum + lab.releases.length, 0),
    };

    return stats;
  }, {} as Record<PresetId, {providerCount: number; releaseCount: number}>);
}

function getPrimaryLabClass(lab: Pick<LabRecord, 'defaultClasses'>): ModelClassId {
  return lab.defaultClasses[0] ?? 'frontier-llms';
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

function getCanonicalLabOrderIds(labOrderIds: string[]) {
  const knownIds = new Set(labs.map((lab) => lab.id));
  const orderedIds = labOrderIds.filter((labId) => knownIds.has(labId));
  const orderedIdSet = new Set(orderedIds);
  const newLabIds = labs.map((lab) => lab.id).filter((labId) => !orderedIdSet.has(labId));

  return [...orderedIds, ...newLabIds];
}

function orderLabs(data: LabRecord[], labOrderIds: string[], hiddenLabIds: string[]) {
  const labById = new Map(data.map((lab) => [lab.id, lab]));
  const hiddenLabIdSet = new Set(hiddenLabIds);
  const orderedLabs = getCanonicalLabOrderIds(labOrderIds)
    .map((labId) => labById.get(labId))
    .filter((lab): lab is LabRecord => Boolean(lab));
  const orderedLabIdSet = new Set(orderedLabs.map((lab) => lab.id));
  const newLabs = data.filter((lab) => !orderedLabIdSet.has(lab.id));

  return [...orderedLabs, ...newLabs].filter((lab) => !hiddenLabIdSet.has(lab.id));
}

function reorderVisibleLabIds(
  labOrderIds: string[],
  visibleLabIds: string[],
  sourceLabId: string,
  targetLabId: string,
) {
  if (sourceLabId === targetLabId) {
    return labOrderIds;
  }

  const visibleLabIdSet = new Set(visibleLabIds);
  const orderedLabIds = getCanonicalLabOrderIds(labOrderIds);
  const orderedVisibleLabIds = orderedLabIds.filter((labId) => visibleLabIdSet.has(labId));
  const sourceIndex = orderedVisibleLabIds.indexOf(sourceLabId);
  const targetIndex = orderedVisibleLabIds.indexOf(targetLabId);

  if (sourceIndex < 0 || targetIndex < 0) {
    return orderedLabIds;
  }

  const nextVisibleLabIds = moveArrayItem(orderedVisibleLabIds, sourceIndex, targetIndex);
  let visibleIndex = 0;

  return orderedLabIds.map((labId) => {
    if (!visibleLabIdSet.has(labId)) {
      return labId;
    }

    const nextLabId = nextVisibleLabIds[visibleIndex];
    visibleIndex += 1;
    return nextLabId ?? labId;
  });
}

function moveVisibleLabId(
  labOrderIds: string[],
  visibleLabIds: string[],
  labId: string,
  direction: 'up' | 'down',
) {
  const visibleLabIdSet = new Set(visibleLabIds);
  const orderedVisibleLabIds = getCanonicalLabOrderIds(labOrderIds).filter((currentLabId) =>
    visibleLabIdSet.has(currentLabId),
  );
  const sourceIndex = orderedVisibleLabIds.indexOf(labId);
  const targetIndex = direction === 'up' ? sourceIndex - 1 : sourceIndex + 1;

  if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= orderedVisibleLabIds.length) {
    return labOrderIds;
  }

  return reorderVisibleLabIds(labOrderIds, visibleLabIds, labId, orderedVisibleLabIds[targetIndex]);
}

function buildTimelineData(data: LabRecord[]) {
  const invalidEntries: string[] = [];

  const processedLabs = data.map<ProcessedLab>((lab) => {
    const sortedReleases = lab.releases.map((release) => ({
      ...release,
      classes: getReleaseClasses(lab, release),
      presets: getReleasePresets(lab, release),
    })).sort((left, right) => {
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

function getQuietDays(lab: ProcessedLab, currentGlobalDay: number) {
  return lab.latestRelease ? Math.max(0, Math.floor(currentGlobalDay - lab.latestRelease.globalDay)) : 0;
}

function getRecencyFillWidth(quietDays: number, maxQuietDays: number) {
  return maxQuietDays === 0 ? 100 : Math.max(0, Math.round((1 - quietDays / maxQuietDays) * 100));
}

function formatQuietDaysLabel(quietDays: number) {
  return `${quietDays} ${quietDays === 1 ? 'Day' : 'Days'} since last update`;
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

  if (classId === '3d-generation') {
    return <Box className={iconClassName} strokeWidth={1.8} />;
  }

  return <Layers3 className={iconClassName} strokeWidth={1.8} />;
}

type ModelClassExplorerProps = {
  activeClassId: ModelClassId;
  boardView: BoardView;
  isOpen: boolean;
  onClassSelect: (classId: ModelClassId) => void;
  onClearAll: () => void;
  onClose: () => void;
  onPresetToggle: (presetId: PresetId) => void;
  onReset: () => void;
  onSelectAll: () => void;
  onToggle: () => void;
  presetStats: Record<PresetId, {providerCount: number; releaseCount: number}>;
  selectedPresetIds: PresetId[];
};

function ModelClassExplorer({
  activeClassId,
  boardView,
  isOpen,
  onClassSelect,
  onClearAll,
  onClose,
  onPresetToggle,
  onReset,
  onSelectAll,
  onToggle,
  presetStats,
  selectedPresetIds,
}: ModelClassExplorerProps) {
  const activeClass = getModelClassById(activeClassId);
  const classPresets = modelPresets.filter((preset) => preset.classId === activeClassId);
  const selectedCount = selectedPresetIds.length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Explore model classes"
        onClick={onToggle}
        className="inline-flex h-11 max-w-full items-center justify-center gap-2 rounded-full border border-[var(--edge)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--ink)] shadow-[var(--soft-shadow)] transition duration-300 hover:-translate-y-[1px] hover:border-[var(--edge-strong)] hover:bg-[var(--surface-strong)] active:translate-y-0 active:scale-[0.98]"
      >
        <SlidersHorizontal className="h-4 w-4 shrink-0" strokeWidth={1.8} />
        <span className="min-w-0 truncate">{boardView.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition duration-300 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.8}
        />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close model class explorer"
            onClick={onClose}
            className="fixed inset-0 z-30 cursor-default bg-[#05070b]/70 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
          />

          <motion.div
            initial={{opacity: 0, y: 16, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            transition={{duration: 0.24, ease: [0.22, 1, 0.36, 1]}}
            className="fixed inset-x-3 bottom-3 z-40 max-h-[82dvh] overflow-hidden rounded-[1.4rem] border border-[var(--edge-strong)] bg-[rgba(10,13,19,0.98)] shadow-[0_34px_90px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-[calc(100%+0.75rem)] md:w-[520px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--edge)] px-4 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Model class</p>
                <p className="mt-1 truncate text-base font-semibold tracking-tight text-[var(--ink)]">{activeClass.label}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {selectedCount} of {modelPresets.length} groups active
                </p>
              </div>
              <button
                type="button"
                aria-label="Close model class explorer"
                onClick={onClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--edge)] text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface-strong)] active:scale-[0.96]"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="max-h-[calc(82dvh-4.5rem)] overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {modelClasses.map((modelClass) => {
                  const isActive = modelClass.id === activeClassId;

                  return (
                    <button
                      key={modelClass.id}
                      type="button"
                      onClick={() => onClassSelect(modelClass.id)}
                      className={`min-h-20 rounded-[0.9rem] border p-3 text-left transition duration-300 active:scale-[0.98] ${
                        isActive
                          ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)] text-[var(--ink)]'
                          : 'border-[var(--edge)] bg-transparent text-[var(--ink-soft)] hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ModelClassIcon classId={modelClass.id} className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-semibold tracking-tight">{modelClass.label}</span>
                      </span>
                      <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">{modelClass.description}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                {classPresets.map((preset) => {
                  const isSelected = selectedPresetIds.includes(preset.id);
                  const stats = presetStats[preset.id];

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onPresetToggle(preset.id)}
                      className={`grid w-full grid-cols-[1fr_auto] gap-4 rounded-[0.95rem] border p-4 text-left transition duration-300 active:scale-[0.99] ${
                        isSelected
                          ? 'border-[var(--edge-strong)] bg-[var(--surface-strong)]'
                          : 'border-[var(--edge)] bg-transparent hover:border-[var(--edge-strong)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{preset.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--ink-soft)]">{preset.description}</span>
                        <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                          {stats.providerCount} labs / {stats.releaseCount} releases
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

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--edge)] px-4 text-sm font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
                >
                  <Layers3 className="h-4 w-4" strokeWidth={1.8} />
                  Select all
                </button>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--edge)] px-4 text-sm font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
                >
                  <X className="h-4 w-4" strokeWidth={1.8} />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--edge)] px-4 text-sm font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
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

function LabTypeIconBadge({className = '', lab}: {className?: string; lab: Pick<LabRecord, 'defaultClasses'>}) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center text-[var(--ink)] ${className}`}>
      <ModelClassIcon classId={getPrimaryLabClass(lab)} className="h-[1rem] w-[1rem]" />
    </span>
  );
}

function LabRailItem({
  compact = false,
  draggedLabId,
  isFirst,
  isLast,
  lab,
  onDragEnd,
  onDragStart,
  onHide,
  onMove,
  onReorder,
}: {
  compact?: boolean;
  draggedLabId: string | null;
  isFirst: boolean;
  isLast: boolean;
  lab: ProcessedLab;
  onDragEnd: () => void;
  onDragStart: (labId: string) => void;
  onHide: (labId: string) => void;
  onMove: LabMoveHandler;
  onReorder: LabReorderHandler;
}) {
  const isDragging = draggedLabId === lab.id;
  const canDrop = Boolean(draggedLabId && draggedLabId !== lab.id);
  const actionClassName =
    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-transparent text-[var(--muted)] transition duration-200 hover:border-[var(--edge)] hover:bg-[var(--surface-strong)] hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-30';

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.stopPropagation();
    action();
  };

  return (
    <motion.div
      layout
      className={`group/rail pointer-events-auto flex ${compact ? 'min-h-[5rem]' : 'h-[4.5rem]'} items-center`}
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
          event.dataTransfer.setData('text/plain', lab.id);
          onDragStart(lab.id);
        }}
        onDrop={(event) => {
          event.preventDefault();
          const sourceLabId = event.dataTransfer.getData('text/plain') || draggedLabId;

          if (sourceLabId) {
            onReorder(sourceLabId, lab.id);
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
          <LabTypeIconBadge className={compact ? 'h-7 w-7' : 'h-8 w-8'} lab={lab} />
          <p
            className={`min-w-0 flex-1 truncate font-semibold tracking-tight text-[var(--ink)] ${
              compact ? 'text-[12px] leading-[1.2]' : 'text-sm'
            }`}
          >
            {lab.name}
          </p>

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
                  aria-label={`Move ${lab.name} up`}
                  className={actionClassName}
                  disabled={isFirst}
                  onClick={(event) => handleButtonClick(event, () => onMove(lab.id, 'up'))}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${lab.name} down`}
                  className={actionClassName}
                  disabled={isLast}
                  onClick={(event) => handleButtonClick(event, () => onMove(lab.id, 'down'))}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </>
            ) : null}
            <button
              type="button"
              aria-label={`Hide ${lab.name}`}
              className={`${actionClassName} hover:border-[rgba(255,255,255,0.16)] hover:text-[var(--ink)]`}
              onClick={(event) => handleButtonClick(event, () => onHide(lab.id))}
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

function TimelineEmptyState({
  boardView,
  hiddenModelCount,
  onShowHiddenLabs,
}: {
  boardView: BoardView;
  hiddenModelCount: number;
  onShowHiddenLabs: () => void;
}) {
  const hasHiddenModels = hiddenModelCount > 0;

  return (
    <div className="flex min-h-[18rem] items-center justify-center px-6 py-14">
      <div className="max-w-[34rem] text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] text-[var(--ink-soft)]">
          <Layers3 className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <p className="mt-5 text-lg font-semibold tracking-tight text-[var(--ink)]">
          {hasHiddenModels ? 'All visible models are hidden' : `${boardView.label} has no releases yet`}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          {hasHiddenModels
            ? 'Show hidden rows or turn on another model group to repopulate the timeline.'
            : 'Add releases tagged to the selected groups and the same timeline, summary cards, and recency markers will render here.'}
        </p>
        {hasHiddenModels ? (
          <button
            type="button"
            onClick={onShowHiddenLabs}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--edge)] px-4 text-sm font-medium text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface)] active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
            Show hidden rows
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
type LabMoveDirection = 'up' | 'down';
type LabMoveHandler = (labId: string, direction: LabMoveDirection) => void;
type LabReorderHandler = (sourceLabId: string, targetLabId: string) => void;

type DesktopTimelineExperienceProps = {
  boardView: BoardView;
  currentGlobalDay: number;
  draggedLabId: string | null;
  handlePointerDown: TimelinePointerHandler;
  handlePointerMove: TimelinePointerHandler;
  hiddenModelCount: number;
  handleZoomChange: ZoomHandler;
  isPanning: boolean;
  latestLab: ProcessedLab | null;
  maxDays: number;
  minZoom: number;
  maxZoom: number;
  maxSummaryQuietDays: number;
  modelExplorer: React.ReactNode;
  monthTicks: Tick[];
  onLabDragEnd: () => void;
  onLabDragStart: (labId: string) => void;
  onLabHide: (labId: string) => void;
  onLabMove: LabMoveHandler;
  onLabReorder: LabReorderHandler;
  onShowHiddenLabs: () => void;
  processedLabs: ProcessedLab[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  stopPanning: TimelinePointerHandler;
  summaryLabs: ProcessedLab[];
  timelineWidth: number;
  yearTicks: Tick[];
  zoom: number;
};

type MobileTimelineExperienceProps = {
  boardView: BoardView;
  currentGlobalDay: number;
  draggedLabId: string | null;
  handleZoomChange: ZoomHandler;
  latestLab: ProcessedLab | null;
  hiddenModelCount: number;
  minZoom: number;
  maxZoom: number;
  maxDays: number;
  maxSummaryQuietDays: number;
  modelExplorer: React.ReactNode;
  monthTicks: Tick[];
  onLabDragEnd: () => void;
  onLabDragStart: (labId: string) => void;
  onLabHide: (labId: string) => void;
  onLabMove: LabMoveHandler;
  onLabReorder: LabReorderHandler;
  onShowHiddenLabs: () => void;
  processedLabs: ProcessedLab[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  timelineWidth: number;
  yearTicks: Tick[];
  zoom: number;
};

function DesktopTimelineExperience({
  boardView,
  currentGlobalDay,
  draggedLabId,
  handlePointerDown,
  handlePointerMove,
  hiddenModelCount,
  handleZoomChange,
  isPanning,
  latestLab,
  maxDays,
  minZoom,
  maxZoom,
  maxSummaryQuietDays,
  modelExplorer,
  monthTicks,
  onLabDragEnd,
  onLabDragStart,
  onLabHide,
  onLabMove,
  onLabReorder,
  onShowHiddenLabs,
  processedLabs,
  scrollContainerRef,
  stopPanning,
  summaryLabs,
  timelineWidth,
  yearTicks,
  zoom,
}: DesktopTimelineExperienceProps) {
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
                AI model launches, arranged as one continuous race.
              </h1>
              <p className="max-w-[68ch] text-base leading-relaxed text-[var(--ink-soft)] md:text-lg">
                {boardView.isDefault
                  ? 'Compare the cadence of OpenAI, Anthropic, Google, and xAI on one horizontal field. Every node marks a release, every segment shows the gap, and the live marker makes it obvious who has gone quiet.'
                  : boardView.isEmpty
                    ? 'Turn on one or more model groups to compose the timeline.'
                  : boardView.isComposite
                    ? `${boardView.label} puts selected model groups onto one shared timeline for full-field comparison.`
                  : `${boardView.label} is shown on the same absolute timeline, so newer model classes can be scanned without stacking every lab into the default board.`}
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
                    Drag sideways to pan, up or down to zoom
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-3 py-1.5 text-[var(--ink-soft)] shadow-[var(--soft-shadow)]">
                    <Layers3 className="h-4 w-4" strokeWidth={1.8} />
                    {boardView.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-self-end">
                {modelExplorer}

                <SurfaceButton
                  label="Zoom out"
                  onClick={() => handleZoomChange((current) => getSteppedZoom(current, -ZOOM_PROGRESS_STEP, minZoom, maxZoom))}
                >
                  <ZoomOutIcon className="h-4 w-4" />
                </SurfaceButton>

                <div className="inline-flex h-11 min-w-20 items-center justify-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-4 font-mono text-sm text-[var(--ink-soft)] shadow-[var(--soft-shadow)]">
                  {Math.round(zoom * 100)}%
                </div>

                <SurfaceButton
                  label="Zoom in"
                  onClick={() => handleZoomChange((current) => getSteppedZoom(current, ZOOM_PROGRESS_STEP, minZoom, maxZoom))}
                >
                  <ZoomInIcon className="h-4 w-4" />
                </SurfaceButton>

                <SurfaceButton label="Reset zoom" onClick={() => handleZoomChange(() => minZoom)}>
                  <ResetIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </SurfaceButton>

                {hiddenModelCount > 0 ? (
                  <SurfaceButton label="Show hidden model rows" onClick={onShowHiddenLabs}>
                    <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                    <span className="hidden sm:inline">Rows</span>
                  </SurfaceButton>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[320px] border-r border-[var(--edge)] bg-[linear-gradient(90deg,rgba(11,14,20,0.98)_0%,rgba(11,14,20,0.95)_78%,rgba(11,14,20,0)_100%)]">
              <div className="px-5 pb-14 pt-24">
                <div className="flex flex-col gap-11">
                  {processedLabs.map((lab, labIndex) => (
                    <React.Fragment key={lab.id}>
                      <LabRailItem
                        draggedLabId={draggedLabId}
                        isFirst={labIndex === 0}
                        isLast={labIndex === processedLabs.length - 1}
                        lab={lab}
                        onDragEnd={onLabDragEnd}
                        onDragStart={onLabDragStart}
                        onHide={onLabHide}
                        onMove={onLabMove}
                        onReorder={onLabReorder}
                      />
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
              <div
                className={`relative ${isPanning ? 'transition-none' : 'transition-[min-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
                style={{minWidth: `${timelineWidth + LABEL_RAIL_WIDTH}px`}}
              >
                <div style={{paddingLeft: `${LABEL_RAIL_WIDTH}px`}}>
                  <div
                    className={`relative pb-14 ${isPanning ? 'transition-none' : 'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
                    style={{width: `${timelineWidth}px`}}
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

                    {processedLabs.length === 0 ? (
                      <TimelineEmptyState
                        boardView={boardView}
                        hiddenModelCount={hiddenModelCount}
                        onShowHiddenLabs={onShowHiddenLabs}
                      />
                    ) : (
                    <div className="relative flex flex-col gap-11 pb-14 pt-24">
                      {processedLabs.map((lab, labIndex) => (
                        <div key={lab.id} className="relative h-[4.5rem]">
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
                              <React.Fragment key={`${lab.id}-${release.name}`}>
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
                                  +{getQuietDays(lab, currentGlobalDay)}d
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    )}
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
              const quietDays = getQuietDays(lab, currentGlobalDay);
              const fillWidth = getRecencyFillWidth(quietDays, maxSummaryQuietDays);

              return (
                <motion.div
                  key={lab.id}
                  initial={{opacity: 0, y: 18}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.2 + index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1]}}
                  className="rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <LabTypeIconBadge className="h-7 w-7" lab={lab} />
                      <p className="truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{lab.name}</p>
                    </div>
                    <p className="mt-3 text-base font-semibold tracking-tight text-[var(--ink)]">
                      {formatQuietDaysLabel(quietDays)}
                    </p>
                    <div className="mt-2 min-w-0">
                      <p className="truncate text-sm text-[var(--ink-soft)]">
                        {lab.latestRelease?.name ?? 'No releases'}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                        {lab.latestRelease?.dateLabel ?? 'Date unavailable'}
                      </p>
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
    </>
  );
}

function MobileTimelineExperience({
  boardView,
  currentGlobalDay,
  draggedLabId,
  handleZoomChange,
  latestLab,
  hiddenModelCount,
  minZoom,
  maxZoom,
  maxDays,
  maxSummaryQuietDays,
  modelExplorer,
  monthTicks,
  onLabDragEnd,
  onLabDragStart,
  onLabHide,
  onLabMove,
  onLabReorder,
  onShowHiddenLabs,
  processedLabs,
  scrollContainerRef,
  timelineWidth,
  yearTicks,
  zoom,
}: MobileTimelineExperienceProps) {
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
              AI model launches, arranged as one continuous race.
            </h1>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              {boardView.isDefault
                ? 'The default board stays focused on frontier labs, with open-source, image, and 3D generation timelines kept in separate views.'
                : boardView.isEmpty
                  ? 'Turn on one or more model groups to compose the mobile timeline.'
                : boardView.isComposite
                  ? `${boardView.label} shows selected groups together. Use zoom when the field gets dense.`
                : `${boardView.label} is isolated into its own board, keeping the release field readable on mobile.`}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Latest on the board</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">
                <span className="font-semibold">{latestLab?.name ?? 'n/a'}</span>
                {' '}with <span className="font-semibold">{latestLab?.latestRelease?.name ?? 'n/a'}</span>.
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{boardView.label}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {modelExplorer}
              {hiddenModelCount > 0 ? (
                <SurfaceButton label="Show hidden model rows" onClick={onShowHiddenLabs}>
                  <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                  <span>Rows</span>
                </SurfaceButton>
              ) : null}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[760px] px-4 pb-6">
        <motion.section
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1]}}
          className="overflow-hidden rounded-[1.9rem] border border-[var(--edge)] bg-[var(--surface)] shadow-[var(--panel-shadow)] backdrop-blur-xl"
        >
          <div className="border-b border-[var(--edge)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Timeline field</p>
            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <span>Swipe horizontally to move</span>
              <span className="font-mono">{Math.round(zoom * 100)}%</span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <SurfaceButton
                label="Zoom out"
                onClick={() => handleZoomChange((current) => getSteppedZoom(current, -ZOOM_PROGRESS_STEP, minZoom, maxZoom))}
              >
                <ZoomOutIcon className="h-4 w-4" />
              </SurfaceButton>

              <SurfaceButton label="Reset zoom" onClick={() => handleZoomChange(() => minZoom)}>
                <ResetIcon className="h-4 w-4" />
              </SurfaceButton>

              <SurfaceButton
                label="Zoom in"
                onClick={() => handleZoomChange((current) => getSteppedZoom(current, ZOOM_PROGRESS_STEP, minZoom, maxZoom))}
              >
                <ZoomInIcon className="h-4 w-4" />
              </SurfaceButton>
            </div>

            <label className="mt-4 block">
              <span className="sr-only">Canvas zoom</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={getZoomProgress(zoom, minZoom, maxZoom)}
                onChange={(event) =>
                  handleZoomChange(() => getZoomFromProgress(Number(event.target.value), minZoom, maxZoom))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--edge)] accent-[var(--ink)]"
              />
            </label>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[196px] border-r border-[var(--edge)] bg-[linear-gradient(90deg,rgba(11,14,20,0.99)_0%,rgba(11,14,20,0.96)_78%,rgba(11,14,20,0)_100%)]">
              <div className="px-3 pb-10 pt-20">
                <div className="flex flex-col gap-8">
                  {processedLabs.map((lab, labIndex) => (
                    <React.Fragment key={`${lab.id}-mobile-rail`}>
                      <LabRailItem
                        compact
                        draggedLabId={draggedLabId}
                        isFirst={labIndex === 0}
                        isLast={labIndex === processedLabs.length - 1}
                        lab={lab}
                        onDragEnd={onLabDragEnd}
                        onDragStart={onLabDragStart}
                        onHide={onLabHide}
                        onMove={onLabMove}
                        onReorder={onLabReorder}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="relative overflow-x-auto overflow-y-hidden pb-6 [scrollbar-gutter:stable]"
            >
              <div
                className="relative transition-[min-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{minWidth: `${timelineWidth + MOBILE_LABEL_RAIL_WIDTH}px`}}
              >
                <div style={{paddingLeft: `${MOBILE_LABEL_RAIL_WIDTH}px`}}>
                  <div
                    className="relative pb-10 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{width: `${timelineWidth}px`}}
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

                    {processedLabs.length === 0 ? (
                      <TimelineEmptyState
                        boardView={boardView}
                        hiddenModelCount={hiddenModelCount}
                        onShowHiddenLabs={onShowHiddenLabs}
                      />
                    ) : (
                    <div className="relative flex flex-col gap-8 pb-10 pt-20">
                      {processedLabs.map((lab, labIndex) => (
                        <div key={`${lab.id}-mobile-row`} className="relative h-[5rem]">
                          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--track-line)]" />

                          {lab.releases.map((release, releaseIndex) => {
                            const previousRelease = lab.releases[releaseIndex - 1];
                            const leftPercent = (release.globalDay / maxDays) * 100;
                            const previousPercent = previousRelease ? (previousRelease.globalDay / maxDays) * 100 : leftPercent;
                            const widthPercent = previousRelease ? leftPercent - previousPercent : 0;
                            const delay = labIndex * 0.1 + releaseIndex * 0.07;
                            const isLatestInLab =
                              lab.latestRelease?.name === release.name && lab.latestRelease?.date === release.date;
                            const labelTextColor = isLatestInLab ? mixHexColor(lab.accent, 255, 0.12) : mixHexColor(lab.accent, 255, 0.24);
                            const labelBorderColor = toRgbaFromHex(lab.accent, isLatestInLab ? 0.5 : 0.3);
                            const labelBackground = isLatestInLab ? toRgbaFromHex(lab.accent, 0.1) : undefined;

                            return (
                              <React.Fragment key={`${lab.id}-mobile-${release.name}`}>
                                {previousRelease ? (
                                  <motion.div
                                    initial={{opacity: 0, scaleX: 0}}
                                    animate={{opacity: 0.56, scaleX: 1}}
                                    transition={{delay, duration: 0.65, ease: [0.22, 1, 0.36, 1]}}
                                    className="absolute top-1/2 h-[2px] -translate-y-1/2 origin-left"
                                    style={{
                                      backgroundColor: lab.accent,
                                      left: `${previousPercent}%`,
                                      width: `${widthPercent}%`,
                                    }}
                                  >
                                    <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2 py-1 text-[9px] font-mono uppercase tracking-[0.1em] text-[var(--muted)] shadow-[var(--soft-shadow)]">
                                      {release.gap}d
                                    </div>
                                  </motion.div>
                                ) : null}

                                <motion.div
                                  initial={{opacity: 0, scale: 0.8, y: 8}}
                                  animate={{opacity: 1, scale: 1, y: 0}}
                                  transition={{delay: delay + 0.08, duration: 0.42, type: 'spring', stiffness: 120, damping: 18}}
                                  className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                                  style={{left: `${leftPercent}%`}}
                                >
                                  <div className="relative">
                                    <div
                                      className="h-3.5 w-3.5 rounded-full border-[3px] border-[var(--surface-strong)]"
                                      style={{
                                        backgroundColor: lab.accent,
                                        boxShadow: isLatestInLab
                                          ? `0 0 0 4px color-mix(in srgb, ${lab.accent} 18%, transparent), 0 0 18px color-mix(in srgb, ${lab.accent} 34%, transparent)`
                                          : `0 0 0 4px color-mix(in srgb, ${lab.accent} 10%, transparent)`,
                                        filter: isLatestInLab ? 'saturate(1.3) brightness(1.08)' : undefined,
                                      }}
                                    />

                                    <div
                                      className="absolute left-3 top-0 origin-bottom-left -translate-y-1 -rotate-[22deg] whitespace-nowrap rounded-[0.7rem] border px-1.5 py-0.5 text-[10px] font-bold tracking-[0.01em] shadow-[var(--soft-shadow)] backdrop-blur-sm"
                                      style={{
                                        backgroundColor: labelBackground,
                                        borderColor: labelBorderColor,
                                        color: labelTextColor,
                                      }}
                                    >
                                      {release.name}
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
                                animate={{opacity: 0.38, scaleX: 1}}
                                transition={{
                                  delay: labIndex * 0.12 + lab.releases.length * 0.08,
                                  duration: 0.75,
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
                                className="absolute top-1/2 z-0 -translate-y-1/2 pl-2"
                                style={{left: `${(currentGlobalDay / maxDays) * 100}%`}}
                              >
                                <div className="rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)] shadow-[var(--soft-shadow)]">
                                  +{getQuietDays(lab, currentGlobalDay)}d
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </section>

      <section className="mx-auto max-w-[760px] px-4 pb-16">
        <div className="grid gap-3 sm:grid-cols-2">
          {processedLabs.map((lab, index) => {
            const quietDays = getQuietDays(lab, currentGlobalDay);
            const fillWidth = getRecencyFillWidth(quietDays, maxSummaryQuietDays);

            return (
              <motion.div
                key={`${lab.id}-mobile-summary`}
                initial={{opacity: 0, y: 16}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.16 + index * 0.06, duration: 0.46, ease: [0.22, 1, 0.36, 1]}}
                className="rounded-[1.45rem] border border-[var(--edge)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]"
              >
                <div className="flex items-center gap-3">
                  <LabTypeIconBadge className="h-7 w-7" lab={lab} />
                  <p className="truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{lab.name}</p>
                </div>
                <p className="mt-3 text-base font-semibold tracking-tight text-[var(--ink)]">
                  {formatQuietDaysLabel(quietDays)}
                </p>
                <p className="mt-2 truncate text-sm text-[var(--ink-soft)]">{lab.latestRelease?.name ?? 'No releases'}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {lab.latestRelease?.dateLabel ?? 'Date unavailable'}
                </p>

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
      </section>
    </>
  );
}

export default function App() {
  const [selectedPresetIds, setSelectedPresetIds] = useState<PresetId[]>(DEFAULT_SELECTED_PRESET_IDS);
  const [activeClassId, setActiveClassId] = useState<ModelClassId>(getPresetById(DEFAULT_PRESET_ID).classId);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_DESKTOP_ZOOM);
  const [mobileZoom, setMobileZoom] = useState(DEFAULT_MOBILE_ZOOM);
  const [isPanning, setIsPanning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [draggedLabId, setDraggedLabId] = useState<string | null>(null);
  const [hiddenLabIds, setHiddenLabIds] = useState<string[]>([]);
  const [labOrderIds, setLabOrderIds] = useState<string[]>(() => labs.map((lab) => lab.id));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null);
  const desktopPointerOffsetXRef = useRef<number | null>(null);
  const hasPositionedInitialView = useRef(false);
  const hasPositionedInitialMobileView = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const panStateRef = useRef({
    lastX: 0,
    zoomReferenceProgress: 0,
    zoomReferenceY: 0,
  });
  const [viewportWidths, setViewportWidths] = useState({desktop: 0, mobile: 0});

  const boardView = useMemo(() => getBoardView(selectedPresetIds), [selectedPresetIds]);
  const visibleLabs = useMemo(() => getVisibleLabs(labs, selectedPresetIds), [selectedPresetIds]);
  const orderedVisibleLabs = useMemo(
    () => orderLabs(visibleLabs, labOrderIds, hiddenLabIds),
    [hiddenLabIds, labOrderIds, visibleLabs],
  );
  const displayedLabIds = useMemo(() => orderedVisibleLabs.map((lab) => lab.id), [orderedVisibleLabs]);
  const hiddenModelCount = useMemo(() => {
    const hiddenLabIdSet = new Set(hiddenLabIds);
    return visibleLabs.filter((lab) => hiddenLabIdSet.has(lab.id)).length;
  }, [hiddenLabIds, visibleLabs]);
  const presetStats = useMemo(() => buildPresetStats(labs), []);
  const timelineData = useMemo(() => buildTimelineData(orderedVisibleLabs), [orderedVisibleLabs]);
  const today = new Date();
  const currentGlobalDay = (today.getTime() - START_DATE.getTime()) / DAY_MS;
  const maxDays = Math.max(Math.ceil(currentGlobalDay) + 36, timelineData.latestGlobalDay + 36, 720);
  const baseTimelineWidth = Math.max(Math.round(maxDays * TIMELINE_PIXELS_PER_DAY), 1);
  const desktopMinZoom = getFitZoom(viewportWidths.desktop, LABEL_RAIL_WIDTH, baseTimelineWidth);
  const mobileMinZoom = getFitZoom(viewportWidths.mobile, MOBILE_LABEL_RAIL_WIDTH, baseTimelineWidth);
  const timelineWidth = Math.max(Math.round(baseTimelineWidth * zoom), 1);
  const mobileTimelineWidth = Math.max(Math.round(baseTimelineWidth * mobileZoom), 1);
  const {monthTicks, yearTicks} = useMemo(() => buildTicks(maxDays), [maxDays]);

  const latestLab = useMemo(() => {
    return [...timelineData.processedLabs]
      .filter((lab) => lab.latestRelease)
      .sort((left, right) => (right.latestRelease?.globalDay ?? 0) - (left.latestRelease?.globalDay ?? 0))[0] ?? null;
  }, [timelineData.processedLabs]);

  const summaryLabs = useMemo(() => {
    return timelineData.processedLabs;
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
    setActiveClassId(getPresetById(DEFAULT_PRESET_ID).classId);
    setSelectedPresetIds(DEFAULT_SELECTED_PRESET_IDS);
    setHiddenLabIds([]);
    setLabOrderIds(labs.map((lab) => lab.id));
  };

  const selectAllPresets = () => {
    setSelectedPresetIds(modelPresets.map((preset) => preset.id));
  };

  const clearAllPresets = () => {
    setSelectedPresetIds([]);
  };

  const hideLab = (labId: string) => {
    setHiddenLabIds((currentIds) => {
      if (currentIds.includes(labId)) {
        return currentIds;
      }

      return [...currentIds, labId];
    });
  };

  const showHiddenLabs = () => {
    setHiddenLabIds([]);
  };

  const reorderLab = (sourceLabId: string, targetLabId: string) => {
    setLabOrderIds((currentIds) => reorderVisibleLabIds(currentIds, displayedLabIds, sourceLabId, targetLabId));
  };

  const moveLab = (labId: string, direction: LabMoveDirection) => {
    setLabOrderIds((currentIds) => moveVisibleLabId(currentIds, displayedLabIds, labId, direction));
  };

  const explorerProps = {
    activeClassId,
    boardView,
    isOpen: isExplorerOpen,
    onClassSelect: setActiveClassId,
    onClearAll: clearAllPresets,
    onClose: () => setIsExplorerOpen(false),
    onPresetToggle: togglePreset,
    onReset: resetPreset,
    onSelectAll: selectAllPresets,
    onToggle: () => setIsExplorerOpen((isOpen) => !isOpen),
    presetStats,
    selectedPresetIds,
  };

  const handleZoomChange = (updater: (zoomLevel: number) => number) => {
    const container = scrollContainerRef.current;
    const anchorOffsetX = container
      ? clampNumber(desktopPointerOffsetXRef.current ?? container.clientWidth / 2, 0, container.clientWidth)
      : null;
    const anchorRatio =
      container && anchorOffsetX !== null
        ? getTimelineAnchorRatio(container.scrollLeft, anchorOffsetX, LABEL_RAIL_WIDTH, timelineWidth)
        : null;

    startTransition(() => {
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
    });
  };

  const handleMobileZoomChange = (updater: (zoomLevel: number) => number) => {
    const container = mobileScrollContainerRef.current;
    const anchorOffsetX = container ? container.clientWidth / 2 : null;
    const anchorRatio =
      container && anchorOffsetX !== null
        ? getTimelineAnchorRatio(container.scrollLeft, anchorOffsetX, MOBILE_LABEL_RAIL_WIDTH, mobileTimelineWidth)
        : null;

    startTransition(() => {
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
    });
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
      zoomReferenceProgress: getZoomProgress(zoom, desktopMinZoom, DESKTOP_MAX_ZOOM),
      zoomReferenceY: event.clientY,
    };

    container.setPointerCapture(event.pointerId);
    setIsPanning(true);
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const pointerOffsetX = event.clientX - containerRect.left;
    desktopPointerOffsetXRef.current = pointerOffsetX;

    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    const deltaX = event.clientX - panStateRef.current.lastX;
    const deltaY = event.clientY - panStateRef.current.zoomReferenceY;
    const deadzoneAdjustedDeltaY =
      Math.abs(deltaY) <= DRAG_ZOOM_DEADZONE_PX
        ? 0
        : Math.sign(deltaY) * (Math.abs(deltaY) - DRAG_ZOOM_DEADZONE_PX);
    const currentGestureZoom = Number(
      getZoomFromProgress(panStateRef.current.zoomReferenceProgress, desktopMinZoom, DESKTOP_MAX_ZOOM).toFixed(3),
    );
    const nextZoom = Number(
      clampNumber(
        getZoomFromProgress(
          panStateRef.current.zoomReferenceProgress - deadzoneAdjustedDeltaY * DRAG_ZOOM_PROGRESS_PER_PIXEL,
          desktopMinZoom,
          DESKTOP_MAX_ZOOM,
        ),
        desktopMinZoom,
        DESKTOP_MAX_ZOOM,
      ).toFixed(3),
    );
    const targetScrollLeftBeforeZoom = container.scrollLeft - deltaX;
    container.scrollLeft = targetScrollLeftBeforeZoom;
    const contentRatioBeforeZoom = getTimelineAnchorRatio(
      container.scrollLeft,
      pointerOffsetX,
      LABEL_RAIL_WIDTH,
      timelineWidth,
    );
    const nextTimelineWidth = Math.max(Math.round(baseTimelineWidth * nextZoom), 1);

    const applyScrollPosition = () => {
      if (!scrollContainerRef.current) {
        return;
      }

      const nextScrollLeft = getScrollLeftForTimelineAnchor(
        contentRatioBeforeZoom,
        pointerOffsetX,
        LABEL_RAIL_WIDTH,
        nextTimelineWidth,
      );
      scrollContainerRef.current.scrollLeft = nextScrollLeft;
    };

    if (nextZoom !== currentGestureZoom) {
      setZoom(nextZoom);
      requestAnimationFrame(applyScrollPosition);

      panStateRef.current.zoomReferenceProgress = getZoomProgress(nextZoom, desktopMinZoom, DESKTOP_MAX_ZOOM);
      panStateRef.current.zoomReferenceY = event.clientY;
    }

    panStateRef.current.lastX = event.clientX;
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
      <div className="md:hidden">
        <MobileTimelineExperience
          boardView={boardView}
          currentGlobalDay={currentGlobalDay}
          draggedLabId={draggedLabId}
          handleZoomChange={handleMobileZoomChange}
          hiddenModelCount={hiddenModelCount}
          latestLab={latestLab}
          minZoom={mobileMinZoom}
          maxZoom={MOBILE_MAX_ZOOM}
          maxDays={maxDays}
          maxSummaryQuietDays={maxSummaryQuietDays}
          modelExplorer={<ModelClassExplorer {...explorerProps} />}
          monthTicks={monthTicks}
          onLabDragEnd={() => setDraggedLabId(null)}
          onLabDragStart={setDraggedLabId}
          onLabHide={hideLab}
          onLabMove={moveLab}
          onLabReorder={reorderLab}
          onShowHiddenLabs={showHiddenLabs}
          processedLabs={timelineData.processedLabs}
          scrollContainerRef={mobileScrollContainerRef}
          timelineWidth={mobileTimelineWidth}
          yearTicks={yearTicks}
          zoom={mobileZoom}
        />
      </div>

      <div className="hidden md:block">
        <DesktopTimelineExperience
          boardView={boardView}
          currentGlobalDay={currentGlobalDay}
          draggedLabId={draggedLabId}
          handlePointerDown={handlePointerDown}
          handlePointerMove={handlePointerMove}
          handleZoomChange={handleZoomChange}
          hiddenModelCount={hiddenModelCount}
          isPanning={isPanning}
          latestLab={latestLab}
          maxDays={maxDays}
          minZoom={desktopMinZoom}
          maxZoom={DESKTOP_MAX_ZOOM}
          maxSummaryQuietDays={maxSummaryQuietDays}
          modelExplorer={<ModelClassExplorer {...explorerProps} />}
          monthTicks={monthTicks}
          onLabDragEnd={() => setDraggedLabId(null)}
          onLabDragStart={setDraggedLabId}
          onLabHide={hideLab}
          onLabMove={moveLab}
          onLabReorder={reorderLab}
          onShowHiddenLabs={showHiddenLabs}
          processedLabs={timelineData.processedLabs}
          scrollContainerRef={scrollContainerRef}
          stopPanning={stopPanning}
          summaryLabs={summaryLabs}
          timelineWidth={timelineWidth}
          yearTicks={yearTicks}
          zoom={zoom}
        />
      </div>
    </div>
  );
}
