import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'kimi-k3-1-pro',
  release: {
    companyId: 'moonshot-kimi',
    productLineId: 'kimi-models',
    name: 'Kimi K3.1 Pro',
    date: '2026-10-23',
  },
  logo: {
    modelLabel: 'K3.1 Pro',
    modelMark: 'generic',
  },
  eyebrow: 'Open-weight frontier coding',
  title: 'Kimi K3.1 Pro pulls within a point of Claude Opus 5.5 on Terminal-Bench 4.0',
  dek: 'Moonshot AI released Kimi K3.1 Pro on October 23, 2026, a heavily post-trained Kimi K3 that it calls its most capable 3T-class open-weight model, with full weights promised by November 4.',
  summary:
    'Kimi K3.1 Pro (`kimi-k3.1-pro`) is a 2.8T-total / 104B-active mixture-of-experts model with a 1M-token context window and always-on thinking. Moonshot reports 65.7% on Terminal-Bench 4.0, ahead of GPT-6 Astra (58.2%) and just behind Claude Opus 5.5 (66.4%), and API pricing is $2 / $10 per million input/output tokens, down from K3’s $3 / $15.',
  impact:
    'K3.1 Pro narrows the gap between open-weight and proprietary frontier models on agentic coding, and Artificial Analysis placed it 4th on its Intelligence Index with a score of 55. Moonshot also deliberately curbed the open-weight build’s offensive cyber capability before release.',
  facts: [
    {label: 'Provider', value: 'Moonshot AI'},
    {label: 'Release date', value: 'October 23, 2026'},
    {label: 'API model', value: 'kimi-k3.1-pro'},
    {label: 'Architecture', value: 'MoE, 2.8T total / 104B active parameters'},
    {label: 'Context window', value: '1M tokens'},
    {label: 'Input / output price', value: '$2 / $10 per million tokens'},
    {label: 'Terminal-Bench 4.0', value: '65.7% (Opus 5.5: 66.4%, GPT-6 Astra: 58.2%)'},
    {label: 'SWE-Marathon', value: '51.7 (Opus 5.5: 46.3)'},
    {label: 'AA Intelligence Index', value: '55 (4th)'},
    {label: 'Open weights', value: 'Promised by November 4, 2026'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Moonshot describes K3.1 Pro as a post-trained version of Kimi K3 with substantially larger post-training compute, using large-scale joint RL across hundreds of domains. It rolled out on Kimi.ai, the Kimi apps, Kimi Work, Kimi Code, and the Kimi API, alongside a Kimi K3.1 Pro Highspeed variant that runs 2-3× faster.',
        'Beyond Terminal-Bench 4.0 and SWE-Marathon, Moonshot reports 61.2% on its internal Kimi Code Bench 3.0 Long-horizon (K3: 55.95%), 92.7% on BenchCAD with tools, and a state-of-the-art 64.4 on OfficeQA Pro v2. All benchmark scores are self-reported by Moonshot.',
      ],
    },
    {
      heading: 'Curbed cyber capability',
      body: [
        'For the open-weight release, Moonshot says it removed cyber-related data from mid-training and RL. On its in-house xdev-bench-hard exploit benchmark, a checkpoint without those measures solved 90.5% of problems at pass@3, while the released K3.1 Pro reached 81.0%. Moonshot says its cyber capability remains behind frontier proprietary models.',
      ],
    },
  ],
  sources: [
    {
      label: 'Kimi blog: Introducing Kimi K3.1 Pro',
      url: 'https://kimi.ai/blog/kimi-k3-1-pro',
    },
    {
      label: 'Kimi API Platform: Kimi K3.1 Pro quickstart',
      url: 'https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart',
    },
    {
      label: 'Artificial Analysis: Kimi K3.1 Pro launches at 4th on the Intelligence Index',
      url: 'https://artificialanalysis.ai/articles/kimi-k3-1-pro-launch-benchmarks',
    },
    {
      label: 'MarkTechPost: Moonshot AI releases Kimi K3.1 Pro',
      url: 'https://www.marktechpost.com/2026/10/23/moonshot-ai-kimi-k3-1-pro-open-weight-model/',
    },
  ],
};
