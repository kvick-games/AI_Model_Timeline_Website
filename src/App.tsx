import React, {startTransition, useEffect, useMemo, useRef, useState} from 'react';
import {createPortal, flushSync} from 'react-dom';
import {
  ArrowDown,
  ArrowUp,
  Box,
  BrainCircuit,
  Check,
  ChevronDown,
  Clapperboard,
  Code2,
  Globe2,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {motion} from 'motion/react';

type ModelClassId = 'frontier-llms' | 'open-source-llms' | 'image-generation' | 'video-generation' | '3d-generation' | 'coding-harnesses';
type PresetId =
  | 'frontier-llms'
  | 'chinese-open-source'
  | 'mistral'
  | 'image-generation'
  | 'video-generation'
  | '3d-generation'
  | 'coding-harnesses';

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

type ProductLineId = string;
type ProductMarkerShape = 'circle' | 'square' | 'diamond';

type ProductLineConfig = {
  id: ProductLineId;
  label: string;
  shortLabel: string;
  classId: ModelClassId;
  markerShape: ProductMarkerShape;
};

type ProductLineRecord = ProductLineConfig & {
  defaultClasses?: ModelClassId[];
  defaultPresets?: PresetId[];
  releases: ReleaseRecord[];
};

type CompanyRecord = {
  id: string;
  name: string;
  accent: string;
  defaultClasses: ModelClassId[];
  defaultPresets: PresetId[];
  productLines: ProductLineRecord[];
};

type ProcessedRelease = ReleaseRecord & {
  classes: ModelClassId[];
  dateLabel: string;
  globalDay: number;
  gap: number;
  presets: PresetId[];
};

type ProcessedProductLine = Omit<ProductLineRecord, 'releases'> & {
  averageGap: number | null;
  latestRelease: ProcessedRelease | null;
  releases: ProcessedRelease[];
  startDay: number;
  totalSpan: number;
};

type ProcessedCompany = Omit<CompanyRecord, 'productLines'> & {
  averageGap: number | null;
  latestProductLine: ProcessedProductLine | null;
  latestRelease: ProcessedRelease | null;
  productLines: ProcessedProductLine[];
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
const DRAG_ZOOM_PROGRESS_PER_PIXEL = 0.0011;
const DRAG_ZOOM_DEADZONE_PX = 12;
const DEFAULT_PRESET_ID: PresetId = 'frontier-llms';
const DEFAULT_SELECTED_PRESET_IDS: PresetId[] = [DEFAULT_PRESET_ID];

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
    id: 'video-generation',
    classId: 'video-generation',
    label: 'Video Generation',
    description: 'Text-to-video, image-to-video, and filmmaking model releases.',
  },
  {
    id: '3d-generation',
    classId: '3d-generation',
    label: '3D Generation',
    description: '3D asset and reconstruction models from specialized labs.',
  },
  {
    id: 'coding-harnesses',
    classId: 'coding-harnesses',
    label: 'Coding Harnesses',
    description: 'Agentic coding tools, IDEs, and harnesses built on foundation models.',
  },
];

const presetGroups: { label: string; presetIds: PresetId[] }[] = [
  {
    label: 'Foundation Models',
    presetIds: ['frontier-llms', 'chinese-open-source', 'mistral'],
  },
  {
    label: 'Coding Harnesses',
    presetIds: ['coding-harnesses'],
  },
  {
    label: 'Creative Generation',
    presetIds: ['image-generation', 'video-generation', '3d-generation'],
  },
];

function getDefaultMarkerShape(classId: ModelClassId): ProductMarkerShape {
  if (classId === 'coding-harnesses') {
    return 'square';
  }

  if (classId === 'video-generation') {
    return 'diamond';
  }

  return 'circle';
}

function defineProductLine({
  classId,
  defaultClasses,
  defaultPresets,
  id,
  label,
  markerShape,
  releases,
  shortLabel,
}: {
  classId: ModelClassId;
  defaultClasses?: ModelClassId[];
  defaultPresets: PresetId[];
  id: ProductLineId;
  label: string;
  markerShape?: ProductMarkerShape;
  releases: ReleaseRecord[];
  shortLabel?: string;
}): ProductLineRecord {
  return {
    id,
    label,
    shortLabel: shortLabel ?? label,
    classId,
    markerShape: markerShape ?? getDefaultMarkerShape(classId),
    defaultClasses: defaultClasses ?? [classId],
    defaultPresets,
    releases,
  };
}

function defineCompany({
  accent,
  id,
  name,
  productLines,
}: {
  accent: string;
  id: string;
  name: string;
  productLines: ProductLineRecord[];
}): CompanyRecord {
  const firstLine = productLines[0];

  return {
    id,
    name,
    accent,
    defaultClasses: firstLine?.defaultClasses ?? ['frontier-llms'],
    defaultPresets: firstLine?.defaultPresets ?? [DEFAULT_PRESET_ID],
    productLines,
  };
}

const companies: CompanyRecord[] = [
  defineCompany({
    id: 'openai',
    name: 'OpenAI',
    accent: '#139a74',
    productLines: [
      defineProductLine({
        id: 'openai-gpt',
        label: 'GPT models',
        shortLabel: 'GPT',
        classId: 'frontier-llms',
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
      }),
      defineProductLine({
        id: 'openai-image',
        label: 'Image models',
        shortLabel: 'Image',
        classId: 'image-generation',
        defaultPresets: ['image-generation'],
        releases: [
          {name: 'DALL-E 2', date: '2022-09-28'},
          {name: 'DALL-E 3', date: '2023-09-20'},
          {name: 'GPT-4o Image', date: '2025-03-25'},
          {name: 'GPT Image 2', date: '2026-04-21'},
        ],
      }),
      defineProductLine({
        id: 'openai-sora',
        label: 'Sora video',
        shortLabel: 'Sora',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
          {name: 'Sora Preview', date: '2024-02-15'},
          {name: 'Sora Turbo', date: '2024-12-09'},
          {name: 'Sora 2', date: '2025-09-30'},
        ],
      }),
      defineProductLine({
        id: 'openai-codex',
        label: 'Codex',
        shortLabel: 'Codex',
        classId: 'coding-harnesses',
        defaultPresets: ['coding-harnesses'],
        markerShape: 'square',
        releases: [
          {name: 'Codex Preview', date: '2025-05-16'},
          {name: 'GPT-5-Codex', date: '2025-09-15'},
          {name: 'Codex GA', date: '2025-10-06'},
          {name: 'GPT-5.2-Codex', date: '2025-12-18'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'anthropic',
    name: 'Anthropic',
    accent: '#d38b14',
    productLines: [
      defineProductLine({
        id: 'anthropic-claude',
        label: 'Claude models',
        shortLabel: 'Claude',
        classId: 'frontier-llms',
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
      }),
      defineProductLine({
        id: 'anthropic-claude-code',
        label: 'Claude Code',
        shortLabel: 'Code',
        classId: 'coding-harnesses',
        defaultPresets: ['coding-harnesses'],
        markerShape: 'square',
        releases: [
          {name: 'Claude Code Preview', date: '2025-02-24'},
          {name: 'Claude Code GA', date: '2025-05-22'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'google',
    name: 'Google',
    accent: '#2d6ed8',
    productLines: [
      defineProductLine({
        id: 'google-gemini',
        label: 'Gemini models',
        shortLabel: 'Gemini',
        classId: 'frontier-llms',
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
      }),
      defineProductLine({
        id: 'google-veo',
        label: 'Veo video',
        shortLabel: 'Veo',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
          {name: 'Veo', date: '2024-05-14'},
          {name: 'Veo 2', date: '2024-12-16'},
          {name: 'Veo 3', date: '2025-05-20'},
          {name: 'Veo 3.1', date: '2025-10-15'},
        ],
      }),
      defineProductLine({
        id: 'google-coding-tools',
        label: 'Gemini coding tools',
        shortLabel: 'Tools',
        classId: 'coding-harnesses',
        defaultPresets: ['coding-harnesses'],
        markerShape: 'square',
        releases: [
          {name: 'Gemini CLI', date: '2025-06-25'},
          {name: 'Antigravity IDE', date: '2025-11-20'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'xai',
    name: 'xAI',
    accent: '#777f90',
    productLines: [
      defineProductLine({
        id: 'xai-grok',
        label: 'Grok models',
        shortLabel: 'Grok',
        classId: 'frontier-llms',
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
      }),
      defineProductLine({
        id: 'xai-grok-build',
        label: 'Grok Build',
        shortLabel: 'Build',
        classId: 'coding-harnesses',
        defaultPresets: ['coding-harnesses'],
        markerShape: 'square',
        releases: [
          {name: 'Grok Build (Beta)', date: '2026-05-14'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'cursor',
    name: 'Cursor',
    accent: '#7c9cf0',
    productLines: [
      defineProductLine({
        id: 'cursor-editor',
        label: 'Cursor editor',
        shortLabel: 'Cursor',
        classId: 'coding-harnesses',
        defaultPresets: ['coding-harnesses'],
        releases: [
          {name: 'Cursor', date: '2023-07-28'},
          {name: 'Copilot++ Beta', date: '2023-11-10'},
          {name: 'Cursor Tab', date: '2025-01-13'},
          {name: 'Cursor 1.0', date: '2025-06-04'},
          {name: 'Cursor Agent CLI', date: '2025-08-07'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'deepseek',
    name: 'DeepSeek',
    accent: '#4d8bd6',
    productLines: [
      defineProductLine({
        id: 'deepseek-models',
        label: 'DeepSeek models',
        shortLabel: 'DeepSeek',
        classId: 'open-source-llms',
        defaultPresets: ['chinese-open-source'],
        releases: [
      {name: 'DeepSeek-V2', date: '2024-05-06'},
      {name: 'DeepSeek-V2.5', date: '2024-09-05'},
      {name: 'DeepSeek-V3', date: '2024-12-26'},
      {name: 'DeepSeek-R1', date: '2025-01-20'},
      {name: 'DeepSeek-R1-0528', date: '2025-05-28'},
      {name: 'DeepSeek-V3.1', date: '2025-08-21'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'qwen',
    name: 'Alibaba',
    accent: '#8c79d6',
    productLines: [
      defineProductLine({
        id: 'qwen-models',
        label: 'Qwen models',
        shortLabel: 'Qwen',
        classId: 'open-source-llms',
        defaultPresets: ['chinese-open-source'],
        releases: [
      {name: 'Qwen2', date: '2024-06-07'},
      {name: 'Qwen2.5', date: '2024-09-19'},
      {name: 'Qwen2.5-VL', date: '2025-01-28'},
      {name: 'Qwen3', date: '2025-04-29'},
      {name: 'Qwen3-Coder', date: '2025-07-29'},
      {name: 'Qwen3.6-35B-A3B', date: '2026-04-17'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'moonshot-kimi',
    name: 'Moonshot AI',
    accent: '#56a3a6',
    productLines: [
      defineProductLine({
        id: 'kimi-models',
        label: 'Kimi models',
        shortLabel: 'Kimi',
        classId: 'open-source-llms',
        defaultPresets: ['chinese-open-source'],
        releases: [
      {name: 'Kimi Chat', date: '2023-10-09'},
      {name: 'Kimi k1.5', date: '2025-01-20'},
      {name: 'Kimi K2', date: '2025-07-11'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'zhipu-glm',
    name: 'Zhipu AI',
    accent: '#c78f38',
    productLines: [
      defineProductLine({
        id: 'glm-models',
        label: 'GLM models',
        shortLabel: 'GLM',
        classId: 'open-source-llms',
        defaultPresets: ['chinese-open-source'],
        releases: [
      {name: 'GLM-4', date: '2024-01-16'},
      {name: 'GLM-4-9B', date: '2024-06-05'},
      {name: 'GLM-4.5', date: '2025-07-28'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'mistral-ai',
    name: 'Mistral AI',
    accent: '#ff9f1c',
    productLines: [
      defineProductLine({
        id: 'mistral-models',
        label: 'Mistral models',
        shortLabel: 'Mistral',
        classId: 'open-source-llms',
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
      }),
    ],
  }),
  defineCompany({
    id: 'midjourney',
    name: 'Midjourney',
    accent: '#c0537a',
    productLines: [
      defineProductLine({
        id: 'midjourney-image',
        label: 'Image models',
        shortLabel: 'Image',
        classId: 'image-generation',
        defaultPresets: ['image-generation'],
        releases: [
      {name: 'Midjourney V5', date: '2023-03-15'},
      {name: 'Midjourney V6', date: '2023-12-20'},
      {name: 'Midjourney V6.1', date: '2024-07-30'},
      {name: 'Midjourney V7', date: '2025-04-03'},
      {name: 'Niji 7', date: '2026-01-09'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'stability-ai',
    name: 'Stability AI',
    accent: '#6b8e4e',
    productLines: [
      defineProductLine({
        id: 'stability-image',
        label: 'Image models',
        shortLabel: 'Image',
        classId: 'image-generation',
        defaultPresets: ['image-generation'],
        releases: [
      {name: 'Stable Diffusion 2.0', date: '2022-11-24'},
      {name: 'SDXL 1.0', date: '2023-07-26'},
      {name: 'Stable Diffusion 3 Medium', date: '2024-06-12'},
      {name: 'Stable Diffusion 3.5', date: '2024-10-22'},
        ],
      }),
      defineProductLine({
        id: 'stability-video',
        label: 'Video models',
        shortLabel: 'Video',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
          {name: 'Stable Video Diffusion', date: '2023-11-21'},
          {name: 'Stable Video 4D', date: '2024-07-24'},
        ],
      }),
      defineProductLine({
        id: 'stability-3d',
        label: '3D models',
        shortLabel: '3D',
        classId: '3d-generation',
        defaultPresets: ['3d-generation'],
        releases: [
          {name: 'Stable Zero123', date: '2023-12-13'},
          {name: 'TripoSR', date: '2024-03-04'},
          {name: 'Stable Video 3D', date: '2024-03-18'},
          {name: 'Stable Fast 3D', date: '2024-08-01'},
          {name: 'Stable Point Aware 3D', date: '2025-03-18'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'black-forest-labs',
    name: 'Black Forest Labs',
    accent: '#7b6bd6',
    productLines: [
      defineProductLine({
        id: 'flux-image',
        label: 'FLUX models',
        shortLabel: 'FLUX',
        classId: 'image-generation',
        defaultPresets: ['image-generation'],
        releases: [
      {name: 'FLUX.1', date: '2024-08-01'},
      {name: 'FLUX.1 Tools', date: '2024-11-21'},
      {name: 'FLUX.1 Kontext', date: '2025-05-29'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'runway-video',
    name: 'Runway',
    accent: '#d7d0c3',
    productLines: [
      defineProductLine({
        id: 'runway-gen',
        label: 'Gen video',
        shortLabel: 'Gen',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
      {name: 'Gen-2', date: '2023-03-20'},
      {name: 'Gen-3 Alpha', date: '2024-06-17'},
      {name: 'Gen-4', date: '2025-03-31'},
      {name: 'Gen-4.5', date: '2025-12-01'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'luma-ai',
    name: 'Luma AI',
    accent: '#58a9c7',
    productLines: [
      defineProductLine({
        id: 'luma-video',
        label: 'Video models',
        shortLabel: 'Video',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
      {name: 'Dream Machine', date: '2024-06-12'},
      {name: 'Ray2', date: '2025-01-15'},
      {name: 'Ray3', date: '2025-09-18'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'pika-labs',
    name: 'Pika',
    accent: '#e39b4d',
    productLines: [
      defineProductLine({
        id: 'pika-video',
        label: 'Video models',
        shortLabel: 'Video',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
      {name: 'Pika 1.0', date: '2023-11-28'},
      {name: 'Pika 1.5', date: '2024-10-01'},
      {name: 'Pika 2.0', date: '2024-12-13'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'kuaishou-kling',
    name: 'Kuaishou',
    accent: '#c75c4f',
    productLines: [
      defineProductLine({
        id: 'kling-video',
        label: 'Kling video',
        shortLabel: 'Kling',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
      {name: 'Kling', date: '2024-06-06'},
      {name: 'Kling 2.0', date: '2025-04-15'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'bytedance-seedance',
    name: 'ByteDance',
    accent: '#5f75d6',
    productLines: [
      defineProductLine({
        id: 'seedance-video',
        label: 'Seedance video',
        shortLabel: 'Seedance',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
      {name: 'Seedance 1.0', date: '2025-06-11'},
      {name: 'Seedance 2.0', date: '2026-02-12'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'tencent-hunyuan-3d',
    name: 'Tencent',
    accent: '#327ec7',
    productLines: [
      defineProductLine({
        id: 'hunyuan-3d',
        label: 'Hunyuan3D',
        shortLabel: 'Hunyuan3D',
        classId: '3d-generation',
        defaultPresets: ['3d-generation'],
        releases: [
      {name: 'Hunyuan3D 1.0', date: '2024-11-05'},
      {name: 'Hunyuan3D 2.0', date: '2025-01-21'},
      {name: 'Hunyuan3D 2.1', date: '2025-06-18'},
        ],
      }),
    ],
  }),
  defineCompany({
    id: 'tripo-ai',
    name: 'Tripo AI',
    accent: '#d15f45',
    productLines: [
      defineProductLine({
        id: 'tripo-3d',
        label: '3D models',
        shortLabel: '3D',
        classId: '3d-generation',
        defaultPresets: ['3d-generation'],
        releases: [
      {name: 'Tripo AI', date: '2023-09-12'},
      {name: 'TripoSR', date: '2024-03-04'},
      {name: 'Tripo 2.0', date: '2025-01-21'},
        ],
      }),
    ],
  }),
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
      description: 'Every tracked model family and coding harness line is visible.',
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
        const leftDate = parseUtcDate(left.date).getTime();
        const rightDate = parseUtcDate(right.date).getTime();
        return leftDate - rightDate || left.name.localeCompare(right.name);
      });

      const processedReleases = sortedReleases.reduce<ProcessedRelease[]>((collection, release) => {
        const releaseDate = parseUtcDate(release.date);

        if (Number.isNaN(releaseDate.getTime())) {
          invalidEntries.push(`${company.name} / ${productLine.label}: ${release.name}`);
          return collection;
        }

        const previousRelease = collection[collection.length - 1];
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
        ...productLine,
        averageGap,
        latestRelease,
        releases: processedReleases,
        startDay: firstRelease?.globalDay ?? 0,
        totalSpan: latestRelease && firstRelease ? latestRelease.globalDay - firstRelease.globalDay : 0,
      };
    });

    const latestProductLine = [...processedProductLines]
      .filter((productLine) => productLine.latestRelease)
      .sort((left, right) => (right.latestRelease?.globalDay ?? 0) - (left.latestRelease?.globalDay ?? 0))[0] ?? null;
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
      totalSpan: latestRelease && firstRelease ? latestRelease.globalDay - firstRelease.globalDay : 0,
    };
  });

  const latestGlobalDay = processedCompanies.reduce((max, company) => {
    const currentLatestDay = company.latestRelease?.globalDay ?? 0;
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

function getQuietDays(item: {latestRelease: ProcessedRelease | null}, currentGlobalDay: number) {
  return item.latestRelease ? Math.max(0, Math.floor(currentGlobalDay - item.latestRelease.globalDay)) : 0;
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

  if (classId === 'video-generation') {
    return <Clapperboard className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === '3d-generation') {
    return <Box className={iconClassName} strokeWidth={1.8} />;
  }

  if (classId === 'coding-harnesses') {
    return <Code2 className={iconClassName} strokeWidth={1.8} />;
  }

  return <Layers3 className={iconClassName} strokeWidth={1.8} />;
}

type ModelClassExplorerProps = {
  boardView: BoardView;
  isOverlayEnabled: boolean;
  isOpen: boolean;
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
  boardView,
  isOverlayEnabled,
  isOpen,
  onClearAll,
  onClose,
  onPresetToggle,
  onReset,
  onSelectAll,
  onToggle,
  presetStats,
  selectedPresetIds,
}: ModelClassExplorerProps) {
  const selectedCount = selectedPresetIds.length;
  const pickerOverlay =
    isOverlayEnabled && isOpen && typeof document !== 'undefined'
      ? createPortal(
          <div className="pointer-events-none fixed inset-0 z-[100] px-3 pb-3 pt-4 md:px-8 md:pt-8">
            <motion.div
              initial={{opacity: 0, y: -18, scale: 0.98}}
              animate={{opacity: 1, y: 0, scale: 1}}
              transition={{duration: 0.24, ease: [0.22, 1, 0.36, 1]}}
              className="pointer-events-auto relative mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[620px] flex-col overflow-hidden rounded-[1.4rem] border border-[var(--edge-strong)] bg-[rgba(10,13,19,0.98)] shadow-[0_34px_90px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl md:max-h-[calc(100dvh-4rem)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--edge)] px-4 py-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Timeline categories</p>
                  <p className="mt-1 truncate text-base font-semibold tracking-tight text-[var(--ink)]">Add product lines</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {selectedCount} of {modelPresets.length} lines active
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close timeline category picker"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--edge)] text-[var(--ink-soft)] transition duration-300 hover:border-[var(--edge-strong)] hover:bg-[var(--surface-strong)] active:scale-[0.96]"
                >
                  <X className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>

              <div className="overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  {presetGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {group.label}
                      </p>
                      <div className="space-y-2">
                        {group.presetIds.map((presetId) => {
                          const preset = modelPresets.find((candidate) => candidate.id === presetId);

                          if (!preset) {
                            return null;
                          }

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
                              <span className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] gap-3">
                                <ModelClassIcon classId={preset.classId} className="mt-0.5 h-5 w-5 text-[var(--ink)]" />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold tracking-tight text-[var(--ink)]">{preset.label}</span>
                                  <span className="mt-1 block text-xs leading-5 text-[var(--ink-soft)]">{preset.description}</span>
                                  <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Choose timeline categories"
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

      {pickerOverlay}
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
          <CompanyTypeIconBadge className={compact ? 'h-7 w-7' : 'h-8 w-8'} company={company} />
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
  compact = false,
  company,
  companyIndex,
  currentGlobalDay,
  maxDays,
  productLine,
  productLineIndex,
}: {
  compact?: boolean;
  company: ProcessedCompany;
  companyIndex: number;
  currentGlobalDay: number;
  maxDays: number;
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
        const delay = companyIndex * 0.1 + productLineIndex * 0.05 + releaseIndex * 0.07;
        const isLatestInLine =
          productLine.latestRelease?.name === release.name && productLine.latestRelease?.date === release.date;
        const labelTextColor = isLatestInLine
          ? mixHexColor(company.accent, 255, 0.12)
          : mixHexColor(company.accent, 255, 0.24);
        const labelBorderColor = toRgbaFromHex(company.accent, isLatestInLine ? 0.52 : 0.34);
        const labelBackground = isLatestInLine ? toRgbaFromHex(company.accent, 0.12) : undefined;

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

            <motion.div
              initial={{opacity: 0, scale: 0.78, y: compact ? 8 : 10}}
              animate={{opacity: 1, scale: 1, y: 0}}
              transition={{delay: delay + 0.08, duration: compact ? 0.42 : 0.48, type: 'spring', stiffness: 120, damping: 18}}
              className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              style={{left: `${leftPercent}%`}}
            >
              <div className="group relative cursor-default">
                <div
                  className={`${markerSizeClass} border-[3px] border-[var(--surface-strong)] transition duration-300 group-hover:scale-[1.22] ${markerShapeClass}`}
                  style={{
                    backgroundColor: company.accent,
                    boxShadow: isLatestInLine
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
                      {productLine.shortLabel} / {release.dateLabel}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </React.Fragment>
        );
      })}

      {productLine.latestRelease && currentGlobalDay > productLine.latestRelease.globalDay ? (
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
              left: `${(productLine.latestRelease.globalDay / maxDays) * 100}%`,
              ['--quiet-flow-duration' as string]: `${compact ? 5.4 : 6.4}s`,
              ['--quiet-line-color' as string]: company.accent,
              width: `${((currentGlobalDay - productLine.latestRelease.globalDay) / maxDays) * 100}%`,
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
  compact = false,
  company,
  companyIndex,
  currentGlobalDay,
  maxDays,
}: {
  compact?: boolean;
  company: ProcessedCompany;
  companyIndex: number;
  currentGlobalDay: number;
  maxDays: number;
}) {
  return (
    <div className="relative flex flex-col justify-center" style={{height: `${getCompanyGroupHeight(company, compact)}px`, gap: `${PRODUCT_LINE_GAP}px`}}>
      <ProductLineBranchConnectors compact={compact} company={company} maxDays={maxDays} />
      {company.productLines.map((productLine, productLineIndex) => (
        <React.Fragment key={`${company.id}-${productLine.id}`}>
          <ProductLineTimelineLane
            compact={compact}
            company={company}
            companyIndex={companyIndex}
            currentGlobalDay={currentGlobalDay}
            maxDays={maxDays}
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
                {company.latestRelease?.dateLabel ?? 'Date unavailable'}
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

const AURORA_FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uScroll;
uniform sampler2D uNoiseMap;
uniform sampler2D uFlowMap;

varying vec2 vUv;

float sampleNoise(vec2 uv) {
  return texture2D(uNoiseMap, fract(uv)).r;
}

vec2 sampleFlow(vec2 uv) {
  return texture2D(uFlowMap, fract(uv)).rg * 2.0 - 1.0;
}

float auroraBand(vec2 p, float y, float width, float skew, float phase) {
  float wave = sin(p.x * 1.7 + uTime * 0.1 + phase) * 0.007;
  wave += sin(p.x * 53.1 - uTime * 5.038 + phase * 0.7) * 0.535;
  float d = (p.y - y - p.x * skew - wave) / width;
  return exp(-d * d);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv * 2.0 - 1.0) * aspect * 0.76;
  vec2 scrollUv = uv + vec2(0.0, -uScroll * 0.04);
  float t = uTime * 50.1;

  float noiseX = sampleNoise(scrollUv * vec2(1.78, 2.34) + vec2(t * 0.006, -t * 0.003));
  float noiseY = sampleNoise(scrollUv * vec2(2.72, 3.22) + vec2(-t * 0.004, t * 0.0055));
  vec2 noiseOffset = (vec2(noiseX, noiseY) - 0.5) * 0.01;

  vec2 flow = sampleFlow(scrollUv * 0.72 + noiseOffset + vec2(t * 0.00042, -t * 0.00028));
  vec2 warpedUv = scrollUv + noiseOffset + flow * 0.045;
  vec2 q = (warpedUv * 2.0 - 1.0) * aspect * 0.76;

  float cloud = sampleNoise(warpedUv * vec2(3.5, 2.86) + vec2(-t * 0.003, t * 0.002));
  float detail = sampleNoise(warpedUv * vec2(5.46, 4.16) + vec2(t * 0.005, t * 0.003));
  float slowMist = sampleNoise(scrollUv * vec2(1.1, 1.5) + vec2(t * 0.0015, -t * 0.001));
  float veil = smoothstep(0.26, 0.88, cloud * 0.68 + detail * 0.22 + slowMist * 0.34);

  float bandA = auroraBand(q, 0.25, 1.48, -0.13, 0.0);
  float bandB = auroraBand(q, -0.03, 0.42, 0.09, 1.7);
  float bandC = auroraBand(q, -0.38, 0.44, -0.07, 3.4);

  vec3 base = vec3(0.014, 0.02, 0.032);
  vec3 teal = vec3(0.055, 0.42, 0.35);
  vec3 blue = vec3(0.06, 0.18, 0.39);
  vec3 green = vec3(0.12, 0.36, 0.25);
  vec3 aurora = teal * bandA * 0.58 + blue * bandB * 0.0 + green * bandC * 0.0;

  float fieldFade = 0.28 + 0.72 * (1.0 - smoothstep(0.55, 2.05, length(p * vec2(0.56, 0.82))));
  float panelShade = (1.0 - smoothstep(0.02, 0.72, uv.y)) * 0.1;
  vec3 haze = vec3(0.025, 0.05, 0.058) * (slowMist * 0.18 + cloud * 0.08);
  vec3 color = base + aurora * veil * fieldFade + haze * (0.74 + fieldFade * 0.26);
  color *= 0.7 + fieldFade * 0.3;
  color -= panelShade;

  float grain = sampleNoise(scrollUv * uResolution.xy / 140.0 + vec2(t * 0.004, -t * 0.003));
  color += (grain - 0.5) * 0.01;

  gl_FragColor = vec4(color, 1.0);
}
`;

function AuroraBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', {
      alpha: false,
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

    const vertexShader = compileShader(gl.VERTEX_SHADER, AURORA_VERTEX_SHADER);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, AURORA_FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    const quadBuffer = gl.createBuffer();

    if (!quadBuffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const scrollLocation = gl.getUniformLocation(program, 'uScroll');
    const noiseMapLocation = gl.getUniformLocation(program, 'uNoiseMap');
    const flowMapLocation = gl.getUniformLocation(program, 'uFlowMap');

    const createTexture = (unit: number, src: string) => {
      const texture = gl.createTexture();

      if (!texture) {
        return Promise.resolve(null);
      }

      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([6, 10, 16, 255]));

      return new Promise<WebGLTexture | null>((resolve) => {
        const image = new Image();

        image.onload = () => {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          resolve(texture);
        };

        image.onerror = () => resolve(texture);
        image.src = src;
      });
    };

    let animationFrame = 0;
    let disposed = false;
    const startedAt = performance.now();
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const getScrollProgress = () => window.scrollY / Math.max(window.innerHeight, 1);

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.3);
      const width = Math.max(1, Math.floor(window.innerWidth * pixelRatio));
      const height = Math.max(1, Math.floor(window.innerHeight * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.uniform2f(resolutionLocation, width, height);
    };

    const drawFrame = (now: number) => {
      resize();
      gl.uniform1f(timeLocation, (now - startedAt) / 1000);
      gl.uniform1f(scrollLocation, getScrollProgress());
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const updateScrollTarget = () => {
      if (reducedMotionQuery.matches) {
        drawFrame(performance.now());
      }
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

    const start = async () => {
      await Promise.all([
        createTexture(0, '/textures/aurora-noise-mask.png'),
        createTexture(1, '/textures/aurora-flow-vector-map.png'),
      ]);

      if (disposed) {
        return;
      }

      gl.useProgram(program);
      gl.uniform1i(noiseMapLocation, 0);
      gl.uniform1i(flowMapLocation, 1);
      drawFrame(startedAt + 8000);

      if (!reducedMotionQuery.matches) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScrollTarget, {passive: true});
    void start();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScrollTarget);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="aurora-backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="aurora-canvas" />
    </div>
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
  boardView: BoardView;
  currentGlobalDay: number;
  draggedCompanyId: string | null;
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
  onCompanyDragEnd: () => void;
  onCompanyDragStart: (companyId: string) => void;
  onCompanyHide: (companyId: string) => void;
  onCompanyMove: CompanyMoveHandler;
  onCompanyReorder: CompanyReorderHandler;
  onShowHiddenCompanies: () => void;
  processedCompanies: ProcessedCompany[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  stopPanning: TimelinePointerHandler;
  summaryCompanies: ProcessedCompany[];
  timelineWidth: number;
  yearTicks: Tick[];
  zoom: number;
};

type MobileTimelineExperienceProps = {
  boardView: BoardView;
  currentGlobalDay: number;
  draggedCompanyId: string | null;
  handleZoomChange: ZoomHandler;
  latestCompany: ProcessedCompany | null;
  hiddenCompanyCount: number;
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
  onShowHiddenCompanies: () => void;
  processedCompanies: ProcessedCompany[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  timelineWidth: number;
  yearTicks: Tick[];
  zoom: number;
};

function DesktopTimelineExperience({
  boardView,
  currentGlobalDay,
  draggedCompanyId,
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
  onCompanyDragEnd,
  onCompanyDragStart,
  onCompanyHide,
  onCompanyMove,
  onCompanyReorder,
  onShowHiddenCompanies,
  processedCompanies,
  scrollContainerRef,
  stopPanning,
  summaryCompanies,
  timelineWidth,
  yearTicks,
  zoom,
}: DesktopTimelineExperienceProps) {
  const timelineMinHeight = getTimelineMinHeight(processedCompanies);

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
                    ? 'Turn on one or more product lines to compose the timeline.'
                  : boardView.isComposite
                    ? `${boardView.label} puts selected product lines onto one shared timeline for full-field comparison.`
                  : `${boardView.label} is shown on the same absolute timeline, so newer product lines can be scanned without flattening every company into separate rows.`}
              </p>
            </div>

            <div className="border-l border-[var(--edge-strong)] pl-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Reading notes</p>
              <p className="mt-4 max-w-[42ch] text-sm leading-7 text-[var(--ink-soft)]">
                Zoom into dense stretches, drag the field to travel, and read the dashed extensions as time since each
                product line&apos;s latest release. Dates stay absolute, so concurrency and dry spells remain legible.
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

                {hiddenCompanyCount > 0 ? (
                  <SurfaceButton label="Show hidden companies" onClick={onShowHiddenCompanies}>
                    <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                    <span className="hidden sm:inline">Companies</span>
                  </SurfaceButton>
                ) : null}
              </div>
            </div>
          </div>

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
            >
              <div
                className={`relative ${isPanning ? 'transition-none' : 'transition-[min-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
                style={{minWidth: `${timelineWidth + LABEL_RAIL_WIDTH}px`}}
              >
                <div style={{paddingLeft: `${LABEL_RAIL_WIDTH}px`}}>
                  <div
                    className={`relative pb-14 ${isPanning ? 'transition-none' : 'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
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
                              company={company}
                              companyIndex={companyIndex}
                              currentGlobalDay={currentGlobalDay}
                              maxDays={maxDays}
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
  boardView,
  currentGlobalDay,
  draggedCompanyId,
  handleZoomChange,
  latestCompany,
  hiddenCompanyCount,
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
  onShowHiddenCompanies,
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
              AI model launches, arranged as one continuous race.
            </h1>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              {boardView.isDefault
                ? 'The default board stays focused on frontier company lines, with open-source, image, video, 3D, and coding lines kept in separate views.'
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
              {modelExplorer}
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
                className="relative transition-[min-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{minWidth: `${timelineWidth + MOBILE_LABEL_RAIL_WIDTH}px`}}
              >
                <div style={{paddingLeft: `${MOBILE_LABEL_RAIL_WIDTH}px`}}>
                  <div
                    className="relative pb-10 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
                              compact
                              company={company}
                              companyIndex={companyIndex}
                              currentGlobalDay={currentGlobalDay}
                              maxDays={maxDays}
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
  const [isReady, setIsReady] = useState(false);
  const [draggedCompanyId, setDraggedCompanyId] = useState<string | null>(null);
  const [hiddenCompanyIds, setHiddenCompanyIds] = useState<string[]>([]);
  const [companyOrderIds, setCompanyOrderIds] = useState<string[]>(() => companies.map((company) => company.id));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null);
  const desktopPointerOffsetXRef = useRef<number | null>(null);
  const hasPositionedInitialView = useRef(false);
  const hasPositionedInitialMobileView = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const latestDragPointRef = useRef<{
    clientX: number;
    clientY: number;
  } | null>(null);
  const panStateRef = useRef({
    hasPassedZoomDeadzone: false,
    lastX: 0,
    lastY: 0,
    startY: 0,
    zoomReferenceProgress: 0,
  });
  const [viewportWidths, setViewportWidths] = useState({desktop: 0, mobile: 0});

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

  const explorerProps = {
    boardView,
    isOpen: isExplorerOpen,
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
      hasPassedZoomDeadzone: false,
      lastX: event.clientX,
      lastY: event.clientY,
      startY: event.clientY,
      zoomReferenceProgress: getZoomProgress(zoom, desktopMinZoom, DESKTOP_MAX_ZOOM),
    };

    container.setPointerCapture(event.pointerId);
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
    let zoomDeltaY = latestDragPoint.clientY - panStateRef.current.lastY;

    if (!panStateRef.current.hasPassedZoomDeadzone) {
      const totalZoomDeltaY = latestDragPoint.clientY - panStateRef.current.startY;

      if (Math.abs(totalZoomDeltaY) <= DRAG_ZOOM_DEADZONE_PX) {
        zoomDeltaY = 0;
      } else {
        zoomDeltaY = Math.sign(totalZoomDeltaY) * (Math.abs(totalZoomDeltaY) - DRAG_ZOOM_DEADZONE_PX);
        panStateRef.current.hasPassedZoomDeadzone = true;
      }
    }

    if (!panStateRef.current.hasPassedZoomDeadzone) {
      zoomDeltaY = 0;
    }

    const currentGestureZoom = Number(
      getZoomFromProgress(panStateRef.current.zoomReferenceProgress, desktopMinZoom, DESKTOP_MAX_ZOOM).toFixed(3),
    );
    const nextZoom = Number(
      clampNumber(
        getZoomFromProgress(
          panStateRef.current.zoomReferenceProgress - zoomDeltaY * DRAG_ZOOM_PROGRESS_PER_PIXEL,
          desktopMinZoom,
          DESKTOP_MAX_ZOOM,
        ),
        desktopMinZoom,
        DESKTOP_MAX_ZOOM,
      ).toFixed(3),
    );

    // Horizontal panning correction.
    const targetScrollLeftBeforeZoom = container.scrollLeft - deltaX;
    container.scrollLeft = targetScrollLeftBeforeZoom;

    const currentTimelineWidth = Math.max(Math.round(baseTimelineWidth * currentGestureZoom), 1);
    const anchorRatio = getTimelineAnchorRatio(
      container.scrollLeft,
      pointerOffsetX,
      LABEL_RAIL_WIDTH,
      currentTimelineWidth,
    );
    const nextTimelineWidth = Math.max(Math.round(baseTimelineWidth * nextZoom), 1);

    if (nextZoom !== currentGestureZoom) {
      flushSync(() => setZoom(nextZoom));

      container.scrollLeft = getScrollLeftForTimelineAnchor(
        anchorRatio,
        pointerOffsetX,
        LABEL_RAIL_WIDTH,
        nextTimelineWidth,
      );

      panStateRef.current.zoomReferenceProgress = getZoomProgress(nextZoom, desktopMinZoom, DESKTOP_MAX_ZOOM);
    }

    panStateRef.current.lastX = latestDragPoint.clientX;
    panStateRef.current.lastY = latestDragPoint.clientY;
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

      <div className="relative z-10 md:hidden">
        <MobileTimelineExperience
          boardView={boardView}
          currentGlobalDay={currentGlobalDay}
          draggedCompanyId={draggedCompanyId}
          handleZoomChange={handleMobileZoomChange}
          hiddenCompanyCount={hiddenCompanyCount}
          latestCompany={latestCompany}
          minZoom={mobileMinZoom}
          maxZoom={MOBILE_MAX_ZOOM}
          maxDays={maxDays}
          maxSummaryQuietDays={maxSummaryQuietDays}
          modelExplorer={<ModelClassExplorer {...explorerProps} isOverlayEnabled={!isDesktopViewport} />}
          monthTicks={monthTicks}
          onCompanyDragEnd={() => setDraggedCompanyId(null)}
          onCompanyDragStart={setDraggedCompanyId}
          onCompanyHide={hideCompany}
          onCompanyMove={moveCompany}
          onCompanyReorder={reorderCompany}
          onShowHiddenCompanies={showHiddenCompanies}
          processedCompanies={timelineData.processedCompanies}
          scrollContainerRef={mobileScrollContainerRef}
          timelineWidth={mobileTimelineWidth}
          yearTicks={yearTicks}
          zoom={mobileZoom}
        />
      </div>

      <div className="relative z-10 hidden md:block">
        <DesktopTimelineExperience
          boardView={boardView}
          currentGlobalDay={currentGlobalDay}
          draggedCompanyId={draggedCompanyId}
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
          modelExplorer={<ModelClassExplorer {...explorerProps} isOverlayEnabled={isDesktopViewport} />}
          monthTicks={monthTicks}
          onCompanyDragEnd={() => setDraggedCompanyId(null)}
          onCompanyDragStart={setDraggedCompanyId}
          onCompanyHide={hideCompany}
          onCompanyMove={moveCompany}
          onCompanyReorder={reorderCompany}
          onShowHiddenCompanies={showHiddenCompanies}
          processedCompanies={timelineData.processedCompanies}
          scrollContainerRef={scrollContainerRef}
          stopPanning={stopPanning}
          summaryCompanies={summaryCompanies}
          timelineWidth={timelineWidth}
          yearTicks={yearTicks}
          zoom={zoom}
        />
      </div>
    </div>
  );
}
