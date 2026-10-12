import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'muse-wonder-full',
  release: {
    companyId: 'meta-ai',
    productLineId: 'meta-muse-spark',
    name: 'Muse Wonder Full',
    date: '2026-10-12',
  },
  logo: {
    modelLabel: 'Muse Wonder Full',
    modelMark: 'generic',
  },
  eyebrow: 'The larger Muse Wonder variant',
  title: 'Muse Wonder Full launched as Meta’s most powerful model, reserved for Muse Code subscribers',
  dek: 'Meta released Muse Wonder Full alongside Muse Wonder on October 12, 2026 as the larger, more powerful variant of the new series, available only to Muse Code subscribers.',
  summary:
    'Muse Wonder Full shares the Wonder series’ Active Memory and Active Focus capabilities and was trained at Meta’s gigawatt-scale Prometheus data center. CNBC reports it is available only to developers on Muse Code’s $50 or $200 per month subscription plans.',
  impact:
    'Full is Meta’s top-end model and a paid-tier test: Meta’s research blog shows it generalizing better to unfamiliar, out-of-distribution tasks than the Muse Spark 1.3 trend would predict, which Meta attributes to its larger, stronger base model.',
  facts: [
    {label: 'Provider', value: 'Meta AI / Meta Superintelligence Labs'},
    {label: 'Release date', value: 'October 12, 2026'},
    {label: 'Series', value: 'Muse Wonder'},
    {label: 'Availability', value: 'Muse Code subscribers only'},
    {label: 'Muse Code plans', value: '$50 or $200 per month (per CNBC)'},
    {label: 'Training', value: 'Gigawatt-scale Prometheus data center'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Meta introduced Muse Wonder Full together with Muse Wonder as the Muse Wonder series, its most capable models to date for personal and professional agentic tasks and frontier coding. Benchmark comparisons are Meta’s own internal evaluations.',
        'Unlike Muse Wonder, Full is not offered through the Meta Model API at launch; access is limited to Muse Code subscribers.',
      ],
    },
  ],
  sources: [
    {
      label: 'Meta AI Research: Muse Wonder',
      url: 'https://research.meta.ai/blog/muse-wonder',
    },
    {
      label: 'Meta Newsroom: Introducing Muse Wonder and Muse Wonder Full',
      url: 'https://about.fb.com/news/2026/10/introducing-muse-wonder-models/',
    },
    {
      label: 'CNBC: Meta debuts Muse Wonder AI model',
      url: 'https://www.cnbc.com/2026/10/12/meta-muse-wonder-ai-model-agent.html',
    },
  ],
};
