import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'nano-banana-2-lite',
  release: {
    companyId: 'google',
    productLineId: 'google-image',
    name: 'Nano Banana 2 Lite',
    date: '2026-06-30',
  },
  logo: {
    modelLabel: 'Nano Banana 2 Lite',
    modelMark: 'gemini',
  },
  eyebrow: 'Fast Gemini Image model',
  title: 'Nano Banana 2 Lite pushed Google image generation toward speed and scale',
  dek: 'Google DeepMind released Nano Banana 2 Lite on June 30, 2026 as its fastest, lowest-cost Gemini Image model for high-throughput generation and editing.',
  summary:
    'Nano Banana 2 Lite is the Gemini 3.1 Flash Lite Image model, exposed through the gemini-3.1-flash-lite-image API ID. Google positioned it as the fast, cost-efficient member of the Nano Banana family for developer pipelines and consumer product rollouts.',
  impact:
    'The release matters because it turns Google image generation into a cheaper, lower-latency building block for apps that need many iterative images rather than one premium creative output.',
  facts: [
    {label: 'Provider', value: 'Google DeepMind'},
    {label: 'Release date', value: 'June 30, 2026'},
    {label: 'Model ID', value: 'gemini-3.1-flash-lite-image'},
    {label: 'Status', value: 'Generally available'},
    {label: 'Latency', value: 'About 4 seconds per 1K image'},
    {label: 'API price', value: '$0.034 per 1K-resolution image'},
    {label: 'Developer surfaces', value: 'Google AI Studio, Gemini API, Gemini Enterprise Agent Platform'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Google introduced Nano Banana 2 Lite as the fastest and most cost-efficient image model in the Nano Banana family, built for high-throughput workflows where latency and cost matter most.',
        'The model is available in Google AI Studio, the Gemini API, and Gemini Enterprise Agent Platform, and Google said it is rolling out across consumer surfaces including AI Mode in Search, Gemini, NotebookLM, Google Photos, Stitch, Flow, and Google Ads.',
      ],
    },
    {
      heading: 'How it fits the family',
      body: [
        'Google frames Nano Banana 2 Lite as the speed-first Gemini 3.1 Flash Lite Image option, while Nano Banana 2 remains the generalist Gemini 3.1 Flash Image model and Nano Banana Pro remains the premium Gemini 3 Pro Image model.',
        'The developer docs recommend moving legacy Nano Banana users from gemini-2.5-flash-image to gemini-3.1-flash-lite-image for faster generation and lower pricing.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'The release gives developers a practical image model for high-volume drafting, social apps, ads, design exploration, and agent workflows that need to generate or edit images repeatedly.',
        'It also pairs with Gemini Omni Flash: Google highlighted workflows where Nano Banana 2 Lite creates a fast reference image and Omni turns that image into video.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google DeepMind on X: Nano Banana 2 Lite and Gemini Omni Flash',
      url: 'https://x.com/GoogleDeepMind/status/2071988044878516466',
    },
    {
      label: 'Google: Start building with Nano Banana 2 Lite and Gemini Omni Flash',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/',
    },
    {
      label: 'Google AI for Developers: Nano Banana image generation',
      url: 'https://ai.google.dev/gemini-api/docs/image-generation',
    },
  ],
};
