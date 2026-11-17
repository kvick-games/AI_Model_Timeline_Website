import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gpt-6-2-astra',
  release: {
    companyId: 'openai',
    productLineId: 'openai-gpt',
    name: 'GPT-6.2 Astra',
    date: '2026-11-17',
  },
  logo: {
    modelLabel: 'GPT-6.2 Astra',
    modelMark: 'gpt',
  },
  eyebrow: 'Frontier Astra update for professional work',
  title: 'GPT-6.2 Astra lowered Astra token prices 20% and raised OpenAI’s bar on professional work',
  dek: 'OpenAI released GPT-6.2 Astra on November 17, 2026 as its new frontier model for complex coding and professional work, with standard API prices 20% below GPT-6 Astra and a deeper 60% discount on cached input.',
  summary:
    'GPT-6.2 Astra (`gpt-6.2-astra`) is OpenAI’s new frontier model for the hardest coding and professional projects, with a 1.05M-token context window, 128k max output, and a May 18, 2026 knowledge cutoff. Standard API pricing is $8 / $40 per million input/output tokens, with cached input at $0.40 and cache writes at $10—20% below GPT-6 Astra’s input and output rates, and a 60% discount on cached input. OpenAI reports it scores 5.2 points higher than GPT-6 Astra on Agents’ Last Exam at less than a third of the cost.',
  impact:
    'This is the first numbered Astra follow-up after GPT-6 Astra. It keeps the GPT-6 flagship on professional work and coding while cutting standard token prices and adding Ultrafast in ChatGPT Work, Codex, and the API.',
  facts: [
    {label: 'Provider', value: 'OpenAI'},
    {label: 'Release date', value: 'November 17, 2026'},
    {label: 'API model', value: 'gpt-6.2-astra'},
    {label: 'Context window', value: '1,050,000 tokens'},
    {label: 'Max output', value: '128,000 tokens'},
    {label: 'Knowledge cutoff', value: 'May 18, 2026'},
    {label: 'Input / output price', value: '$8 / $40 per million tokens'},
    {label: 'Cached input', value: '$0.40 per million tokens'},
    {label: 'Cache writes', value: '$10 per million tokens'},
    {label: 'Reasoning effort', value: 'low, medium, high, xhigh, max (no none)'},
    {label: 'Modalities', value: 'Text and image in; text out'},
    {label: 'Initial availability', value: 'API, ChatGPT Work, Codex (Plus/Pro/Enterprise/Edu); Ultrafast on Pro 500 and in the API'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'OpenAI positions GPT-6.2 Astra as a new standard for professional work and its frontier model for the hardest projects. The launch post says it writes cleaner code, builds better frontends, and produces slides, spreadsheets, and documents that more closely follow provided templates and field conventions, while using fewer output tokens. API docs list a 1.05M context window (922k max input), 128k max output, a May 18, 2026 knowledge cutoff, text and image input, and `reasoning.effort` of low, medium, high, xhigh, and max; the API rejects `none`.',
        'Standard API pricing is $8 / $40 per million input/output tokens—20% below GPT-6 Astra—with cached input at $0.40 (a 60% discount versus GPT-6 Astra) and cache writes at $10. OpenAI reports GPT-6.2 Astra scores 5.2 points higher than GPT-6 Astra on Agents’ Last Exam at less than a third of the cost, 5.5 points ahead of Claude Fable 5.2 at 5% of the cost, and 9 percentage points higher than GPT-6 Astra on Terminal-Bench-Science 0.1 at less than one-third the cost. These are first-party launch claims.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'GPT-6.2 Astra launched in ChatGPT Work and Codex for Plus, Pro, Enterprise, and Edu users, and on the OpenAI API as `gpt-6.2-astra` via the Responses and Chat Completions APIs. Both endpoints accept text and image input and return text; tool calling and hosted tools such as computer use, file search, web search, and MCP are listed on the Responses API. Batch and Flex are supported.',
        'Ultrafast is available for both GPT-6.2 Astra and GPT-6.2 Sol in the API at launch. In ChatGPT, Pro 500 subscribers can use Ultrafast with either model; OpenAI is also bringing Ultrafast to Pro 200 subscribers for the first time, starting with GPT-6.2 Sol. Eligible Enterprise and Edu users get the same access once a workspace admin enables it. OpenAI says both 6.2 models meet the Critical cybersecurity threshold and the High threshold for biological and chemical capabilities under its Preparedness Framework, and that GPT-6.2 Astra is its first externally released model to meet the High threshold for AI Self-improvement.',
      ],
    },
  ],
  sources: [
    {
      label: 'OpenAI: Introducing GPT-6.2 Astra and Sol',
      url: 'https://openai.com/index/introducing-gpt-6-2-astra-sol/',
    },
    {
      label: 'OpenAI API docs: GPT-6.2 Astra',
      url: 'https://developers.openai.com/api/docs/models/gpt-6.2-astra',
    },
    {
      label: 'OpenAI Help Center: Model Release Notes',
      url: 'https://help.openai.com/en/articles/9624314-model-release-notes',
    },
  ],
};
