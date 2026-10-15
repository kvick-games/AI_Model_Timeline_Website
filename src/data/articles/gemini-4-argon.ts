import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-4-argon',
  release: {
    companyId: 'google',
    productLineId: 'google-gemini',
    name: 'Gemini 4 Argon',
    date: '2026-10-13',
  },
  logo: {
    modelLabel: 'Gemini 4 Argon',
    modelMark: 'gemini',
  },
  eyebrow: 'Google’s Gemini 4 flagship',
  title: 'Gemini 4 Argon became generally available as Google’s flagship reasoning model',
  dek: 'Gemini 4 Argon was announced on September 30, 2026 with access limited to the Fairwind Program, and reached general availability on October 13, 2026 in the Gemini API, AI Studio, and the Gemini app.',
  summary: 'Gemini 4 Argon (gemini-4-argon) is Google’s flagship reasoning model, built for complex software engineering, math and science, autonomous multi-step agents, and long decode. It takes text, image, video, audio, and PDF input, produces text output, and supports a 1M-token unified input-output limit through the Gemini API.',
  impact: 'Argon is the first Gemini 4 model on the timeline and the first non-Flash Gemini frontier release since the Gemini 3.x Flash run. It moves Google’s top reasoning model from a restricted Fairwind-only preview to broad developer and subscriber access.',
  facts: [
    {label: 'Provider', value: 'Google DeepMind'},
    {label: 'Announced', value: 'September 30, 2026 (Fairwind Program only)'},
    {label: 'General availability', value: 'October 13, 2026'},
    {label: 'Developer model ID', value: 'gemini-4-argon (Stable)'},
    {label: 'Context window', value: '1,048,576 tokens (unified input and output)'},
    {label: 'Maximum output', value: '65,536 tokens by default; up to 1,048,576 with long decode'},
    {label: 'Inputs / outputs', value: 'Text, image, video, audio, PDF in; text out'},
    {label: 'Thinking levels', value: 'Low, medium, high'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'The Gemini API release notes for October 13, 2026 list Gemini 4 Argon as generally available: Google’s most capable model for complex coding, agentic, math, and science tasks. The model page describes it as a flagship reasoning model for complex software engineering, deep mathematical and scientific problem solving, autonomous multi-step agents, and long decode up to 1M tokens.',
        'Per the model page, Argon supports function calling, structured outputs, code execution, search grounding, Grounding with Google Maps, file search, URL context, and computer use (Preview). Caching is implicit only. Audio generation, image generation, and the Live API are not supported. Batch, Flex, and Priority inference are available.',
      ],
    },
    {
      heading: 'Who can use it',
      body: [
        'Google’s GA post says Argon is available to developers and enterprises through the API in AI Studio and the Gemini platform, to Google AI Ultra subscribers in Google Antigravity, and to Google AI Ultra and Pro subscribers in the Gemini app and AI Mode in Search.',
        'Before general availability, access was limited to the Fairwind Program. Google says it is expanding that program to hundreds of additional partners, and cyber defenders can apply for access to Argon without cyber guardrails on a rolling basis.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: Gemini 4 Argon is now available for everyone',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/',
    },
    {
      label: 'Google: Gemini 4 Argon is now available in the Gemini app',
      url: 'https://blog.google/innovation-and-ai/products/gemini-app/gemini-4-argon-availability/',
    },
    {
      label: 'Gemini API: Gemini 4 Argon model page',
      url: 'https://ai.google.dev/gemini-api/docs/models/gemini-4-argon',
    },
    {
      label: 'Gemini API release notes (October 13, 2026)',
      url: 'https://ai.google.dev/gemini-api/docs/changelog',
    },
  ],
};
