import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gpt-6-astra',
  release: {
    companyId: 'openai',
    productLineId: 'openai-gpt',
    name: 'GPT-6 Astra',
    date: '2026-09-03',
  },
  logo: {
    modelLabel: 'GPT-6 Astra',
    modelMark: 'gpt',
  },
  eyebrow: 'OpenAI’s next flagship',
  title: 'GPT-6 Astra opened OpenAI’s GPT-6 generation',
  dek: 'OpenAI released GPT-6 Astra on September 3, 2026 as its new flagship foundation model, rolling out first to Daybreak and trusted-access organizations, then ChatGPT Plus/Pro/Business/Enterprise and the API and AWS over the coming days.',
  summary: 'GPT-6 Astra is OpenAI’s successor to the GPT-5.6 line. The company positions it as state-of-the-art on computer use, coding, science, and professional work, with API model-id gpt-6-astra at $10 per million input tokens and $50 per million output tokens on Standard (Fast mode is 2× price for up to 2× speed).',
  impact: 'This is the first GPT-6 card on the public timeline. It moves OpenAI’s frontier story past GPT-5.6 Sol while the broader ChatGPT and API rollout is still staged over the following days.',
  facts: [
    {label: 'Provider', value: 'OpenAI'},
    {label: 'Release date', value: 'September 3, 2026'},
    {label: 'Developer model ID', value: 'gpt-6-astra'},
    {label: 'API pricing (Standard)', value: '$10/M input; $50/M output'},
    {label: 'Fast mode', value: 'Up to 2× speed at 2× Standard price'},
    {label: 'Availability at launch', value: 'Daybreak / trusted orgs today; Plus/Pro/Business/Enterprise + API/AWS over coming days'},
    {label: 'Also available as', value: 'GPT-6 Pro on Pro, Business, and Enterprise plans'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'OpenAI’s launch post calls GPT-6 Astra a new generation of intelligence and its most aligned model to date. First-party tables put it ahead of GPT-5.6 Sol and Claude Fable 5.1 on several coding, computer-use, and science evals OpenAI highlights, including Terminal-Bench 4.0 and Terminal-Bench Science 0.1.',
        'Standard API pricing is $10 per million input tokens and $50 per million output tokens, with separate cache rates. Fast mode is available in the API at up to 2× Standard speed and 2× Standard price. Astra is also listed on Amazon Bedrock.',
      ],
    },
    {
      heading: 'Rollout',
      body: [
        'At announcement, Astra was rolling out to a limited set of organizations, with ChatGPT Plus, Pro, Business, and Enterprise access plus the OpenAI API and AWS following over the coming days. Pro, Business, and Enterprise also get GPT-6 Astra Pro; Enterprise admins enable Astra for their workspace (off by default at launch).',
        'OpenAI says Astra meets the Critical cybersecurity threshold under its Preparedness Framework and is shipping with stronger safeguards; advanced offensive cyber workflows remain restricted outside Daybreak-style trusted access.',
      ],
    },
  ],
  sources: [
    {
      label: 'OpenAI: GPT-6 Astra',
      url: 'https://openai.com/index/gpt-6-astra/',
    },
    {
      label: 'OpenAI API docs: Models',
      url: 'https://developers.openai.com/api/docs/models',
    },
    {
      label: 'The Verge: OpenAI GPT-6 Astra release',
      url: 'https://www.theverge.com/ai-artificial-intelligence/989601/openai-gpt-6-astra-release',
    },
  ],
};
