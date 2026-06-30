import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-omni-flash-api-preview',
  release: {
    companyId: 'google',
    productLineId: 'google-omni',
    name: 'Gemini Omni Flash API preview',
    date: '2026-06-30',
  },
  logo: {
    modelLabel: 'Omni Flash API',
    modelMark: 'gemini',
  },
  eyebrow: 'Developer video preview',
  title: 'Gemini Omni Flash reached developers through the Gemini API and AI Studio',
  dek: 'Google DeepMind opened Gemini Omni Flash to developers on June 30, 2026, making the video generation and conversational editing model available in public preview.',
  summary:
    'Gemini Omni Flash had been introduced at Google I/O as the first Gemini Omni model. This June 30 update made the model available through Google AI Studio, the Gemini API, and Gemini Enterprise Agent Platform for high-quality video generation and natural-language video editing.',
  impact:
    'The deployment matters because it moved Gemini Omni from a product and demo surface into a developer platform, giving teams an API-accessible model for text-to-video, image-to-video, and conversational video editing.',
  facts: [
    {label: 'Provider', value: 'Google DeepMind'},
    {label: 'Developer availability', value: 'June 30, 2026'},
    {label: 'Model ID', value: 'gemini-omni-flash-preview'},
    {label: 'Status', value: 'Public preview'},
    {label: 'Output', value: 'Video with audio'},
    {label: 'API price', value: '$0.10 per second of video output'},
    {label: 'Developer surfaces', value: 'Google AI Studio, Gemini API, Gemini Enterprise Agent Platform'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Google made Gemini Omni Flash available to developers for the first time through Google AI Studio, the Gemini API, and Gemini Enterprise Agent Platform.',
        'The model supports video generation and conversational editing from combinations of text, image, and video inputs, with the Interactions API carrying session context for multi-turn edits.',
      ],
    },
    {
      heading: 'What it can do',
      body: [
        'Google describes Omni Flash as a high-speed multimodal model for cinematic control, native multimodality, conversational editing, and world-knowledge-guided video creation.',
        'The initial API preview supports 10-second generations, while Google notes some constraints around audio references, scene extension, longer durations, and video-reference processing.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'API availability turns Gemini Omni into infrastructure for creative tools instead of only a consumer-facing Gemini, Flow, or Shorts feature.',
        'Paired with Nano Banana 2 Lite, it gives Google a low-cost image-to-video pipeline for developers building fast generative media workflows.',
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
      label: 'Google AI for Developers: Gemini Omni Flash',
      url: 'https://ai.google.dev/gemini-api/docs/omni',
    },
  ],
};
