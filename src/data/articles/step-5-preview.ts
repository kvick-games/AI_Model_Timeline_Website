import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'step-5-preview',
  release: {
    companyId: 'stepfun',
    productLineId: 'step-models',
    name: 'Step 5 Preview',
    date: '2026-09-20',
  },
  logo: {
    modelLabel: 'Step 5 Preview',
    modelMark: 'generic',
  },
  eyebrow: 'StepFun flagship 600B MoE',
  title: 'Step 5 Preview put StepFun’s 600B sparse MoE on the API',
  dek: 'StepFun launched Step 5 Preview on September 20, 2026 as its new flagship for agentic software engineering and professional knowledge work, with API access the same day and open weights scheduled for October 15.',
  summary:
    'Step 5 Preview is a sparse mixture-of-experts flagship with 600B total parameters, 27B active per token, a 1M-token context window, and native text plus image input. Artificial Analysis scores it 44 on the Intelligence Index; API pricing is $1 per million input tokens and $2.70 per million output tokens with a 95% cache discount.',
  impact:
    'This is the first StepFun card on the public timeline and a new Chinese frontier MoE peer alongside Kimi K3 and GLM-5.3: callable today, weights later, and priced well below similarly scored closed models on Artificial Analysis.',
  facts: [
    {label: 'Provider', value: 'StepFun (阶跃星辰)'},
    {label: 'Release date', value: 'September 20, 2026'},
    {label: 'Architecture', value: 'Sparse MoE — 600B total / 27B active per token'},
    {label: 'Context window', value: '1M tokens'},
    {label: 'Modalities', value: 'Native text + image input'},
    {label: 'AA Intelligence Index', value: '44'},
    {label: 'API pricing', value: '$1/M input; $2.70/M output (95% cache discount)'},
    {label: 'Availability', value: 'API and StepFun products live Sep 20; open weights Oct 15'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'StepFun’s product page introduces Step 5 Preview as a flagship for agentic work with particular strength in software engineering, professional knowledge work, and finance. The model is a sparse MoE with 600B total parameters and 27B active per token, a one-million-token context window, and native vision input.',
        'Artificial Analysis lists Step 5 Preview at 44 on the Intelligence Index. AI Weekly reports API pricing of $1 per million input tokens and $2.70 per million output tokens with a 95% cache discount. StepFun says full open weights follow on October 15.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'The launch pattern is API-first, weights later: the model is callable on day one while the downloadable checkpoint is promised for mid-October. That puts StepFun into the same frontier MoE conversation as peer Chinese labs without waiting for the open-weight drop.',
        'At the stated price and AA Index score, Step 5 Preview is positioned as a high-intelligence, lower-cost alternative to top closed models for coding and knowledge-work agents.',
      ],
    },
  ],
  sources: [
    {
      label: 'StepFun: Step 5 Preview',
      url: 'https://www.stepfun.com/step-5-preview',
    },
    {
      label: 'AI Weekly: StepFun ships Step 5 Preview API (AA Index 44)',
      url: 'https://aiweekly.co/alerts/stepfun-ships-step-5-preview-api-a-600b-moe-at-1270-that-scores-44-on',
    },
    {
      label: 'Cocoloop: Step 5 Preview 600B open weights',
      url: 'https://news.cocoloop.cn/en/2026/09/step-5-preview-600b-open-weights/',
    },
  ],
};
