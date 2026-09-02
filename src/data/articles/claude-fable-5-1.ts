import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'claude-fable-5-1',
  release: {
    companyId: 'anthropic',
    productLineId: 'anthropic-claude',
    name: 'Claude Fable 5.1',
    date: '2026-09-01',
  },
  logo: {
    modelLabel: 'Fable 5.1',
    modelMark: 'claude',
  },
  eyebrow: 'Frontier Fable update',
  title: 'Claude Fable 5.1 moved the public Claude frontier, with Mythos 5.1 as the restricted twin',
  dek: 'Anthropic released Claude Fable 5.1 on September 1, 2026 as generally available GA: stronger coding and knowledge work than Fable 5, cheaper cache reads, and a restricted twin, Claude Mythos 5.1, that uses the same weights with looser cyber and life-sciences safeguards.',
  summary: 'Fable 5.1 and Mythos 5.1 are the same model with different safeguards. Fable 5.1 is the public API, AWS, GCP, and Azure release (claude-fable-5-1). Mythos 5.1 is trusted-access only for vetted cyberdefense and life-sciences work. Anthropic reports large gains over Fable 5 on Terminal-Bench-Science and cheaper typical/agentic workloads from a 75% cut in cache-read price.',
  impact: 'This is the first numbered Fable follow-up after the June 2026 Fable 5 launch and the later access freeze/restore. It puts a cheaper, more precise-safeguard Mythos-class model on the public Claude line, while keeping the unrestricted twin off general availability.',
  facts: [
    {
      label: 'Provider',
      value: 'Anthropic',
    },
    {
      label: 'Release date',
      value: 'September 1, 2026',
    },
    {
      label: 'Public model ID',
      value: 'claude-fable-5-1',
    },
    {
      label: 'Restricted twin',
      value: 'Claude Mythos 5.1 (same weights; trusted-access cyber and life sciences)',
    },
    {
      label: 'Context / max output',
      value: '1M tokens / 128K tokens',
    },
    {
      label: 'API pricing',
      value: '$10/M input; $50/M output; $0.25/M cache reads',
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
        'Anthropic says Fable 5.1 is its strongest generally available model for coding, knowledge work, and long-running problem-solving. Versus Fable 5 it reports 52.6% vs 24.7% on Terminal-Bench-Science 0.1, 55.8% vs 42.0% on Terminal-Bench 4.0, and 73.4% vs 70.5% on CursorBench 3.2.0. These are first-party launch numbers.',
        'Input and output prices stay at $10 and $50 per million tokens. Cache reads drop 75% to $0.25 per million, which Anthropic estimates as about 25% cheaper on typical workloads and up to about 45% on highly agentic ones. Context is 1M tokens with 128K max output.',
      ],
    },
    {
      heading: 'Mythos 5.1 is the same weights',
      body: [
        'Claude Mythos 5.1 is not a separate architecture. Anthropic says it is the same model as Fable 5.1 with more permissive cybersecurity and life-sciences safeguards, available only through trusted-access programs (Cyber Verification Program and Life Sciences Verification Program) rather than general GA.',
        'Fable 5.1 remains the public card. Dual-use cyber tasks such as exploit generation still fall back to Opus-class models; life-sciences R&D stays on the Mythos access path.',
      ],
    },
  ],
  sources: [
    {
      label: 'Anthropic: Claude Fable 5.1 and Claude Mythos 5.1',
      url: 'https://www.anthropic.com/claude-fable-and-mythos-5-1',
    },
    {
      label: 'Claude docs: Fable 5.1 overview',
      url: 'https://platform.claude.com/docs/en/models/fable-5-1/overview',
    },
  ],
};
