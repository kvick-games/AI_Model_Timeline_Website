import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'claude-haiku-5-5',
  release: {
    companyId: 'anthropic',
    productLineId: 'anthropic-claude',
    name: 'Claude Haiku 5.5',
    date: '2026-10-07',
  },
  logo: {
    modelLabel: 'Claude Haiku 5.5',
    modelMark: 'claude',
  },
  eyebrow: 'Small, fast tier of the Claude 5.5 family',
  title: 'Claude Haiku 5.5 became Anthropic’s cheapest, fastest, and most capable small model',
  dek: 'Anthropic released Claude Haiku 5.5 on October 7, 2026, completing the Claude 5.5 family with a high-volume model that costs around 75% less to run than Haiku 4.5 on average.',
  summary:
    'Claude Haiku 5.5 (`claude-haiku-5-5`) ships with a 1M-token context window, 128k max output, adaptive thinking, and Anthropic’s first adjustable effort setting on a Haiku-class model. API pricing is $0.10 / $0.50 per million input/output tokens for prompts up to 100k tokens ($0.50 / $2.50 above that). It is available on the Claude API, Amazon Bedrock, Google Cloud, Microsoft Foundry, and Claude Platform on AWS.',
  impact:
    'Haiku 5.5 targets high-volume, latency-sensitive work such as summaries, compaction, classification, routing, browser use, and subagent tasks alongside Opus 5.5 and Sonnet 5.5. Anthropic says it is its fastest model to date at standard speed, while Sonnet 5.5 and Opus 5.5 remain better for complex agentic coding.',
  facts: [
    {label: 'Provider', value: 'Anthropic'},
    {label: 'Release date', value: 'October 7, 2026'},
    {label: 'API model', value: 'claude-haiku-5-5'},
    {label: 'Context window', value: '1M tokens'},
    {label: 'Max output', value: '128K tokens'},
    {label: 'Thinking', value: 'Adaptive, adjustable effort'},
    {label: 'Default effort', value: 'medium'},
    {label: 'Input / output price', value: '$0.10 / $0.50 per million tokens (prompts up to 100k)'},
    {label: 'Initial availability', value: 'Claude API, Amazon Bedrock, Google Cloud, Microsoft Foundry, Claude Platform on AWS'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Anthropic’s launch table shows large gains over Haiku 4.5, including Terminal-Bench 4.0 (39.2% vs 0.0%), OSWorld 2.1 offline subset (72.4% vs 15.7%), and Humanity’s Last Exam without tools (45.9% vs 10.2%).',
        'Haiku 5.5 is priced 90% below Haiku 4.5 for requests up to 100k tokens and 50% below above that; accounting for its newer tokenizer, Anthropic estimates it costs around 75% less to run on average.',
      ],
    },
    {
      heading: 'Alongside the launch',
      body: [
        'Anthropic also halved Claude Sonnet 5.5 cache-read pricing to $0.10 per million tokens and announced monthly API credits for Max and Team subscribers.',
      ],
    },
  ],
  sources: [
    {
      label: 'Anthropic: Introducing Claude Haiku 5.5',
      url: 'https://www.anthropic.com/claude-haiku-5-5',
    },
    {
      label: 'Claude Docs: Claude Haiku 5.5 overview',
      url: 'https://platform.claude.com/docs/en/models/haiku-5-5/overview',
    },
  ],
};
