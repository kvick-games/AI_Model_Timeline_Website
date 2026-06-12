import type {
  CompanyRecord,
  ModelClassId,
  PresetConfig,
  PresetId,
  ProductLineId,
  ProductLineRecord,
  ProductMarkerShape,
  ReleaseRecord,
  TimelineDatePrecision,
  TimelineEventTypeConfig,
  TimelineEventTypeId,
  TimelineTag,
} from './types';
import {companyProfilesById} from './companyProfiles';

export const DEFAULT_PRESET_ID: PresetId = 'llms';
export const DEFAULT_SELECTED_PRESET_IDS: PresetId[] = ['llms'];
export const DEFAULT_EVENT_TYPE_ID: TimelineEventTypeId = 'model-release';

export const timelineEventTypes: TimelineEventTypeConfig[] = [
  {
    id: 'founding',
    kind: 'event',
    label: 'Company founded',
    shortLabel: 'Founded',
    description: 'The founding or incorporation date for the company behind a tracked product line.',
  },
  {
    id: 'model-release',
    kind: 'release',
    label: 'Model release',
    shortLabel: 'Release',
    description: 'A named AI model, model family, or model generation release.',
  },
  {
    id: 'coding-harness-release',
    kind: 'release',
    label: 'Coding harness release',
    shortLabel: 'Harness',
    description: 'A named release of an agentic coding tool, IDE integration, terminal agent, or coding harness.',
  },
  {
    id: 'product-launch',
    kind: 'release',
    label: 'Product launch',
    shortLabel: 'Launch',
    description: 'A named product, platform, hardware generation, or major productized system launch.',
  },
  {
    id: 'research-release',
    kind: 'release',
    label: 'Research release',
    shortLabel: 'Research',
    description: 'A research model, paper, control stack, benchmark, or technical system release.',
  },
  {
    id: 'announcement',
    kind: 'event',
    label: 'Announcement',
    shortLabel: 'Announce',
    description: 'A public reveal or roadmap milestone without a shipped release artifact.',
  },
  {
    id: 'partnership',
    kind: 'event',
    label: 'Partnership',
    shortLabel: 'Partner',
    description: 'A strategic corporate partnership, deal, or infrastructure collaboration milestone.',
  },
  {
    id: 'public-demo',
    kind: 'event',
    label: 'Public demo',
    shortLabel: 'Demo',
    description: 'A public demonstration, prototype reveal, or event-stage capability demo.',
  },
  {
    id: 'deployment',
    kind: 'event',
    label: 'Deployment',
    shortLabel: 'Deploy',
    description: 'A real-world rollout, pilot, customer deployment, or operational use milestone.',
  },
  {
    id: 'livestream',
    kind: 'event',
    label: 'Livestream',
    shortLabel: 'Stream',
    description: 'A live public broadcast or long-running streamed demonstration.',
  },
];

export const timelineEventTypesById = timelineEventTypes.reduce<Record<TimelineEventTypeId, TimelineEventTypeConfig>>(
  (eventTypes, eventType) => {
    eventTypes[eventType.id] = eventType;
    return eventTypes;
  },
  {} as Record<TimelineEventTypeId, TimelineEventTypeConfig>,
);

export const modelPresets: PresetConfig[] = [
  {
    id: 'llms',
    classId: 'frontier-llms',
    label: 'LLMs',
    description: 'Foundation language and multimodal models across frontier and open-weight labs.',
  },
  {
    id: 'open-source',
    classId: 'open-source-llms',
    label: 'Open source',
    description: 'Open-weight models from open labs and major releases across language, audio, and creative generation.',
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
    id: 'audio-generation',
    classId: 'audio-generation',
    label: 'Audio Generation',
    description: 'Text-to-audio, music, sound-effect, and audio-editing model releases.',
  },
  {
    id: '3d-generation',
    classId: '3d-generation',
    label: '3D Generation',
    description: '3D asset and reconstruction models from specialized labs.',
  },
  {
    id: 'world-models',
    classId: 'world-models',
    label: 'World Models',
    description: 'Research systems that learn to simulate, predict, or interact with physical, virtual, and embodied environments.',
  },
  {
    id: 'coding-harnesses',
    classId: 'coding-harnesses',
    label: 'Coding Harnesses',
    description: 'Agentic coding tools, IDEs, and harnesses built on foundation models.',
  },
  {
    id: 'events',
    classId: 'events',
    label: 'Events',
    description: 'Conferences, livestreams, showcases, and other dated AI industry events.',
  },
  {
    id: 'robotics',
    classId: 'robotics',
    label: 'Robotics',
    description: 'Humanoid robots, embodied AI systems, and public robotics demonstrations.',
  },
  {
    id: 'vehicle-autonomy',
    classId: 'vehicle-autonomy',
    label: 'Vehicle Autonomy',
    description: 'FSD, robotaxi, and vehicle-platform milestones across autonomous mobility.',
  },
];

export const filterPresetGroups: {label: string; presetIds: PresetId[]}[] = [
  {
    label: 'Models & labs',
    presetIds: ['llms', 'open-source'],
  },
  {
    label: 'Creative media',
    presetIds: ['image-generation', 'video-generation', 'audio-generation', '3d-generation'],
  },
  {
    label: 'World models',
    presetIds: ['world-models'],
  },
  {
    label: 'Coding tools',
    presetIds: ['coding-harnesses'],
  },
  {
    label: 'Events',
    presetIds: ['events'],
  },
  {
    label: 'Embodied AI',
    presetIds: ['robotics', 'vehicle-autonomy'],
  },
];

/** @deprecated Use filterPresetGroups */
export const presetGroups = filterPresetGroups;

function getDefaultMarkerShape(classId: ModelClassId): ProductMarkerShape {
  if (classId === 'coding-harnesses') {
    return 'square';
  }

  if (classId === 'events') {
    return 'square';
  }

  if (classId === 'video-generation') {
    return 'diamond';
  }

  if (classId === 'audio-generation') {
    return 'diamond';
  }

  if (classId === 'world-models') {
    return 'diamond';
  }

  if (classId === 'robotics') {
    return 'diamond';
  }

  if (classId === 'vehicle-autonomy') {
    return 'square';
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

function defineCompanyHistoryLine({
  foundedDate,
  datePrecision = 'day',
  name = 'Founded',
}: {
  foundedDate: string;
  datePrecision?: TimelineDatePrecision;
  name?: string;
}): ProductLineRecord {
  return defineProductLine({
    id: 'company-history',
    label: 'Company history',
    shortLabel: 'Founded',
    classId: 'events',
    defaultPresets: ['events'],
    markerShape: 'square',
    releases: [
      {
        name,
        date: foundedDate,
        datePrecision,
        eventType: 'founding',
      },
    ],
  });
}

function defineCompany({
  profileId,
  productLines,
}: {
  profileId: string;
  productLines: ProductLineRecord[];
}): CompanyRecord {
  const firstLine = productLines[0];
  const profile = companyProfilesById[profileId];

  if (!profile) {
    throw new Error(`Missing company profile for ${profileId}`);
  }

  return {
    ...profile,
    defaultClasses: firstLine?.defaultClasses ?? ['frontier-llms'],
    defaultPresets: firstLine?.defaultPresets ?? [DEFAULT_PRESET_ID],
    productLines,
  };
}

export function createReleaseSlug(companyId: string, productLineId: string, releaseName: string, date: string) {
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  return `${slugify(companyId)}-${slugify(productLineId)}-${slugify(releaseName)}-${date}`;
}

export function parseTimelineDate(input: string) {
  return new Date(`${input}T00:00:00Z`);
}

export function formatTimelineDate(
  input: string | Date,
  options: Intl.DateTimeFormatOptions = {month: 'short', day: 'numeric', year: 'numeric'},
  precision: TimelineDatePrecision = 'day',
) {
  const parsedDate = typeof input === 'string' ? parseTimelineDate(input) : input;

  if (Number.isNaN(parsedDate.getTime())) {
    return typeof input === 'string' ? input : 'Date unavailable';
  }

  if (precision === 'year') {
    return parsedDate.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
    });
  }

  if (precision === 'month') {
    return parsedDate.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      year: 'numeric',
    });
  }

  return parsedDate.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    ...options,
  });
}

export function formatTimelineDateRange(
  startDate: string,
  endDate?: string,
  startPrecision: TimelineDatePrecision = 'day',
  endPrecision: TimelineDatePrecision = 'day',
) {
  if (!endDate || endDate === startDate) {
    return formatTimelineDate(startDate, undefined, startPrecision);
  }

  const start = parseTimelineDate(startDate);
  const end = parseTimelineDate(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startDate} - ${endDate}`;
  }

  if (end.getTime() < start.getTime()) {
    return `${formatTimelineDate(startDate, undefined, startPrecision)} - ${formatTimelineDate(endDate, undefined, endPrecision)}`;
  }

  if (startPrecision !== 'day' || endPrecision !== 'day') {
    return `${formatTimelineDate(start, undefined, startPrecision)} - ${formatTimelineDate(end, undefined, endPrecision)}`;
  }

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    return `${formatTimelineDate(start, {month: 'short', day: 'numeric'})}-${formatTimelineDate(end, {day: 'numeric'})}, ${end.getUTCFullYear()}`;
  }

  if (sameYear) {
    return `${formatTimelineDate(start, {month: 'short', day: 'numeric'})} - ${formatTimelineDate(end, {month: 'short', day: 'numeric', year: 'numeric'})}`;
  }

  return `${formatTimelineDate(start)} - ${formatTimelineDate(end)}`;
}

export function getReleaseSlug(companyId: string, productLineId: string, release: ReleaseRecord) {
  return release.articleSlug ?? createReleaseSlug(companyId, productLineId, release.name, release.date);
}

export function getReleaseEventType(release: ReleaseRecord) {
  return timelineEventTypesById[release.eventType ?? DEFAULT_EVENT_TYPE_ID];
}

export function getProductLineClasses(company: CompanyRecord, productLine: ProductLineRecord): ModelClassId[] {
  return productLine.defaultClasses ?? company.defaultClasses ?? [productLine.classId];
}

export function getProductLinePresets(company: CompanyRecord, productLine: ProductLineRecord): PresetId[] {
  return productLine.defaultPresets ?? company.defaultPresets;
}

export function getReleaseClasses(
  company: CompanyRecord,
  productLine: ProductLineRecord,
  release: ReleaseRecord,
): ModelClassId[] {
  return release.classes ?? getProductLineClasses(company, productLine);
}

export function getReleasePresets(
  company: CompanyRecord,
  productLine: ProductLineRecord,
  release: ReleaseRecord,
): PresetId[] {
  return release.presets ?? getProductLinePresets(company, productLine);
}

export function getProductLineTags(productLine: ProductLineRecord): TimelineTag[] {
  return productLine.defaultTags ?? [];
}

export function getReleaseTags(
  company: CompanyRecord,
  productLine: ProductLineRecord,
  release: ReleaseRecord,
): TimelineTag[] {
  return release.tags ?? getProductLineTags(productLine);
}

export const companies: CompanyRecord[] = [
  defineCompany({
    profileId: 'openai',
    productLines: [
      defineCompanyHistoryLine({
        foundedDate: '2015-12-11',
        name: 'OpenAI founded',
      }),
      defineProductLine({
        id: 'openai-gpt',
        label: 'GPT models',
        shortLabel: 'GPT',
        classId: 'frontier-llms',
        defaultPresets: ['llms'],
        releases: [
          {name: 'GPT-3.5', date: '2022-11-30', tags: ['landmark-release']},
          {name: 'GPT-4', date: '2023-03-14', tags: ['landmark-release']},
          {name: 'GPT-4 Turbo', date: '2023-11-06'},
          {name: 'GPT-4o', date: '2024-05-13', articleSlug: 'gpt-4o', tags: ['ai-race-core', 'landmark-release']},
          {name: 'GPT-4o mini', date: '2024-07-18', tags: ['major-release']},
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
          {name: 'DALL-E 2', date: '2022-09-28', tags: ['landmark-release']},
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
        defaultClasses: ['video-generation'],
        defaultPresets: ['video-generation'],
        releases: [
          {name: 'Sora Preview', date: '2024-02-15', articleSlug: 'sora-preview', tags: ['landmark-release']},
          {name: 'Sora Turbo', date: '2024-12-09'},
          {name: 'Sora 2 / Sora 2 Pro', date: '2025-09-30', tags: ['major-release']},
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
          {name: 'Codex Preview', date: '2025-05-16', eventType: 'coding-harness-release'},
          {name: 'GPT-5-Codex', date: '2025-09-15', eventType: 'coding-harness-release'},
          {name: 'Codex GA', date: '2025-10-06', eventType: 'coding-harness-release'},
          {name: 'GPT-5.2-Codex', date: '2025-12-18', eventType: 'coding-harness-release'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'anthropic',
    productLines: [
      defineCompanyHistoryLine({
        foundedDate: '2021-01-01',
        datePrecision: 'year',
        name: 'Anthropic founded',
      }),
      defineProductLine({
        id: 'anthropic-claude',
        label: 'Claude models',
        shortLabel: 'Claude',
        classId: 'frontier-llms',
        defaultPresets: ['llms'],
        releases: [
          {name: 'Claude 1', date: '2023-03-14'},
          {name: 'Claude 2', date: '2023-07-11'},
          {name: 'Claude 3', date: '2024-03-04'},
          {name: 'Claude 3.5', date: '2024-06-20', articleSlug: 'claude-3-5', tags: ['ai-race-core', 'landmark-release']},
          {name: 'Claude 3.7', date: '2025-02-24'},
          {name: 'Claude 4', date: '2025-05-22'},
          {name: 'Claude 4.5 Sonnet', date: '2025-09-29'},
          {name: 'Claude Opus 4.5', date: '2025-11-24', tags: ['landmark-release']},
          {name: 'Claude 4.6 Sonnet', date: '2026-02-17'},
          {name: 'Claude 4.6 Opus', date: '2026-02-05'},
          {name: 'Claude 4.7 Opus', date: '2026-04-16'},
          {name: 'Claude 4.8 Opus', date: '2026-05-28', articleSlug: 'claude-opus-4-8'},
          {name: 'Claude Fable 5', date: '2026-06-09', articleSlug: 'claude-fable-5', tags: ['ai-race-core', 'landmark-release']},
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
          {name: 'Claude Code Preview', date: '2025-02-24', eventType: 'coding-harness-release'},
          {
            name: 'Claude Code GA',
            date: '2025-05-22',
            eventType: 'coding-harness-release',
            articleSlug: 'claude-code-ga',
          },
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'google',
    productLines: [
      defineCompanyHistoryLine({
        foundedDate: '1998-09-04',
        name: 'Google incorporated',
      }),
      defineProductLine({
        id: 'google-gemini',
        label: 'Gemini models',
        shortLabel: 'Gemini',
        classId: 'frontier-llms',
        defaultPresets: ['llms'],
        releases: [
          {name: 'Gemini 1.0', date: '2023-12-06'},
          {name: 'Gemini 1.5', date: '2024-02-15'},
          {name: 'Gemini 2.0', date: '2025-02-05'},
          {name: 'Gemini 2.5', date: '2025-03-25', articleSlug: 'gemini-2-5', tags: ['ai-race-core', 'landmark-release']},
          {name: 'Gemini 3.0 Pro', date: '2025-11-18'},
          {name: 'Gemini 3.1 Pro (Preview)', date: '2026-02-19'},
          {
            name: 'Gemini 3.1 Flash Image (Nano Banana 2)',
            date: '2026-02-26',
            classes: ['frontier-llms', 'image-generation'],
            presets: ['llms', 'image-generation'],
          },
          {name: 'Gemini 3.1 Flash-Lite', date: '2026-03-03'},
          {name: 'Gemini 3.5 Flash', date: '2026-05-19', articleSlug: 'gemini-3-5-flash', tags: ['ai-race-core']},
          {name: 'Gemini Omni', date: '2026-05-19', eventType: 'model-release', articleSlug: 'gemini-omni-flash'},
        ],
      }),
      defineProductLine({
        id: 'google-events',
        label: 'Google events',
        shortLabel: 'Events',
        classId: 'events',
        defaultPresets: ['events'],
        markerShape: 'square',
        releases: [
          {name: 'Google I/O 2026', date: '2026-05-19', eventType: 'livestream', articleSlug: 'google-io-2026'},
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
          {name: 'Veo 3', date: '2025-05-20', tags: ['landmark-release']},
          {name: 'Veo 3.1', date: '2025-10-15'},
        ],
      }),
      defineProductLine({
        id: 'google-omni',
        label: 'Gemini Omni',
        shortLabel: 'Omni',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
          {
            name: 'Gemini Omni',
            date: '2026-05-19',
            eventType: 'model-release',
            articleSlug: 'gemini-omni-flash',
          },
        ],
      }),
      defineProductLine({
        id: 'google-world-models',
        label: 'DeepMind world models',
        shortLabel: 'Worlds',
        classId: 'world-models',
        defaultPresets: ['world-models'],
        releases: [
          {name: 'PlaNet', date: '2018-11-12', eventType: 'research-release'},
          {name: 'Dreamer', date: '2019-12-03', eventType: 'research-release'},
          {name: 'DreamerV2', date: '2020-10-05', eventType: 'research-release', tags: ['major-release']},
          {name: 'DreamerV3', date: '2023-01-10', eventType: 'research-release', tags: ['major-release']},
          {name: 'Genie', date: '2024-02-23', eventType: 'research-release', tags: ['landmark-release']},
          {name: 'Genie 2', date: '2024-12-04', eventType: 'research-release', tags: ['major-release']},
          {name: 'Genie 3', date: '2025-08-05', eventType: 'research-release', tags: ['landmark-release']},
          {name: 'Project Genie', date: '2026-01-29', eventType: 'public-demo'},
          {name: 'Project Genie + Street View', date: '2026-05-19', eventType: 'deployment'},
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
          {name: 'Antigravity IDE', date: '2025-11-20', eventType: 'coding-harness-release'},
          {name: 'Antigravity 2.0', date: '2026-05-19', eventType: 'product-launch', articleSlug: 'antigravity-2-0'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'xai',
    productLines: [
      defineProductLine({
        id: 'xai-grok',
        label: 'Grok models',
        shortLabel: 'Grok',
        classId: 'frontier-llms',
        defaultPresets: ['llms'],
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
          {name: 'Grok Build (Beta)', date: '2026-05-14', eventType: 'coding-harness-release'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'tesla',
    productLines: [
      defineCompanyHistoryLine({
        foundedDate: '2003-07-01',
        name: 'Tesla incorporated',
      }),
      defineProductLine({
        id: 'tesla-optimus',
        label: 'Optimus',
        shortLabel: 'Optimus',
        classId: 'robotics',
        defaultPresets: ['robotics'],
        releases: [
          {name: 'Tesla Bot announced', date: '2021-08-19', eventType: 'announcement'},
          {name: 'Optimus prototype', date: '2022-09-30', eventType: 'public-demo'},
          {name: 'Optimus Gen 2', date: '2023-12-12', eventType: 'public-demo'},
          {name: 'We, Robot demos', date: '2024-10-10', eventType: 'public-demo'},
        ],
      }),
      defineProductLine({
        id: 'tesla-fsd-vehicles',
        label: 'FSD & vehicles',
        shortLabel: 'FSD',
        classId: 'vehicle-autonomy',
        defaultPresets: ['vehicle-autonomy'],
        releases: [
          {name: 'FSD Beta v9', date: '2021-07-10', eventType: 'deployment'},
          {name: 'FSD Beta v10', date: '2021-09-11', eventType: 'deployment'},
          {name: 'FSD Beta wide release', date: '2022-11-24', eventType: 'deployment'},
          {name: 'FSD Beta v11.3.1', date: '2023-03-07', eventType: 'deployment'},
          {name: 'Model 3 refresh', date: '2023-09-01', eventType: 'product-launch'},
          {name: 'Cybertruck deliveries', date: '2023-11-30', eventType: 'product-launch'},
          {name: 'FSD Beta v12.1.2', date: '2024-01-21', eventType: 'deployment'},
          {name: 'Cybercab unveiled', date: '2024-10-10', eventType: 'announcement'},
          {name: 'FSD Supervised v13.2', date: '2024-11-30', eventType: 'deployment'},
          {name: 'New Model Y', date: '2025-04-01', eventType: 'product-launch'},
          {name: 'Robotaxi Austin launch', date: '2025-06-22', eventType: 'deployment'},
          {name: 'FSD Supervised v14.1', date: '2025-10-07', eventType: 'deployment'},
          {name: 'First Cybercab off Giga Texas line', date: '2026-02-17', eventType: 'product-launch'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'waymo',
    productLines: [
      defineProductLine({
        id: 'waymo-driver',
        label: 'Waymo Driver',
        shortLabel: 'Waymo',
        classId: 'vehicle-autonomy',
        defaultPresets: ['vehicle-autonomy'],
        releases: [
          {
            name: 'Google self-driving car project starts',
            date: '2009-01-01',
            datePrecision: 'year',
            eventType: 'research-release',
          },
          {name: 'Firefly driverless public-road ride', date: '2015-10-20', eventType: 'public-demo'},
          {name: 'Waymo launches as Alphabet company', date: '2016-12-13', eventType: 'founding'},
          {name: 'Phoenix Early Rider program opens', date: '2017-04-24', eventType: 'deployment'},
          {name: 'Waymo One commercial service', date: '2018-12-05', eventType: 'product-launch'},
          {name: 'Phoenix fully driverless public rides', date: '2020-10-08', eventType: 'deployment'},
          {name: 'San Francisco paid driverless permit', date: '2023-08-11', eventType: 'deployment'},
          {name: 'Waymo One opens to all in Los Angeles', date: '2024-11-12', eventType: 'deployment'},
          {name: 'Waymo launches on Uber in Austin', date: '2025-03-04', eventType: 'deployment'},
          {name: 'Sixth-generation Waymo Driver operations', date: '2026-02-12', eventType: 'deployment'},
        ],
      }),
      defineProductLine({
        id: 'waymo-world-models',
        label: 'Driving world models',
        shortLabel: 'Worlds',
        classId: 'world-models',
        defaultPresets: ['world-models'],
        releases: [
          {name: 'Waymo World Model', date: '2026-02-06', eventType: 'research-release', tags: ['major-release']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'wayve',
    productLines: [
      defineProductLine({
        id: 'wayve-world-models',
        label: 'Driving world models',
        shortLabel: 'GAIA',
        classId: 'world-models',
        defaultPresets: ['world-models'],
        releases: [
          {name: 'GAIA-1', date: '2023-06-17', eventType: 'research-release', tags: ['major-release']},
          {name: 'GAIA-1 technical report', date: '2023-09-29', eventType: 'research-release'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'zoox',
    productLines: [
      defineProductLine({
        id: 'zoox-driver',
        label: 'Zoox robotaxi',
        shortLabel: 'Zoox',
        classId: 'vehicle-autonomy',
        defaultPresets: ['vehicle-autonomy'],
        releases: [
          {name: 'Zoox founded', date: '2014-01-01', datePrecision: 'year', eventType: 'founding'},
          {name: 'Amazon acquires Zoox', date: '2020-06-26', eventType: 'partnership'},
          {name: 'Zoox robotaxi revealed', date: '2020-12-14', eventType: 'product-launch'},
          {name: 'First public-road employee shuttle', date: '2023-02-11', eventType: 'public-demo'},
          {name: 'Las Vegas robotaxi service launches', date: '2025-09-10', eventType: 'deployment'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'figure',
    productLines: [
      defineCompanyHistoryLine({
        foundedDate: '2022-05-20',
        name: 'Figure founded',
      }),
      defineProductLine({
        id: 'figure-humanoids',
        label: 'Figure humanoids',
        shortLabel: 'Figure',
        classId: 'robotics',
        defaultPresets: ['robotics'],
        releases: [
          {name: 'Figure 01 walks', date: '2023-10-17', eventType: 'public-demo'},
          {name: 'Figure 02', date: '2024-08-06', eventType: 'product-launch'},
          {name: 'Helix', date: '2025-02-20', eventType: 'research-release'},
          {name: 'Figure 03', date: '2025-10-09', eventType: 'product-launch'},
          {
            name: 'F.03 livestream',
            date: '2026-05-13',
            endDate: '2026-05-17',
            eventType: 'livestream',
            articleSlug: 'figure-f03-livestream',
          },
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'cursor',
    productLines: [
      defineCompanyHistoryLine({
        foundedDate: '2022-01-01',
        datePrecision: 'year',
        name: 'Anysphere founded',
      }),
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
          {name: 'Cursor 2.0', date: '2025-10-29'},
          {name: 'Cursor 3.0', date: '2026-04-02'},
        ],
      }),
      defineProductLine({
        id: 'cursor-composer',
        label: 'Composer models',
        shortLabel: 'Composer',
        classId: 'coding-harnesses',
        defaultPresets: ['coding-harnesses'],
        markerShape: 'square',
        releases: [
          {name: 'Composer 1', date: '2025-10-29', articleSlug: 'composer-1', tags: ['major-release']},
          {name: 'Composer 1.5', date: '2026-02-09', articleSlug: 'composer-1-5', tags: ['major-release']},
          {name: 'Composer 2', date: '2026-03-19', articleSlug: 'composer-2', tags: ['ai-race-core']},
          {name: 'Composer 2.5', date: '2026-05-18', articleSlug: 'composer-2-5', tags: ['ai-race-core']},
        ],
      }),
      defineProductLine({
        id: 'cursor-events',
        label: 'Cursor events',
        shortLabel: 'Events',
        classId: 'events',
        defaultPresets: ['events'],
        markerShape: 'square',
        releases: [
          {
            name: 'SpaceXAI partnership',
            date: '2026-04-21',
            eventType: 'partnership',
            articleSlug: 'cursor-spacex-partnership',
            tags: ['ai-race-core'],
          },
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'deepseek',
    productLines: [
      defineProductLine({
        id: 'deepseek-models',
        label: 'DeepSeek models',
        shortLabel: 'DeepSeek',
        classId: 'open-source-llms',
        defaultPresets: ['llms', 'open-source'],
        releases: [
          {name: 'DeepSeek-V2', date: '2024-05-06'},
          {name: 'DeepSeek-V2.5', date: '2024-09-05'},
          {name: 'DeepSeek-V3', date: '2024-12-26'},
          {name: 'DeepSeek-R1', date: '2025-01-20', articleSlug: 'deepseek-r1', tags: ['ai-race-core', 'landmark-release']},
          {name: 'DeepSeek-R1-0528', date: '2025-05-28'},
          {name: 'DeepSeek-V3.1', date: '2025-08-21'},
          {name: 'DeepSeek-V4-Flash', date: '2026-04-24', articleSlug: 'deepseek-v4-flash', tags: ['major-release']},
          {name: 'DeepSeek-V4-Pro', date: '2026-04-24', articleSlug: 'deepseek-v4-pro', tags: ['ai-race-core']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'qwen',
    productLines: [
      defineProductLine({
        id: 'qwen-models',
        label: 'Qwen models',
        shortLabel: 'Qwen',
        classId: 'open-source-llms',
        defaultPresets: ['llms', 'open-source'],
        releases: [
          {name: 'Qwen2', date: '2024-06-07'},
          {name: 'Qwen2.5', date: '2024-09-19'},
          {name: 'Qwen2.5-VL', date: '2025-01-28'},
          {name: 'Qwen3', date: '2025-04-29'},
          {name: 'Qwen3-Coder', date: '2025-07-29'},
          {name: 'Qwen3.6-35B-A3B', date: '2026-04-17'},
        ],
      }),
      defineProductLine({
        id: 'wan-video',
        label: 'Wan video',
        shortLabel: 'Wan',
        classId: 'video-generation',
        defaultPresets: ['open-source', 'video-generation'],
        releases: [
          {name: 'Wan2.1', date: '2025-02-25'},
          {name: 'Wan2.1-FLF2V', date: '2025-04-17'},
          {name: 'Wan2.1-VACE', date: '2025-05-14'},
          {name: 'Wan2.2', date: '2025-07-28'},
          {name: 'Wan2.2-S2V', date: '2025-08-26'},
          {name: 'Wan2.2-Animate', date: '2025-09-19'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'moonshot-kimi',
    productLines: [
      defineProductLine({
        id: 'kimi-models',
        label: 'Kimi models',
        shortLabel: 'Kimi',
        classId: 'open-source-llms',
        defaultPresets: ['llms', 'open-source'],
        releases: [
          {name: 'Kimi Chat', date: '2023-10-09'},
          {name: 'Kimi k1.5', date: '2025-01-20'},
          {name: 'Kimi K2', date: '2025-07-11'},
          {
            name: 'Kimi K2.7 Code',
            date: '2026-06-12',
            articleSlug: 'kimi-k2-7-code',
            tags: ['ai-race-core', 'major-release', 'open-weight'],
          },
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'zhipu-glm',
    productLines: [
      defineProductLine({
        id: 'glm-models',
        label: 'GLM models',
        shortLabel: 'GLM',
        classId: 'open-source-llms',
        defaultPresets: ['llms', 'open-source'],
        releases: [
          {name: 'GLM-4', date: '2024-01-16'},
          {name: 'GLM-4-9B', date: '2024-06-05'},
          {name: 'GLM-4.5', date: '2025-07-28'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'mistral-ai',
    productLines: [
      defineProductLine({
        id: 'mistral-models',
        label: 'Mistral models',
        shortLabel: 'Mistral',
        classId: 'open-source-llms',
        defaultPresets: ['llms', 'open-source'],
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
    profileId: 'midjourney',
    productLines: [
      defineProductLine({
        id: 'midjourney-image',
        label: 'Image models',
        shortLabel: 'Image',
        classId: 'image-generation',
        defaultPresets: ['image-generation'],
        releases: [
          {name: 'Midjourney V5', date: '2023-03-15', tags: ['landmark-release']},
          {name: 'Midjourney V6', date: '2023-12-20'},
          {name: 'Midjourney V6.1', date: '2024-07-30'},
          {name: 'Midjourney V7', date: '2025-04-03'},
          {name: 'Niji 7', date: '2026-01-09'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'stability-ai',
    productLines: [
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
        id: 'stability-audio',
        label: 'Audio models',
        shortLabel: 'Audio',
        classId: 'audio-generation',
        defaultPresets: ['open-source', 'audio-generation'],
        releases: [
          {name: 'Stable Audio 3.0', date: '2026-05-20', tags: ['major-release']},
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
    profileId: 'black-forest-labs',
    productLines: [
      defineProductLine({
        id: 'flux-image',
        label: 'Stable Diffusion / FLUX models',
        shortLabel: 'SD / FLUX',
        classId: 'image-generation',
        defaultPresets: ['image-generation'],
        releases: [
          {name: 'Stable Diffusion 1.0', date: '2022-08-22', tags: ['landmark-release']},
          {name: 'Stable Diffusion 2.0', date: '2022-11-24'},
          {name: 'SDXL 1.0', date: '2023-07-26'},
          {name: 'Stable Diffusion 3 Medium', date: '2024-06-12'},
          {name: 'FLUX.1', date: '2024-08-01', tags: ['landmark-release']},
          {name: 'Stable Diffusion 3.5', date: '2024-10-22'},
          {name: 'FLUX.1 Tools', date: '2024-11-21'},
          {name: 'FLUX.1 Kontext', date: '2025-05-29'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'runway-video',
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
      defineProductLine({
        id: 'runway-world-models',
        label: 'General world models',
        shortLabel: 'GWM',
        classId: 'world-models',
        defaultPresets: ['world-models'],
        releases: [
          {name: 'General World Models research', date: '2023-12-11', eventType: 'announcement'},
          {name: 'Runway Game Worlds', date: '2025-08-21', eventType: 'public-demo'},
          {name: 'GWM-1', date: '2025-12-11', eventType: 'research-release', tags: ['major-release']},
          {name: 'GWM-Robotics evaluation', date: '2026-02-27', eventType: 'research-release'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'luma-ai',
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
    profileId: 'pika-labs',
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
    profileId: 'lightricks',
    productLines: [
      defineProductLine({
        id: 'ltx-video',
        label: 'LTX video',
        shortLabel: 'LTX',
        classId: 'video-generation',
        defaultPresets: ['open-source', 'video-generation'],
        releases: [
          {name: 'LTX-Video v0.9.0', date: '2024-11-21'},
          {name: 'LTX-Video v0.9.1', date: '2024-12-20'},
          {name: 'LTX-Video v0.9.5', date: '2025-03-05'},
          {name: 'LTXV v0.9.6', date: '2025-04-15'},
          {name: 'LTXV-13B v0.9.7', date: '2025-05-05'},
          {name: 'LTXV-13B distilled v0.9.7', date: '2025-05-14'},
          {name: 'LTXV IC-LoRA controls', date: '2025-07-08'},
          {name: 'LTXV v0.9.8', date: '2025-07-16'},
          {name: 'LTX-2 announced', date: '2025-10-23', eventType: 'announcement'},
          {name: 'LTX-2 open weights', date: '2026-01-03'},
          {name: 'LTX-2.3', date: '2026-03-04', articleSlug: 'ltx-2-3'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'ideogram',
    productLines: [
      defineProductLine({
        id: 'ideogram-image',
        label: 'Image models',
        shortLabel: 'Image',
        classId: 'image-generation',
        defaultPresets: ['image-generation'],
        releases: [
          {name: 'Ideogram 0.1', date: '2023-08-29'},
          {name: 'Ideogram 1.0', date: '2024-02-28'},
          {name: 'Ideogram 2.0', date: '2024-08-21'},
          {name: 'Ideogram 2a', date: '2025-02-27'},
          {name: 'Ideogram 3.0', date: '2025-03-26'},
          {
            name: 'Ideogram 4.0',
            date: '2026-06-03',
            articleSlug: 'ideogram-4-open-weight',
            presets: ['image-generation', 'open-source'],
            tags: ['major-release', 'open-weight'],
          },
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'reve',
    productLines: [
      defineProductLine({
        id: 'reve-image',
        label: 'Image models',
        shortLabel: 'Image',
        classId: 'image-generation',
        defaultPresets: ['image-generation'],
        releases: [
          {name: 'Reve 2.0', date: '2026-06-03', articleSlug: 'reve-2-0', tags: ['major-release']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'world-models-research',
    productLines: [
      defineProductLine({
        id: 'world-models-foundations',
        label: 'Foundational papers',
        shortLabel: 'Papers',
        classId: 'world-models',
        defaultPresets: ['world-models'],
        releases: [
          {name: 'World Models', date: '2018-03-27', eventType: 'research-release', tags: ['landmark-release']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'decart',
    productLines: [
      defineProductLine({
        id: 'decart-world-models',
        label: 'Interactive world models',
        shortLabel: 'Oasis',
        classId: 'world-models',
        defaultPresets: ['world-models', 'open-source'],
        releases: [
          {name: 'Oasis', date: '2024-10-31', eventType: 'research-release', tags: ['major-release', 'open-weight']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'world-labs',
    productLines: [
      defineProductLine({
        id: 'worldlabs-world-models',
        label: 'Spatial world models',
        shortLabel: 'Marble',
        classId: 'world-models',
        defaultPresets: ['world-models'],
        releases: [
          {name: 'Marble beta', date: '2025-09-16', eventType: 'public-demo', tags: ['major-release']},
          {name: 'RTFM', date: '2025-10-16', eventType: 'research-release', tags: ['major-release']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'reactor',
    productLines: [
      defineProductLine({
        id: 'reactor-world-models',
        label: 'Real-time world-model platform',
        shortLabel: 'Reactor',
        classId: 'world-models',
        defaultPresets: ['world-models'],
        releases: [
          {
            name: 'Reactor platform',
            date: '2026-05-28',
            eventType: 'product-launch',
            articleSlug: 'reactor-real-time-world-model-platform',
            tags: ['major-release'],
          },
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'meta-ai',
    productLines: [
      defineProductLine({
        id: 'meta-jepa-world-models',
        label: 'JEPA world models',
        shortLabel: 'V-JEPA',
        classId: 'world-models',
        defaultPresets: ['world-models', 'open-source'],
        releases: [
          {name: 'V-JEPA', date: '2024-02-15', eventType: 'research-release'},
          {name: 'V-JEPA 2', date: '2025-06-11', eventType: 'research-release', tags: ['major-release', 'open-weight']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'nvidia',
    productLines: [
      defineProductLine({
        id: 'nvidia-cosmos',
        label: 'Cosmos world foundation models',
        shortLabel: 'Cosmos',
        classId: 'world-models',
        defaultPresets: ['world-models', 'open-source'],
        releases: [
          {name: 'Cosmos WFMs', date: '2025-01-06', eventType: 'research-release', tags: ['major-release', 'open-weight']},
          {name: 'Cosmos 3', date: '2026-06-01', eventType: 'research-release', tags: ['major-release', 'open-weight']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'kuaishou-kling',
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
    profileId: 'bytedance-seedance',
    productLines: [
      defineProductLine({
        id: 'seedance-video',
        label: 'Seedance video',
        shortLabel: 'Seedance',
        classId: 'video-generation',
        defaultPresets: ['video-generation'],
        releases: [
          {name: 'Seedance 1.0', date: '2025-06-11'},
          {name: 'Seedance 1.5 Pro', date: '2025-12-16'},
          {name: 'Seedance 2.0', date: '2026-02-12', articleSlug: 'seedance-2-0', tags: ['major-release', 'landmark-release']},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'tencent-hunyuan-3d',
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
      defineProductLine({
        id: 'hunyuan-video',
        label: 'Hunyuan video',
        shortLabel: 'Hunyuan',
        classId: 'video-generation',
        defaultPresets: ['open-source', 'video-generation'],
        releases: [
          {name: 'HunyuanVideo', date: '2024-12-03'},
          {name: 'HunyuanVideo-I2V', date: '2025-03-06'},
          {name: 'HunyuanCustom', date: '2025-05-09'},
          {name: 'HunyuanVideo-Avatar', date: '2025-05-28'},
          {name: 'HunyuanVideo-1.5', date: '2025-11-20'},
        ],
      }),
    ],
  }),
  defineCompany({
    profileId: 'tripo-ai',
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
