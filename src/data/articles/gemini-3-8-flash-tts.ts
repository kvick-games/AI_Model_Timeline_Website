import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-3-8-flash-tts',
  release: {
    companyId: 'google',
    productLineId: 'google-voice',
    name: 'Gemini 3.8 Flash TTS',
    date: '2026-09-23',
  },
  logo: {
    modelLabel: 'Gemini 3.8 Flash TTS',
    modelMark: 'gemini',
  },
  eyebrow: 'Expressive generative text-to-speech',
  title: 'Gemini 3.8 Flash TTS turned voice generation into a creative studio',
  dek: 'Google released Gemini 3.8 Flash TTS on September 23, 2026 as its flagship creative text-to-speech model, with generative voice design, line-by-line performance control, and a #1 Hume Voice Design score.',
  summary:
    'Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`) is Google’s studio-grade expressive TTS model for character design, audiobooks, podcasts, and multi-speaker dialogue. It supports generative voice design from natural-language prompts, a 2,000+ voice library, voice replication from a 30-second sample with consent verification, SynthID watermarking, and C2PA credentials. Google AI Studio and the Gemini API expose it starting launch day; Gemini Enterprise API access was listed as coming soon.',
  impact:
    'This is Google’s generative-voice leap beyond static presets: creators can design bespoke voices and direct delivery line by line. On Hume AI’s Voice Design Benchmark it took the #1 overall spot (71.4) and led accent modeling (60.8), with a companion Flash-Lite TTS shipping the same day for high-volume workloads.',
  facts: [
    {label: 'Provider', value: 'Google'},
    {label: 'Release date', value: 'September 23, 2026'},
    {label: 'Developer model ID', value: 'gemini-3.8-flash-tts'},
    {label: 'Modalities', value: 'Text input → audio output'},
    {label: 'Languages', value: '130 languages (API docs)'},
    {label: 'Hume Voice Design', value: '#1 overall (71.4); #1 accent modeling (60.8)'},
    {label: 'Hume Overall Quality Index', value: '#1'},
    {label: 'Voice library', value: '2,000+ production-ready voices'},
    {label: 'Token limits', value: '8,192 input; 16,384 output'},
    {label: 'Availability', value: 'Gemini API, Google AI Studio; Google Vids; Gemini Enterprise API coming soon'},
    {label: 'Safety', value: 'Consent verification for replication; SynthID watermarking; C2PA credentials'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Google positions 3.8 Flash TTS for deep creative direction and character design: create voices from scratch with natural-language prompts across role, accent, and voice characteristics, then direct each line with acting cues, pacing, dialect shifts, and backchanneling. Features include long-form generation with minimal speaker drift, native two-speaker scene staging, and scripted vocal bursts.',
        'API docs list model code `gemini-3.8-flash-tts`, text-in/audio-out, an 8,192-token input limit and 16,384-token output limit, and support for prebuilt voices, the Extended Voice Library, custom Voice design personas, and voice replication. It shares the same API schema as Gemini 3.8 Flash-Lite TTS.',
      ],
    },
    {
      heading: 'Benchmarks and availability',
      body: [
        'Google reports #1 overall on Hume AI’s Voice Design Benchmark (71.4) and leadership in accent modeling (60.8), plus the #1 spot on Hume’s Overall Quality Index. Blind Voice Arena preference evals place Flash and Flash-Lite TTS at top positions in several global languages, including Japanese, Brazilian Portuguese, Vietnamese, MSA Arabic, Mexican Spanish, and Hindi.',
        'Developers can use the models in Google AI Studio’s audio playground and the Gemini API on launch day. Google Vids access is listed for everyone; Gemini Enterprise API access was listed as coming soon. Voice replication through AI Studio is unavailable in Illinois, Texas, EEA, UK, Switzerland, and India.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: Gemini 3.8 text-to-speech says hello',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/',
    },
    {
      label: 'Gemini API: Gemini 3.8 Flash TTS',
      url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-tts',
    },
  ],
};
