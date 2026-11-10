import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'claude-fable-5-2',
  release: {
    companyId: 'anthropic',
    productLineId: 'anthropic-claude',
    name: 'Claude Fable 5.2',
    date: '2026-11-09',
  },
  logo: {
    modelLabel: 'Fable 5.2',
    modelMark: 'claude',
  },
  eyebrow: 'Frontier Fable update',
  title: 'Claude Fable 5.2 moved the public Claude frontier, with Mythos 5.2 as the restricted twin',
  dek: 'Anthropic released Claude Fable 5.2 on November 9, 2026 as generally available GA: stronger coding, reasoning, and vision than Fable 5.1, a lower $8/$40 token price, optional fast mode, and a restricted twin, Claude Mythos 5.2, that uses the same underlying model with looser cyber and life-sciences safeguards.',
  summary: 'Fable 5.2 and Mythos 5.2 are the same underlying model with different safeguards. Fable 5.2 is the public release on all platforms as claude-fable-5-2, at $8 per million input tokens and $40 per million output tokens, with an optional fast mode. Mythos 5.2 is trusted-access only for vetted cybersecurity and life-sciences work through Anthropic’s verification programs.',
  impact: 'This is the first numbered Fable follow-up after Fable 5.1. It puts a faster, cheaper Mythos-class model on the public Claude line, while keeping the unrestricted twin off general availability.',
  facts: [
    {
      label: 'Provider',
      value: 'Anthropic',
    },
    {
      label: 'Release date',
      value: 'November 9, 2026',
    },
    {
      label: 'Public model ID',
      value: 'claude-fable-5-2',
    },
    {
      label: 'Restricted twin',
      value: 'Claude Mythos 5.2 (same underlying model; trusted-access cyber and life sciences)',
    },
    {
      label: 'Context / max output',
      value: '1M tokens / 128K tokens',
    },
    {
      label: 'API pricing',
      value: '$8/M input; $40/M output; $0.20/M cache reads',
    },
    {
      label: 'Fast mode',
      value: '$16/M input; $80/M output; up to 2.5× faster token generation',
    },
    {
      label: 'Platforms',
      value: 'Claude API, Amazon Bedrock, Google Cloud, Microsoft Azure',
    },
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Anthropic says Fable 5.2 and Mythos 5.2 show improvements in coding, reasoning, and vision, communicate more clearly than prior Fable and Mythos models, and generate outputs up to 30% faster than Fable 5.1 and Mythos 5.1. The launch post also describes them as a step above Opus 5.5 on almost all evaluated capabilities, and says they are best for the most ambitious, open-ended technical work. These are first-party launch claims.',
        'Standard API pricing is $8 per million input tokens and $40 per million output tokens, down from Fable 5.1’s $10 and $50. An optional fast mode speeds up token generation by up to 2.5 times at $16 input and $80 output per million tokens. Context is 1M tokens with 128K max output. Anthropic says Fable 5.2’s cyber and biology safeguards are as robust as Fable 5.1’s but produce fewer unnecessary blocks.',
      ],
    },
    {
      heading: 'Mythos 5.2 is the same underlying model',
      body: [
        'Claude Mythos 5.2 is not a separate architecture. Anthropic says it is the same underlying model as Fable 5.2, with more permissive cybersecurity and life-sciences safeguards, available only through trusted-access programs (the Cyber Verification Program and the Life Sciences Verification Program) rather than general GA. Docs say Mythos 5.2 shares Fable 5.2’s specifications and pricing.',
        'Fable 5.2 remains the public card, available on all platforms including Amazon Web Services, Google Cloud, and Microsoft Azure under the developer model ID claude-fable-5-2. Fast mode is available on Claude Code, the Claude Platform, Claude Models on Google Cloud, and Microsoft Foundry; Mythos fast mode is limited to verification-program organizations.',
      ],
    },
  ],
  sources: [
    {
      label: 'Anthropic: Claude Fable 5.2 and Claude Mythos 5.2',
      url: 'https://www.anthropic.com/claude-fable-and-mythos-5-2',
    },
    {
      label: 'Claude docs: Fable 5.2 overview',
      url: 'https://platform.claude.com/docs/en/models/fable-5-2/overview',
    },
  ],
};
