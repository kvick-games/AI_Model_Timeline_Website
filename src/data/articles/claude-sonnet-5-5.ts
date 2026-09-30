import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'claude-sonnet-5-5',
  release: {
    companyId: 'anthropic',
    productLineId: 'anthropic-claude',
    name: 'Claude Sonnet 5.5',
    date: '2026-09-28',
  },
  logo: {
    modelLabel: 'Claude Sonnet 5.5',
    modelMark: 'claude',
  },
  eyebrow: 'Second Claude 5.5 family model',
  title: 'Claude Sonnet 5.5 delivered a large jump over Sonnet 5 as a faster, cheaper Opus 5.5 complement',
  dek: 'Anthropic released Claude Sonnet 5.5 on September 28, 2026 as the second model in its Claude 5.5 family: a clear upgrade over Claude Sonnet 5 that runs 30%+ faster and typically costs up to 30% less per task, while complementing Claude Opus 5.5 on everyday work.',
  summary:
    'Claude Sonnet 5.5 (`claude-sonnet-5-5`) ships with a 1M-token context window, 128k max output, adaptive thinking, and API pricing of $2 / $10 per million input/output tokens (cache reads $0.20)—the same list price as Sonnet 5, with fewer tokens per task. Anthropic reports large gains over Sonnet 5 on agentic coding and knowledge-work suites, and GA availability across the Claude API, Amazon Bedrock, Claude Platform on AWS, Google Cloud, and Microsoft Foundry. Haiku 5.5 remains promised for the coming weeks.',
  impact:
    'Sonnet 5.5 is Anthropic’s high-volume 5.5-family workhorse: strongest at well-scoped everyday tasks, bug fixes, and polished documents, slides, and spreadsheets, while Opus 5.5 stays the pick for complex work requiring careful judgment. Same-day multi-cloud GA makes it a direct upgrade path from Sonnet 5 at equal list prices and lower typical run cost.',
  facts: [
    {label: 'Provider', value: 'Anthropic'},
    {label: 'Release date', value: 'September 28, 2026'},
    {label: 'API model', value: 'claude-sonnet-5-5'},
    {label: 'Context window', value: '1M tokens'},
    {label: 'Max output', value: '128K tokens'},
    {label: 'Thinking', value: 'Adaptive'},
    {label: 'Default effort', value: 'high'},
    {label: 'Input / output price', value: '$2 / $10 per million tokens'},
    {label: 'Cache reads', value: '$0.20 per million tokens'},
    {label: 'Initial availability', value: 'Claude API, Amazon Bedrock, Claude Platform on AWS, Google Cloud, Microsoft Foundry'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Anthropic’s launch post frames Sonnet 5.5 as the second Claude 5.5 release after Opus 5.5: a clear upgrade over Sonnet 5 that generates outputs 30%+ faster and typically costs up to 30% less per task at the same $2/$10 per million input/output token list price (cache reads $0.20). Default effort on the Claude Platform is high; adaptive thinking is available.',
        'Reported launch benchmarks show large jumps over Sonnet 5 on agentic coding and knowledge work, including Terminal-Bench 4.0 (70.6% vs Sonnet 5’s 10.3%) and near-Opus 5.5 scores on GDPval-AA v2.1, while Opus 5.5 remains stronger on complex open-ended work.',
      ],
    },
    {
      heading: 'Safety and availability',
      body: [
        'Because Sonnet 5.5’s cybersecurity capabilities are comparable to Opus 5’s, Anthropic launches it with cyber safeguards and fallbacks similar to those on its most capable models; biology safeguards match Sonnet 5. It is also the first Sonnet model to launch with distillation/reasoning-extraction classifiers and expanded preserved thinking.',
        'Claude Sonnet 5.5 is available the same day on Anthropic’s platforms and major clouds as `claude-sonnet-5-5`. Claude Haiku 5.5 is still promised for the coming weeks and is not part of this timeline entry.',
      ],
    },
  ],
  sources: [
    {
      label: 'Anthropic: Introducing Claude Sonnet 5.5',
      url: 'https://www.anthropic.com/claude-sonnet-5-5',
    },
    {
      label: 'Claude Platform release notes (Sep 28, 2026)',
      url: 'https://platform.claude.com/docs/en/release-notes/overview',
    },
    {
      label: 'Claude Docs: Models overview',
      url: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    },
  ],
};
