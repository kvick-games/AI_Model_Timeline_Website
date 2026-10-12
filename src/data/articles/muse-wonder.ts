import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'muse-wonder',
  release: {
    companyId: 'meta-ai',
    productLineId: 'meta-muse-spark',
    name: 'Muse Wonder',
    date: '2026-10-12',
  },
  logo: {
    modelLabel: 'Muse Wonder',
    modelMark: 'generic',
  },
  eyebrow: 'Meta’s most capable model to date',
  title: 'Muse Wonder opened Meta’s next frontier series for personal and professional agents',
  dek: 'Meta Superintelligence Labs introduced Muse Wonder on October 12, 2026 as the first model in the Muse Wonder series, available the same day through the Meta Model API and Muse Code.',
  summary:
    'Muse Wonder is Meta’s most capable model so far, built on the Muse Spark groundwork for state-of-the-art performance on personal and professional agentic tasks. It introduces Active Memory (carrying relevant context across conversations) and Active Focus (sustained effort on hard tasks: trying other approaches, recovering from errors, and checking in before important actions). Meta says it was trained at its gigawatt-scale Prometheus data center.',
  impact:
    'Wonder moves Meta from the Spark coding-agent lane into a new, larger frontier series. Meta positions it for expert domains such as law, finance, and health plus frontier coding, and plans to use it to power the Muse agent, rolling out first to subscribers.',
  facts: [
    {label: 'Provider', value: 'Meta AI / Meta Superintelligence Labs'},
    {label: 'Release date', value: 'October 12, 2026'},
    {label: 'Series', value: 'Muse Wonder (with Muse Wonder Full)'},
    {label: 'Availability', value: 'Meta Model API and Muse Code'},
    {label: 'Key capabilities', value: 'Active Memory, Active Focus, frontier coding'},
    {label: 'Training', value: 'Gigawatt-scale Prometheus data center'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Meta describes Muse Wonder as the next step on its scaling ladder after Muse Spark, with gains across pretraining and reinforcement learning on a larger, stronger base model. Meta reports state-of-the-art results on its evaluation suite for personal and professional agents, memory, and coding, including FocusBench, SWE-Marathon, and Harvey’s Legal Agent Benchmark; these are Meta’s own internal comparisons.',
        'Active Memory carries what matters to the user across conversations, while Active Focus keeps the model working toward a goal when a task gets hard, asking for clarification when needed.',
      ],
    },
    {
      heading: 'Availability and safety',
      body: [
        'Muse Wonder is available today through the Meta Model API and Muse Code, and will soon power experiences in Muse, rolling out first to subscribers. Meta says it carries its strongest safeguards to date against CBRN and cyber misuse under the Meta Superintelligence Scaling Framework, with a full safety report coming later.',
      ],
    },
  ],
  sources: [
    {
      label: 'Meta Newsroom: Introducing Muse Wonder and Muse Wonder Full',
      url: 'https://about.fb.com/news/2026/10/introducing-muse-wonder-models/',
    },
    {
      label: 'Meta AI Research: Muse Wonder',
      url: 'https://research.meta.ai/blog/muse-wonder',
    },
    {
      label: 'CNBC: Meta debuts Muse Wonder AI model',
      url: 'https://www.cnbc.com/2026/10/12/meta-muse-wonder-ai-model-agent.html',
    },
  ],
};
