import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gpt-6-1-terra',
  release: {
    companyId: 'openai',
    productLineId: 'openai-gpt',
    name: 'GPT-6.1 Terra',
    date: '2026-10-26',
  },
  logo: {
    modelLabel: 'GPT-6.1 Terra',
    modelMark: 'gpt',
  },
  eyebrow: 'Fast GPT-6 tier at half Sol prices',
  title: 'GPT-6.1 Terra brings near-Astra visual reasoning and computer use at $1 / $5 per million tokens',
  dek: 'OpenAI released GPT-6.1 Terra on October 26, 2026 as the fast, efficient member of the GPT-6 series, aimed at high-volume computer use, visual reasoning, and writing at half the API price of GPT-6.1 Sol.',
  summary:
    'GPT-6.1 Terra (`gpt-6.1-terra`) succeeds GPT-5.6 Terra with a 1.05M-token context window, 128k max output, and a June 1, 2026 knowledge cutoff. Standard API pricing is $1 / $5 per million input/output tokens with cached input at $0.05, which OpenAI says is 50% lower than both GPT-5.6 Terra and GPT-6.1 Sol. OpenAI reports it performs on par with GPT-6 Astra on Agents’ Last Exam at medium effort for one-tenth Astra’s per-token price.',
  impact:
    'Terra fills in the cost-efficient end of the GPT-6 lineup below GPT-6.1 Sol and GPT-6 Astra. OpenAI pitches it for high-volume professional work such as forms, invoices, and app-screen automation, while still recommending Sol and Astra for the hardest coding tasks.',
  facts: [
    {label: 'Provider', value: 'OpenAI'},
    {label: 'Release date', value: 'October 26, 2026'},
    {label: 'API model', value: 'gpt-6.1-terra'},
    {label: 'Context window', value: '1,050,000 tokens'},
    {label: 'Max output', value: '128,000 tokens'},
    {label: 'Knowledge cutoff', value: 'June 1, 2026'},
    {label: 'Input / output price', value: '$1 / $5 per million tokens'},
    {label: 'Cached input', value: '$0.05 per million tokens'},
    {label: 'Reasoning effort', value: 'none, low, medium (default), high, xhigh, max'},
    {label: 'Modalities', value: 'Text and image in; text out'},
    {label: 'Terminal-Bench 4.0', value: '50.3% at max effort (GPT-5.6 Terra: 21.5%)'},
    {label: 'Initial availability', value: 'API, ChatGPT Work, Codex (Plus/Pro/Business/Enterprise/Edu)'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'OpenAI describes GPT-6.1 Terra as a fast, efficient model combining detailed visual reasoning, precise computer use, and clearer, more natural writing, and calls it a significant step up from GPT-5.6 Terra. API docs list a 1.05M context window (922k max input), 128k max output, a June 1, 2026 knowledge cutoff, text and image input, and `reasoning.effort` from none through max.',
        'On Agents’ Last Exam at medium effort, OpenAI reports Terra scores 15 points higher than GPT-5.6 Terra at about one-third the cost and performs on par with GPT-6 Astra at one-tenth its per-token price. It nearly matches GPT-6 Astra and GPT-6.1 Sol on MMMU-Pro, solves 50.3% of Terminal-Bench 4.0 at max effort (versus 21.5% for GPT-5.6 Terra), and cuts the low-effort error rate on OpenAI’s hard factuality prompts from 53.6% to 16.7%.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'GPT-6.1 Terra launched in ChatGPT Work and Codex for paid plans and on the OpenAI API as `gpt-6.1-terra` via the Responses and Chat Completions APIs; tool calling requires the Responses API.',
        'OpenAI says Terra meets the Critical cybersecurity threshold under its Preparedness Framework and keeps the safeguards developed for GPT-6 Astra; a system card addendum was published alongside the launch.',
      ],
    },
  ],
  sources: [
    {
      label: 'OpenAI: Introducing GPT-6.1 Terra',
      url: 'https://openai.com/index/introducing-gpt-6-1-terra/',
    },
    {
      label: 'OpenAI API docs: GPT-6.1 Terra',
      url: 'https://developers.openai.com/api/docs/models/gpt-6.1-terra',
    },
    {
      label: 'OpenAI deployment safety: GPT-6.1 Terra system card addendum',
      url: 'https://deploymentsafety.openai.com/gpt-6-1-terra',
    },
  ],
};
