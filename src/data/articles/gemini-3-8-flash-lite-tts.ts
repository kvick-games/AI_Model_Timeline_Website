import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-3-8-flash-lite-tts',
  release: {
    companyId: 'google',
    productLineId: 'google-voice',
    name: 'Gemini 3.8 Flash-Lite TTS',
    date: '2026-09-23',
  },
  logo: {
    modelLabel: 'Gemini 3.8 Flash-Lite TTS',
    modelMark: 'gemini',
  },
  eyebrow: 'High-volume expressive TTS',
  title: 'Gemini 3.8 Flash-Lite TTS shipped as the cost-efficient companion to Flash TTS',
  dek: 'Google released Gemini 3.8 Flash-Lite TTS on September 23, 2026 as the high-throughput, cost-efficient text-to-speech workhorse alongside flagship Gemini 3.8 Flash TTS.',
  summary:
    'Gemini 3.8 Flash-Lite TTS (`gemini-3.8-flash-lite-tts`) is optimized for high-volume dubbing, audio content creation, and expressive voice agents with fine-grained control over tone, pacing, and nuance. It shares the same API schema as Flash TTS, supports 101 languages, and is positioned as the replacement for `gemini-3.1-flash-tts-preview`. Google AI Studio and the Gemini API expose it on launch day; Google Vids access is listed for everyone.',
  impact:
    'Same-day with Flash TTS, Flash-Lite fills the production scale lane: lower latency and cost for bulk and real-time voice workloads while still ranking #2 on Hume AI’s Overall Quality Index. Developers can switch between the two models with a single parameter change.',
  facts: [
    {label: 'Provider', value: 'Google'},
    {label: 'Release date', value: 'September 23, 2026'},
    {label: 'Developer model ID', value: 'gemini-3.8-flash-lite-tts'},
    {label: 'Modalities', value: 'Text input → audio output'},
    {label: 'Languages', value: '101 languages (API docs)'},
    {label: 'Hume Overall Quality Index', value: '#2'},
    {label: 'Primary strength', value: 'High throughput, low latency, cost efficiency'},
    {label: 'Replaces', value: 'gemini-3.1-flash-tts-preview'},
    {label: 'Token limits', value: '8,192 input; 16,384 output'},
    {label: 'Availability', value: 'Gemini API, Google AI Studio; Google Vids; Gemini Enterprise API coming soon'},
    {label: 'Safety', value: 'SynthID watermarking on Gemini Audio outputs; consent verification for voice replication'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Google frames Flash-Lite TTS for high-volume, cost-efficient scale: dubbing, audio content creation, read-aloud features, voice replication, and everyday single-speaker generation, with fine-grained control over tone, pacing, and expressive nuance.',
        'API docs list model code `gemini-3.8-flash-lite-tts`, the same structured prompting schema as `gemini-3.8-flash-tts`, text-in/audio-out, 8,192 input / 16,384 output token limits, and support for prebuilt voices, the Extended Voice Library, custom Voice design personas, and voice replication.',
      ],
    },
    {
      heading: 'How it sits next to Flash TTS',
      body: [
        'Flash TTS is the creative flagship (130 languages; maximum fidelity and acting nuance). Flash-Lite TTS is the workhorse (101 languages; throughput and cost). Google reports Flash and Flash-Lite TTS at #1 and #2 on Hume’s Overall Quality Index respectively, with major gains versus Gemini 3.1 Flash TTS on long-form and dual-speaker control.',
        'Both models roll out in the Gemini API and Google AI Studio starting September 23, 2026. Google Vids access is listed for everyone; Gemini Enterprise API access was listed as coming soon.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: Gemini 3.8 text-to-speech says hello',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/',
    },
    {
      label: 'Gemini API: Gemini 3.8 Flash-Lite TTS',
      url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-lite-tts',
    },
  ],
};
