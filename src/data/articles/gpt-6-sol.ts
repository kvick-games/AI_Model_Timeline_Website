import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gpt-6-sol',
  release: {
    companyId: 'openai',
    productLineId: 'openai-gpt',
    name: 'GPT-6 Sol',
    date: '2026-09-22',
  },
  logo: {
    modelLabel: 'GPT-6 Sol',
    modelMark: 'gpt',
  },
  eyebrow: 'GPT-6 mid-tier for coding and agents',
  title: 'GPT-6 Sol brought Astra-class training methods to a $2/$10 coding workhorse',
  dek: 'OpenAI released GPT-6 Sol on September 22, 2026 as the GPT-6 successor to GPT-5.6 Sol, aimed at complex coding and agentic workflows at half the prior Sol promotional price.',
  summary:
    'GPT-6 Sol (`gpt-6-sol`) is built for complex coding and agentic workflows with a 1.05M-token context window, 128k max output, and Standard API pricing of $2 per million input tokens and $10 per million output tokens. OpenAI says it was trained with similar methods as GPT-6 Astra and cuts factuality errors roughly in half versus GPT-5.6 Sol on OpenAI’s internal evals, while remaining below Astra for the most demanding projects.',
  impact:
    'With Astra already on the timeline as the GPT-6 flagship, Sol is the everyday frontier coding tier: same generation methods, much lower token cost, and same-day rollout into ChatGPT Work, Codex, and the API.',
  facts: [
    {label: 'Provider', value: 'OpenAI'},
    {label: 'Release date', value: 'September 22, 2026'},
    {label: 'API model', value: 'gpt-6-sol'},
    {label: 'Context window', value: '1,050,000 tokens'},
    {label: 'Max output', value: '128,000 tokens'},
    {label: 'Knowledge cutoff', value: 'April 20, 2026'},
    {label: 'Input / output price', value: '$2 / $10 per million tokens'},
    {label: 'Cached input', value: '$0.20 per million tokens'},
    {label: 'Modalities', value: 'Text in/out; image input'},
    {label: 'Initial availability', value: 'API, ChatGPT Work, Codex (paid plans); staged ChatGPT rollout'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'OpenAI positions GPT-6 Sol for complex coding and agentic workflows, expanding the GPT-6 lineup below flagship GPT-6 Astra. API docs list a 1.05M context window, 128k max output, reasoning effort from none through max (default medium), and Responses API tool support including computer use, code interpreter, and MCP.',
        'Standard pricing is $2 / $10 per million input/output tokens — half of GPT-5.6 Sol’s promotional rates — with cache reads at $0.20. OpenAI attributes the cut to caching and inference improvements and says Sol reaches Astra-level reliability on its internal factuality eval at much lower cost.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'GPT-6 Sol launched in ChatGPT Work and Codex for Plus, Pro, Business, Enterprise, and Edu users, and on the OpenAI API as `gpt-6-sol`. Regular ChatGPT chat access was staged through launch day; Enterprise admins enable the new models for their workspaces.',
        'Astra remains OpenAI’s most capable GPT-6 model for the hardest projects. GPT-6 Luna shipped the same day as the high-volume efficiency tier.',
      ],
    },
  ],
  sources: [
    {
      label: 'OpenAI API docs: GPT-6 Sol',
      url: 'https://developers.openai.com/api/docs/models/gpt-6-sol',
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
