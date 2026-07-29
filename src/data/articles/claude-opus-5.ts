import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'claude-opus-5',
  release: {
    companyId: 'anthropic',
    productLineId: 'anthropic-claude',
    name: 'Claude Opus 5',
    date: '2026-07-24',
  },
  logo: {
    modelLabel: 'Claude Opus 5',
    modelMark: 'claude',
  },
  eyebrow: 'Flagship agentic upgrade',
  title: 'Claude Opus 5 pushed Anthropic’s flagship deeper into long-horizon work',
  dek: 'Anthropic released Claude Opus 5 on July 24, 2026 with a 1M-token context window, 128K maximum output, thinking enabled by default, and major gains in deep reasoning and agentic coding.',
  summary: 'Claude Opus 5 is Anthropic’s successor to Opus 4.8 for complex coding, analysis, and enterprise work. The release focuses on sustained reasoning, long-running tool use, code review, vision, and scaling capability through five effort levels.',
  impact: 'The model makes Anthropic’s strongest broadly available Opus tier better suited to end-to-end work that spans large repositories, long contexts, and extended tool loops, while holding the standard Opus 4.8 price.',
  facts: [
    {
      label: 'Provider',
      value: 'Anthropic',
    },
    {
      label: 'Release date',
      value: 'July 24, 2026',
    },
    {
      label: 'Developer model ID',
      value: 'claude-opus-5',
    },
    {
      label: 'Context window',
      value: '1M tokens',
    },
    {
      label: 'Maximum output',
      value: '128K tokens',
    },
    {
      label: 'Standard API pricing',
      value: '$5/M input tokens; $25/M output tokens',
    },
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Anthropic describes Claude Opus 5 as a step-change over Opus 4.8, with its largest gains in deep reasoning, agentic and long-horizon tasks, and test-time compute scaling.',
        'The model is designed to stay focused through extended tool loops and complete larger multi-file features, refactors, reviews, and end-to-end coding work without leaving unfinished placeholders.',
      ],
    },
    {
      heading: 'How it ships',
      body: [
        'Claude Opus 5 is available to all Claude API customers as claude-opus-5 and through Amazon Bedrock, Google Cloud, and Microsoft Foundry.',
        'Its 1M-token context window is both the default and maximum context size, with up to 128K output tokens. Thinking is enabled by default, and the effort control spans low, medium, high, xhigh, and max.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'The release moves the Opus line further toward sustained autonomous work: long code changes, deep reviews, visual analysis, enterprise documents, and multi-agent coordination rather than isolated single-turn answers.',
        'Anthropic kept standard pricing unchanged from Opus 4.8 at $5 per million input tokens and $25 per million output tokens, with cache hits priced at $0.50 per million tokens.',
      ],
    },
  ],
  sources: [
    {
      label: 'Anthropic: What’s new in Claude Opus 5',
      url: 'https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5',
    },
    {
      label: 'Anthropic: Claude Platform release notes',
      url: 'https://platform.claude.com/docs/en/release-notes/overview',
    },
    {
      label: 'Anthropic: Claude pricing',
      url: 'https://platform.claude.com/docs/en/about-claude/pricing',
    },
  ],
};
