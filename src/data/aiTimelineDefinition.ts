import type {TimelineDefinition, TimelineTag} from '@kvick-games/timeline-library';
import {modelReleaseIndexBySlug} from './releaseIndex';
import {publicAssetPath} from './publicAssets';
import {companies, modelPresets, timelineEventTypes} from './timeline';

export const aiTimelineDefinition = {
  articleIndexBySlug: modelReleaseIndexBySlug,
  attributeFilterIds: ['open-source'],
  contentTypeOptions: [
    {
      id: 'all',
      label: 'All',
      description: 'Show releases and milestone events inside the selected domains.',
    },
    {
      id: 'events',
      label: 'Events',
      description: 'Show demos, deployments, announcements, partnerships, livestreams, founding milestones, and launches.',
    },
    {
      id: 'releases',
      label: 'Releases',
      description: 'Show model, research, and coding-harness releases only.',
    },
  ],
  defaultClassId: 'frontier-llms',
  defaultDisplayLimit: 5,
  defaultEventTypeId: 'model-release',
  defaultFilterState: {
    attributeIds: [],
    companyIds: [],
    contentType: 'all',
    domainIds: ['llms'],
  },
  defaultSortMode: 'significance',
  displayLimits: [5, 10, 20, 'all'],
  eventTypes: timelineEventTypes,
  facets: modelPresets,
  filterGroups: [
    {
      label: 'Models',
      domainIds: ['llms'],
    },
    {
      label: 'Creative media',
      domainIds: ['image-generation', 'video-generation', 'audio-generation', '3d-generation'],
    },
    {
      label: 'World models',
      domainIds: ['world-models'],
    },
    {
      label: 'Coding tools',
      domainIds: ['coding-harnesses'],
    },
    {
      label: 'Embodied AI',
      domainIds: ['robotics', 'vehicle-autonomy'],
    },
  ],
  groups: companies,
  logoAssetPaths: {
    anthropic: publicAssetPath('logos/anthropic.svg'),
    cursor: publicAssetPath('logos/cursor.svg'),
    figure: publicAssetPath('logos/figure.svg'),
    google: publicAssetPath('logos/google.svg'),
    nvidia: publicAssetPath('logos/nvidia.svg'),
    openai: publicAssetPath('logos/openai.svg'),
    reactor: publicAssetPath('logos/reactor.svg'),
    tesla: publicAssetPath('logos/tesla.svg'),
    xai: publicAssetPath('logos/xai.svg'),
  },
  routeItemPathPrefix: 'models',
  scoring: {
    getEventTypeSignificanceBonus(eventTypeId: string) {
      switch (eventTypeId) {
        case 'model-release':
          return 5;
        case 'coding-harness-release':
          return 4;
        case 'product-launch':
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
    },
    getFacetSignificanceBase(facetId: string) {
      switch (facetId) {
        case 'llms':
          return 82;
        case 'open-source':
          return 78;
        case 'coding-harnesses':
          return 74;
        case 'world-models':
          return 70;
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
    },
    getGroupRankBonus(group) {
      return Math.max(0, 7 - (group.raceRank ?? 8));
    },
    getTagSignificanceBonus(tags: TimelineTag[]) {
      return (
        (tags.includes('ai-race-core') ? 10 : 0) +
        (tags.includes('major-release') ? 5 : 0) +
        (tags.includes('landmark-release') ? 8 : 0)
      );
    },
  },
  sortOptions: [
    {id: 'significance', label: 'AI significance'},
    {id: 'latest', label: 'Latest release'},
    {id: 'alphabetical', label: 'A–Z'},
  ],
  startDate: '1998-01-01',
  wideLogoMarks: ['figure'],
  copy: {
    allRelevantLabel: 'All relevant',
    articleBackLabel: 'Timeline',
    clearFiltersLabel: 'Clear',
    clearFiltersTitle: 'Clear filters',
    companyFilterEmpty: 'Select a domain to show company filters.',
    companyFiltersHeading: 'Companies',
    compositeBoardDescription: (label: string) =>
      `${label} puts selected product lines onto one shared timeline for full-field comparison.`,
    compositeBoardDescriptionMobile: (label: string) =>
      `${label} shows selected product lines together. Use zoom when the field gets dense.`,
    contentTypeHeading: 'Content type',
    defaultBoardDescription:
      'Explore important AI milestones across LLMs, open-source labs, generative media, audio, coding tools, events, robotics, vehicle autonomy, and the companies shaping them.',
    displayedRowsHeading: 'Displayed rows',
    emptyBoardDescription:
      'Add releases tagged to the selected product lines and the same timeline, summary cards, and recency markers will render here.',
    emptyBoardDetail: 'Turn on one or more product lines to compose the timeline.',
    emptyBoardLabel: 'No filters selected',
    emptyDataDetail:
      'The page has no company data to render. Add at least one provider with product lines and release dates before rendering the timeline.',
    emptyDataTitle: 'Timeline data is missing',
    filterPanelLabel: 'Filters',
    groupPluralLabel: 'companies',
    latestDesktopLabel: 'Latest company on the board',
    latestMobileLabel: 'Latest',
    latestUnavailable: 'n/a',
    primaryHeading: 'Mapping major AI progress across time',
    recencyHeading: 'Provider recency',
    resetCameraLabel: 'Reset camera',
    resetFiltersLabel: 'Reset',
    resetFiltersTitle: 'Reset filters and sort',
    routeMissingDetail: 'No timeline entry exists for {slug}.',
    routeMissingTitle: 'Model not found',
    selectAllLabel: 'All',
    selectAllTitle: 'Select all category filters',
    showHiddenLabel: 'Show hidden companies',
    significanceLabel: 'AI significance',
    singleBoardDescription: (label: string) =>
      `${label} is shown on the same absolute timeline, so newer product lines can be scanned without flattening every company into separate rows.`,
    singleBoardDescriptionMobile: (label: string) =>
      `${label} is isolated into its own board, keeping the release field readable on mobile.`,
    sortHeading: 'Sorting settings',
    statusEyebrow: 'Timeline status',
    timezoneLabel: 'All dates rendered in UTC',
    timelineGridHideLabel: 'Hide timeline grid',
    timelineGridShowLabel: 'Show timeline grid',
    timelineInteractionNoteDesktop:
      'Drag the field to pan the board like a canvas. Wheel or use the zoom rail to move the camera in and out.',
    timelineInteractionNoteMobile: 'Drag to pan the board. Pinch or use the zoom rail to move the camera.',
    timelineNotesHeading: 'Reading notes',
    timelineStatusDataErrorDetail: (invalidEntries: string[]) =>
      `Some releases could not be parsed as UTC dates: ${invalidEntries.join(', ')}`,
    timelineStatusDataErrorTitle: 'Timeline data needs cleanup',
    todayLabel: 'Today',
  },
} satisfies TimelineDefinition;
