import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gpt-6-1-sol',
  release: {
    companyId: 'openai',
    productLineId: 'openai-gpt',
    name: 'GPT-6.1 Sol',
    date: '2026-09-29',
  },
  logo: {
    modelLabel: 'GPT-6.1 Sol',
    modelMark: 'gpt',
  },
  eyebrow: 'Near-Astra coding tier at Sol prices',
  title: 'GPT-6.1 Sol nearly matches GPT-6 Astra on agentic work at one-fifth Astra token prices',
  dek: 'OpenAI released GPT-6.1 Sol on September 29, 2026 at DevDay as a Sol-class update that approaches GPT-6 Astra on agentic coding, computer use, and professional work while keeping Sol-class API pricing.',
  summary:
    'GPT-6.1 Sol (`gpt-6.1-sol`) targets complex coding, computer use, and professional workflows with a 1.05M-token context window, 128k max output, and an April 30, 2026 knowledge cutoff. Standard API pricing is $2 / $10 per million input/output tokens, with cached input at $0.10 and cache writes at $2.50. OpenAI says it nearly matches GPT-6 Astra on several fronts at about one-fifth Astra’s standard token prices, and that GPT-6.1 Astra did not ship after a safety hold.',
  impact:
    'A week after GPT-6 Sol, GPT-6.1 Sol tightens the gap to Astra for everyday frontier coding and agent work without raising Sol-class prices. Availability starts in ChatGPT Work and Codex for paid plans; ordinary ChatGPT chat access is not included at launch.',
  facts: [
    {label: 'Provider', value: 'OpenAI'},
    {label: 'Release date', value: 'September 29, 2026'},
    {label: 'API model', value: 'gpt-6.1-sol'},
    {label: 'Context window', value: '1,050,000 tokens'},
    {label: 'Max output', value: '128,000 tokens'},
    {label: 'Knowledge cutoff', value: 'April 30, 2026'},
    {label: 'Input / output price', value: '$2 / $10 per million tokens'},
    {label: 'Cached input', value: '$0.10 per million tokens'},
    {label: 'Cache writes', value: '$2.50 per million tokens'},
    {label: 'Reasoning effort', value: 'low, medium (default), high, xhigh, max (no none/minimal)'},
    {label: 'Modalities', value: 'Text in/out; image input'},
    {label: 'Initial availability', value: 'API, ChatGPT Work, Codex (Plus/Pro/Business/Enterprise/Edu); not ordinary Chat yet'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'OpenAI positions GPT-6.1 Sol as delivering near–GPT-6 Astra performance for agentic coding, computer use, and professional work at Sol-class prices—TechCrunch reports about one-fifth Astra’s standard input and output token prices. API docs list a 1.05M context window, 128k max output, April 30, 2026 knowledge cutoff, and `reasoning.effort` of low, medium (default), high, xhigh, and max (none and minimal are not supported).',
        'Versus GPT-6 Sol, OpenAI reports gains on programming and debugging, document understanding, and multistep workflows, plus better factual accuracy on hard prompts (error rate at low effort falling from 11.4% to 7.7%, and within 1.9% of Astra across reasoning settings). GPT-6.1 Astra did not ship; reporting described a safety hold after internal testing raised deception and autonomy concerns.',
      ],
    },
    {
      heading: 'Availability',
      body: [
        'GPT-6.1 Sol launched in ChatGPT Work and Codex for Plus, Pro, Business, Enterprise, and Edu users, and on the OpenAI API as `gpt-6.1-sol`. It is not yet available in ordinary ChatGPT chat at launch.',
        'Responses API tool support includes computer use, code interpreter, file search, MCP, and related hosted tools. Chat Completions is supported without tool calling.',
      ],
    },
  ],
  sources: [
    {
      label: 'OpenAI API docs: GPT-6.1 Sol',
      url: 'https://developers.openai.com/api/docs/models/gpt-6.1-sol',
    },
    {
      label: 'TechCrunch: OpenAI launches GPT-6.1 Sol',
      url: 'https://techcrunch.com/2026/09/29/openai-launches-gpt-6-1-sol-says-it-nearly-matches-gpt-6-astra-and-costs-less/',
    },
    {
      label: 'OpenAI deployment safety: GPT-6.1 Sol evaluations',
      url: 'https://deploymentsafety.openai.com/gpt-6-1-sol/evaluations-with-challenging-prompts',
    },
  ],
};
