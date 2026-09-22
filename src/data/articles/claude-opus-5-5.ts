import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'claude-opus-5-5',
  release: {
    companyId: 'anthropic',
    productLineId: 'anthropic-claude',
    name: 'Claude Opus 5.5',
    date: '2026-09-22',
  },
  logo: {
    modelLabel: 'Claude Opus 5.5',
    modelMark: 'claude',
  },
  eyebrow: 'First Claude 5.5 family Opus',
  title: 'Claude Opus 5.5 matched Fable-class work at 40% less cost than Opus 5',
  dek: 'Anthropic released Claude Opus 5.5 on September 22, 2026 as the first model in its Claude 5.5 family, positioning it at Claude Fable 5.1 levels on most work while cutting typical run cost about 40% versus Claude Opus 5.',
  summary:
    'Claude Opus 5.5 (`claude-opus-5-5`) ships with a 1M-token context window, 128k max output, always-on adaptive thinking, and API pricing of $4 / $20 per million input/output tokens (cache reads $0.20). Anthropic reports frontier agentic coding and knowledge-work scores with stronger alignment on its automated behavioral audit, and deploys Fable-class cyber and biology safeguards with verification programs for vetted users.',
  impact:
    'This is the new default Opus for everyday frontier coding and knowledge work: Anthropic says start with Opus 5.5 for most workloads and reserve Fable 5.1 for the hardest long-horizon cases. Same-day availability across the Claude API and major clouds makes it a direct upgrade path from Opus 5 at lower token prices.',
  facts: [
    {label: 'Provider', value: 'Anthropic'},
    {label: 'Release date', value: 'September 22, 2026'},
    {label: 'API model', value: 'claude-opus-5-5'},
    {label: 'Context window', value: '1M tokens'},
    {label: 'Max output', value: '128K tokens'},
    {label: 'Thinking', value: 'Adaptive, always on (cannot disable)'},
    {label: 'Default effort', value: 'medium'},
    {label: 'Input / output price', value: '$4 / $20 per million tokens'},
    {label: 'Cache reads', value: '$0.20 per million tokens'},
    {label: 'Initial availability', value: 'Claude API, Amazon Bedrock, Claude Platform on AWS, Google Cloud, Microsoft Foundry'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Anthropic’s launch post frames Opus 5.5 as the first Claude 5.5 release: Fable 5.1–class performance on most work at about 40% lower typical cost than Opus 5, with input/output pricing at $4/$20 per million tokens and cache reads at $0.20. Default effort is medium; adaptive thinking is always on and cannot be disabled.',
        'Reported launch benchmarks put Opus 5.5 ahead of Opus 5 and competitive with or ahead of Fable 5.1 and GPT-6 Astra on several agentic coding and knowledge-work suites, including Terminal-Bench 4.0, FrontierCode, CursorBench, and GDPval-AA v2.1, while using fewer tokens per task.',
      ],
    },
    {
      heading: 'Safety and availability',
      body: [
        'Because Opus 5.5 is comparable to Mythos/Fable-class models in biology and cybersecurity, Anthropic deploys similar safeguards, with Life Sciences and Cyber Verification Programs for vetted access. The model also launches with preserved-thinking anti-distillation controls and watermarking measures described for Fable 5.1.',
        'Claude Opus 5.5 is available the same day on Anthropic’s platforms and major clouds as `claude-opus-5-5`. Sonnet 5.5 and Haiku 5.5 are promised for the coming weeks and are not part of this timeline entry.',
      ],
    },
  ],
  sources: [
    {
      label: 'Anthropic: Introducing Claude Opus 5.5',
      url: 'https://www.anthropic.com/news/claude-opus-5-5',
    },
    {
      label: 'Claude Docs: Models overview',
      url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
    },
    {
      label: 'Claude Platform release notes (Sep 22, 2026)',
      url: 'https://platform.claude.com/docs/en/release-notes/overview',
    },
  ],
};
