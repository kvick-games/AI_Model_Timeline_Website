import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'reactor-real-time-world-model-platform',
  release: {
    companyId: 'reactor',
    productLineId: 'reactor-world-models',
    name: 'Reactor platform',
    date: '2026-05-28',
  },
  logo: {
    modelLabel: 'Reactor platform',
    modelMark: 'generic',
  },
  eyebrow: 'World-model infrastructure',
  title: 'Reactor launched a real-time platform layer for interactive world models',
  dek: 'Reactor emerged from stealth as a developer platform for real-time generative video, positioning itself as infrastructure for interactive world-model applications rather than as a standalone model release.',
  summary:
    'Reactor is tracked as a world-model platform milestone because its launch focuses on making real-time generative video and interactive AI worlds usable through SDK and API infrastructure. The timeline treats it as a productized infrastructure layer, not as a new research model.',
  impact:
    'The launch is notable because world models are beginning to move from demos and papers into production surfaces. Reactor is explicitly targeting the latency, orchestration, and serving layer needed for responsive interactive media, physical AI, and robotics workflows.',
  facts: [
    {label: 'Provider', value: 'Reactor'},
    {label: 'Launch date', value: 'May 28, 2026'},
    {label: 'Category', value: 'World-model infrastructure'},
    {label: 'Product surface', value: 'SDK and API for real-time generative video'},
    {label: 'Positioning', value: 'Infrastructure for interactive world-model applications'},
    {label: 'Funding', value: '$59M seed and Series A announced at stealth exit'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Reactor emerged from stealth with a developer platform aimed at serving real-time generative video and interactive AI worlds. Its launch messaging centers on SDK/API access, session orchestration, and production deployment rather than a single named model checkpoint.',
        'The company frames the bottleneck for world models as usability at interactive latency: running generated video as an experience that responds to user actions instead of a pre-rendered clip.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Several timeline entries track world-model research systems, but Reactor is a platform milestone: it marks an attempt to commercialize the infrastructure layer around those systems.',
        'That distinction matters for the filter. Reactor belongs in world models because it is built around real-time world-model applications, but it should not be read as a standalone foundation model release.',
      ],
    },
  ],
  sources: [
    {
      label: 'Amazon Press Center: Reactor emerges from stealth',
      url: 'https://press.aboutamazon.com/aws/2026/5/reactor-emerges-from-stealth-with-59m-to-build-the-platform-for-real-time-ai-worlds',
    },
    {
      label: 'Reactor: official website',
      url: 'https://www.reactor.inc/',
    },
    {
      label: 'Lightspeed: Reactor company profile',
      url: 'https://lsvp.com/company/reactor/',
    },
  ],
};
