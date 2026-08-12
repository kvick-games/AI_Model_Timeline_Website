import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'grok-4-6',
  release: {
    companyId: 'xai',
    productLineId: 'xai-grok',
    name: 'Grok 4.6',
    date: '2026-08-12',
  },
  logo: {
    modelLabel: 'Grok 4.6',
    modelMark: 'xai',
  },
  eyebrow: 'Long-horizon agent and coding flagship',
  title: 'Grok 4.6 pushed the Grok line toward longer, more ambitious agent work',
  dek: 'SpaceXAI released Grok 4.6 on August 12, 2026 with a 500,000-token context window, configurable reasoning, and a stronger focus on sustained coding, research, and interactive visual projects.',
  summary:
    'Grok 4.6 builds on Grok 4.5 with additional training for multi-step agentic work. SpaceXAI positioned the model as its new general flagship for coding and knowledge work, emphasizing longer task trajectories, self-testing, and stronger first passes on visual and interactive applications.',
  impact:
    'The release matters because it turns the rapid Grok 4.x cadence into a clearer agent platform strategy. Grok 4.6 launched across the API, Grok Build, Cursor, and partner platforms at the same base token price as Grok 4.5, giving developers a direct upgrade for long-running software and knowledge-work agents.',
  facts: [
    {label: 'Provider', value: 'SpaceXAI'},
    {label: 'Release date', value: 'August 12, 2026'},
    {label: 'API model', value: 'grok-4.6'},
    {label: 'Context window', value: '500,000 tokens'},
    {label: 'Reasoning', value: 'Configurable'},
    {label: 'Input price', value: '$2 per million tokens'},
    {label: 'Output price', value: '$6 per million tokens'},
    {label: 'Initial availability', value: 'API, Grok Build, Cursor, OpenRouter, Vercel, and Cloudflare'},
  ],
  sections: [
    {
      heading: 'What changed from Grok 4.5',
      body: [
        'SpaceXAI gave Grok 4.6 a longer supplemental training run using curated model-generated reasoning and technical data, high-quality engineering data, and an updated optimizer and training recipe. Grok 4.5 then regenerated supervised fine-tuning trajectories across reasoning efforts, agent harnesses, STEM, software engineering, and knowledge work.',
        'The company also expanded agentic reinforcement learning into general coding, knowledge work, kernel optimization, web development, and computer-aided design. The intended result is a model that stays with complex tasks across more steps and verifies more of its own work before moving on.',
      ],
    },
    {
      heading: 'Coding, visual work, and long trajectories',
      body: [
        'SpaceXAI highlighted broad product-building tasks rather than isolated coding exercises. Its release material says Grok 4.6 can research an unfamiliar domain, structure an application, implement core interactions, and refine the result through multiple feedback rounds.',
        'The company also reported stronger first passes on visual and interactive projects than Grok 4.5, framing 4.6 as useful for turning a broad product idea into a substantial working version before iterating.',
      ],
    },
    {
      heading: 'Availability and benchmark position',
      body: [
        'Grok 4.6 launched in the SpaceXAI API, Grok Build, Cursor, OpenRouter, Vercel, and Cloudflare. Base API pricing starts at $2 per million input tokens and $6 per million output tokens; a faster variant costs twice as much.',
        'On SpaceXAI\'s reported evaluations, Grok 4.6 scored 61 on the Artificial Analysis Intelligence Index, matching GPT-5.6 Sol in the comparison shown at launch. It also improved over Grok 4.5 across the listed coding and knowledge-work benchmarks, though these remain vendor-reported launch results.',
      ],
    },
  ],
  sources: [
    {
      label: 'SpaceXAI: Introducing Grok 4.6',
      url: 'https://x.ai/news/grok-4-6',
    },
    {
      label: 'SpaceXAI Docs: Models and Grok 4.6 API details',
      url: 'https://docs.x.ai/developers/models',
    },
  ],
};
