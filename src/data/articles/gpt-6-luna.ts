import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gpt-6-luna',
  release: {
    companyId: 'openai',
    productLineId: 'openai-gpt',
    name: 'GPT-6 Luna',
    date: '2026-09-22',
  },
  logo: {
    modelLabel: 'GPT-6 Luna',
    modelMark: 'gpt',
  },
  eyebrow: 'GPT-6 high-volume efficiency tier',
  title: 'GPT-6 Luna cut high-volume work to $0.10/$0.50 with Astra-era training',
  dek: 'OpenAI released GPT-6 Luna on September 22, 2026 as its most efficient GPT-6 model for focused, high-volume tasks such as summarization, extraction, and quick answers — at half the prior Luna promotional price.',
  summary:
    'GPT-6 Luna (`gpt-6-luna`) targets focused, high-volume clerical-style work with a 1.05M-token context window, 128k max output, and Standard API pricing of $0.10 per million input tokens and $0.50 per million output tokens. OpenAI says it was trained with similar methods as GPT-6 Astra and ships alongside GPT-6 Sol as the cost-efficiency expansion of the GPT-6 generation.',
  impact:
    'Luna puts GPT-6-generation methods at hosted open-weight price levels for bulk summarization and extraction, while Sol covers mid-tier coding agents and Astra stays the flagship.',
  facts: [
    {label: 'Provider', value: 'OpenAI'},
    {label: 'Release date', value: 'September 22, 2026'},
    {label: 'API model', value: 'gpt-6-luna'},
    {label: 'Context window', value: '1,050,000 tokens'},
    {label: 'Max output', value: '128,000 tokens'},
    {label: 'Knowledge cutoff', value: 'May 18, 2026'},
    {label: 'Input / output price', value: '$0.10 / $0.50 per million tokens'},
    {label: 'Cached input', value: '$0.01 per million tokens'},
    {label: 'Modalities', value: 'Text in/out; image input'},
    {label: 'Initial availability', value: 'API; ChatGPT Work/Codex (paid); Free/Go desktop app; staged ChatGPT chat'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'OpenAI describes GPT-6 Luna as its most efficient model for focused, high-volume tasks with a clear goal — summarizing documents, extracting information, or answering quick questions. API docs list the same 1.05M context / 128k max output envelope as GPT-6 Sol, with reasoning effort from none through max (default medium).',
        'Standard pricing is $0.10 / $0.50 per million input/output tokens, half of GPT-5.6 Luna’s promotional rates, with cache reads at $0.01. OpenAI ties the cut to caching and inference improvements shared with Sol.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'GPT-6 Luna launched with Sol in ChatGPT Work and Codex for paid plans, on the OpenAI API as `gpt-6-luna`, and in the ChatGPT desktop app for Free and Go users. Regular ChatGPT chat rollout was staged through launch day.',
        'No GPT-6 Terra shipped with this drop. Astra remains the most capable GPT-6 model; Sol is the coding/agent mid-tier.',
      ],
    },
  ],
  sources: [
    {
      label: 'OpenAI API docs: GPT-6 Luna',
      url: 'https://developers.openai.com/api/docs/models/gpt-6-luna',
    },
    {
      label: 'TechCrunch: OpenAI launches GPT-6 Sol and Luna',
      url: 'https://techcrunch.com/2026/09/22/openai-launches-gpt-6-sol-and-luna/',
    },
    {
      label: 'CNA: OpenAI expands GPT-6 lineup with Sol and Luna',
      url: 'https://www.channelnewsasia.com/business/openai-expands-gpt-6-lineup-cheaper-sol-and-luna-models-6403136',
    },
  ],
};
