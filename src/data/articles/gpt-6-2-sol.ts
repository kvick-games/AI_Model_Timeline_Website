import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gpt-6-2-sol',
  release: {
    companyId: 'openai',
    productLineId: 'openai-gpt',
    name: 'GPT-6.2 Sol',
    date: '2026-11-17',
  },
  logo: {
    modelLabel: 'GPT-6.2 Sol',
    modelMark: 'gpt',
  },
  eyebrow: 'Everyday GPT-6 tier at Sol prices',
  title: 'GPT-6.2 Sol keeps Sol-class prices while closing in on the new Astra',
  dek: 'OpenAI released GPT-6.2 Sol on November 17, 2026 as its efficient everyday model for coding and agent work, keeping GPT-6.1 Sol’s $2 / $10 API token prices while raising quality on demanding tasks.',
  summary:
    'GPT-6.2 Sol (`gpt-6.2-sol`) is OpenAI’s efficient everyday model, with a 1.05M-token context window, 128k max output, and a June 1, 2026 knowledge cutoff. Standard API pricing matches GPT-6.1 Sol at $2 / $10 per million input/output tokens, with cached input at $0.10 and cache writes at $2.50. OpenAI says it is smarter and more efficient than GPT-6.1 Sol, comes within 0.5 points of GPT-6.2 Astra on Cognition’s FrontierCode 2.0 at about one-fifth the cost, and outscores GPT-6 Astra on LifeVal at about one-seventh the cost.',
  impact:
    'Shipped alongside GPT-6.2 Astra, Sol remains the everyday workhorse of the GPT-6 line: same-day access in ChatGPT Work, Codex, and the API, unchanged Sol-class prices, and the first Ultrafast option for Pro 200 subscribers.',
  facts: [
    {label: 'Provider', value: 'OpenAI'},
    {label: 'Release date', value: 'November 17, 2026'},
    {label: 'API model', value: 'gpt-6.2-sol'},
    {label: 'Context window', value: '1,050,000 tokens'},
    {label: 'Max output', value: '128,000 tokens'},
    {label: 'Knowledge cutoff', value: 'June 1, 2026'},
    {label: 'Input / output price', value: '$2 / $10 per million tokens'},
    {label: 'Cached input', value: '$0.10 per million tokens'},
    {label: 'Cache writes', value: '$2.50 per million tokens'},
    {label: 'Reasoning effort', value: 'low, medium, high, xhigh, max (no none)'},
    {label: 'Modalities', value: 'Text and image in; text out'},
    {label: 'Initial availability', value: 'API, ChatGPT Work, Codex (Plus/Pro/Enterprise/Edu); Ultrafast on Pro 500, Pro 200, and in the API'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'OpenAI positions GPT-6.2 Sol as its go-to model for everyday work, including coding and powering agents at scale. Compared with GPT-6.1 Sol, the launch post says it is smarter, more efficient, and better at multistep agentic workflows, with clearer, more natural writing. API docs list a 1.05M context window (922k max input), 128k max output, a June 1, 2026 knowledge cutoff, text and image input, and `reasoning.effort` of low, medium, high, xhigh, and max; the API rejects `none`.',
        'Standard API pricing stays at GPT-6.1 Sol’s rates of $2 / $10 per million input/output tokens, with cached input at $0.10 and cache writes at $2.50. OpenAI reports that on Cognition’s FrontierCode 2.0, GPT-6.2 Sol comes within 0.5 points of GPT-6.2 Astra at about one-fifth the cost (both at max effort), and that on LifeVal, which measures challenging everyday tasks, it outscores GPT-6 Astra at about one-seventh the cost. These are first-party launch claims.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'GPT-6.2 Sol launched in ChatGPT Work and Codex for Plus, Pro, Enterprise, and Edu users, and on the OpenAI API as `gpt-6.2-sol` via the Responses and Chat Completions APIs. Both endpoints accept text and image input and return text; the Help Center notes it can combine text, images, and tools such as web search. Tool calling and hosted tools including computer use, file search, web search, and MCP are listed on the Responses API. Batch and Flex are supported.',
        'Ultrafast is available for GPT-6.2 Sol in the API at launch. In ChatGPT, Pro 500 subscribers can use Ultrafast with either 6.2 model, and OpenAI is bringing Ultrafast to Pro 200 subscribers for the first time, starting with GPT-6.2 Sol. Eligible Enterprise and Edu users get the same access once a workspace admin enables it. OpenAI says GPT-6.2 Sol, like GPT-6.2 Astra, meets the Critical cybersecurity threshold and the High threshold for biological and chemical capabilities under its Preparedness Framework.',
      ],
    },
  ],
  sources: [
    {
      label: 'OpenAI: Introducing GPT-6.2 Astra and Sol',
      url: 'https://openai.com/index/introducing-gpt-6-2-astra-sol/',
    },
    {
      label: 'OpenAI API docs: GPT-6.2 Sol',
      url: 'https://developers.openai.com/api/docs/models/gpt-6.2-sol',
    },
    {
      label: 'OpenAI Help Center: Model Release Notes',
      url: 'https://help.openai.com/en/articles/9624314-model-release-notes',
    },
  ],
};
