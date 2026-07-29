import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-3-6-flash',
  release: {
    companyId: 'google',
    productLineId: 'google-gemini',
    name: 'Gemini 3.6 Flash',
    date: '2026-07-21',
  },
  logo: {
    modelLabel: 'Gemini 3.6 Flash',
    modelMark: 'gemini',
  },
  eyebrow: 'Efficient agentic Flash model',
  title: 'Gemini 3.6 Flash cut agent costs while improving code and multimodal work',
  dek: 'Google released Gemini 3.6 Flash on July 21, 2026 as a production-ready model for coding, agentic execution, knowledge work, and spatial reasoning, with lower output pricing than 3.5 Flash.',
  summary: 'Gemini 3.6 Flash pairs a 1M-token context window with stronger agentic and multimodal performance, fewer reasoning steps and tool calls, and a reduced $7.50-per-million output-token price.',
  impact: 'The release strengthens Google’s argument that the Flash tier can serve as the production workhorse for serious agents, improving quality and token efficiency without moving workloads to a slower premium model.',
  facts: [
    {
      label: 'Provider',
      value: 'Google',
    },
    {
      label: 'Release date',
      value: 'July 21, 2026',
    },
    {
      label: 'Developer model ID',
      value: 'gemini-3.6-flash',
    },
    {
      label: 'Context window',
      value: '1,048,576 input tokens',
    },
    {
      label: 'Maximum output',
      value: '65,536 tokens',
    },
    {
      label: 'Standard API pricing',
      value: '$1.50/M input tokens; $7.50/M output tokens',
    },
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Gemini 3.6 Flash improves coding, knowledge work, multimodal understanding, and multi-step agentic execution over 3.5 Flash while using fewer reasoning steps and tool calls.',
        'Google reports 17% fewer output tokens on the Artificial Analysis Index, a DeepSWE gain from 37% to 49%, and an OSWorld-Verified gain from 78.4% to 83.0% compared with Gemini 3.5 Flash.',
      ],
    },
    {
      heading: 'How it ships',
      body: [
        'The stable gemini-3.6-flash model is generally available through the Gemini API, Google AI Studio, Android Studio, Google Antigravity, Gemini Enterprise, and the Gemini app.',
        'It accepts text, images, video, audio, and PDFs, outputs text, supports thinking and computer use, and provides a 1M-token input window with up to 65,536 output tokens.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Google held standard input pricing at $1.50 per million tokens while cutting output pricing from Gemini 3.5 Flash’s $9 to $7.50, directly lowering the cost of reasoning-heavy agent loops.',
        'The release positions Flash as a balance of frontier-level intelligence, speed, and cost for production agents rather than merely a lightweight fallback tier.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: 3.6 Flash, 3.5 Flash-Lite, and 3.5 Flash Cyber',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/',
    },
    {
      label: 'Google AI for Developers: Gemini 3.6 Flash',
      url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash',
    },
    {
      label: 'Google AI for Developers: Gemini API pricing',
      url: 'https://ai.google.dev/gemini-api/docs/pricing',
    },
  ],
};
