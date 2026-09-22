import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'grok-4-7',
  release: {
    companyId: 'xai',
    productLineId: 'xai-grok',
    name: 'Grok 4.7',
    date: '2026-09-21',
  },
  logo: {
    modelLabel: 'Grok 4.7',
    modelMark: 'xai',
  },
  eyebrow: 'Larger-base frontier coding and knowledge flagship',
  title: 'Grok 4.7 shipped a larger base model at the same price as Grok 4.6',
  dek: 'SpaceXAI released Grok 4.7 on September 21, 2026 as its most capable model for coding and knowledge work, with a larger base than Grok 4.6, a 500,000-token context window, and the same $2/$6 per million token pricing.',
  summary:
    'Grok 4.7 uses a new, larger base model than Grok 4.6 and a longer reinforcement-learning run weighted toward multi-hour tasks. It is available in Cursor, Grok Build, and the Grok API as grok-4.7, with modalities text and image to text, configurable reasoning efforts through xhigh, and a new safeguard stack SpaceXAI positions as its strongest to date on refusals and jailbreak resistance.',
  impact:
    'The release keeps the Grok 4.x cadence on the frontier while holding price flat versus 4.6. Vendors reported gains on longer-running coding and knowledge-work benchmarks, and same-day availability across Cursor, Grok Build, and the API makes it a direct drop-in upgrade for agent harnesses already on grok-4.6.',
  facts: [
    {label: 'Provider', value: 'SpaceXAI'},
    {label: 'Release date', value: 'September 21, 2026'},
    {label: 'API model', value: 'grok-4.7'},
    {label: 'Context window', value: '500,000 tokens'},
    {label: 'Modalities', value: 'Text and image → text'},
    {label: 'Reasoning efforts', value: 'low, medium, high (default), xhigh'},
    {label: 'Input price', value: '$2 per million tokens (<200k prompt; $4 at ≥200k)'},
    {label: 'Output price', value: '$6 per million tokens (<200k prompt; $12 at ≥200k)'},
    {label: 'Initial availability', value: 'Cursor, Grok Build, Grok API, third-party harnesses and routers'},
  ],
  sections: [
    {
      heading: 'What changed from Grok 4.6',
      body: [
        'SpaceXAI says Grok 4.7 is built on a new, larger base model than Grok 4.6 and trained with a longer reinforcement-learning run on a harder mix of tasks, weighted toward problems that take many hours. The company also trained the model to natively understand the Grok Bot harness for conversational and general knowledge-work tasks.',
        'Launch comparisons emphasize longer-horizon coding and professional knowledge work. On CursorBench 4.0, SpaceXAI reports Grok 4.7 at 46.3% versus 40.4% for Grok 4.6 High, with additional reported gains on DeepSWE, EEBench, AA Briefcase, and Terminal-Bench.',
      ],
    },
    {
      heading: 'Pricing, variants, and safety',
      body: [
        'Base API pricing matches Grok 4.6 at $2 per million input tokens and $6 per million output tokens for prompts under 200k tokens, with higher rates above that threshold. A fast variant is served at twice the output speed and twice the price.',
        'SpaceXAI describes an entirely new safeguard stack for Grok 4.7, claiming stronger refusals and jailbreak resistance plus leading dual-use balance on cybersecurity and biosafety evaluations. Select cybersecurity partners also received invite-only access to red-team capabilities for defense research.',
      ],
    },
  ],
  sources: [
    {
      label: 'SpaceXAI: Introducing Grok 4.7',
      url: 'https://x.ai/news/grok-4-7',
    },
    {
      label: 'SpaceXAI Docs: Grok 4.7',
      url: 'https://docs.x.ai/developers/models/grok-4.7',
    },
    {
      label: 'SpaceXAI Docs: Models',
      url: 'https://docs.x.ai/developers/models',
    },
  ],
};
