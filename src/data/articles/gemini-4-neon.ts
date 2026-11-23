import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-4-neon',
  release: {
    companyId: 'google',
    productLineId: 'google-gemini',
    name: 'Gemini 4 Neon',
    date: '2026-11-18',
  },
  logo: {
    modelLabel: 'Gemini 4 Neon',
    modelMark: 'gemini',
  },
  eyebrow: 'Faster, lower-cost Gemini 4 frontier model',
  title: 'Gemini 4 Neon became generally available as Google’s mid-family frontier model',
  dek: 'Gemini 4 Neon reached general availability on November 18, 2026 in the paid Gemini API and AI Studio, in Gemini for business, and for Google AI Pro and Ultra subscribers in Google Antigravity and the Gemini app.',
  summary: 'Gemini 4 Neon (gemini-4-neon) is a Gemini 4 frontier model built for fast end-to-end work across complex software engineering, knowledge work, and science. It takes text, image, video, audio, and PDF input, produces text output, and supports a 1M-token unified input-output limit, four thinking levels including a default of high plus xhigh, and API pricing of $3 per million input tokens and $15 per million output tokens.',
  impact: 'Neon is the third Gemini 4 model on the timeline. Google places it between Carbon, for the hardest long-horizon projects, and Hydrogen, for fast everyday execution, and prices it below Carbon for high-frequency frontier workflows.',
  facts: [
    {label: 'Provider', value: 'Google DeepMind'},
    {label: 'General availability', value: 'November 18, 2026'},
    {label: 'Developer model ID', value: 'gemini-4-neon (Stable)'},
    {label: 'Context window', value: '1,048,576 tokens (unified input and output)'},
    {label: 'Maximum output', value: '65,536 tokens by default; up to 1,048,576 with long decode'},
    {label: 'Inputs / outputs', value: 'Text, image, video, audio, PDF in; text out'},
    {label: 'Thinking levels', value: 'Low, medium, high (default), xhigh'},
    {label: 'API pricing', value: '$3/M input; $15/M output; $0.15/M cached input (implicit caching only); paid tier only'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Google’s November 18, 2026 announcement describes Gemini 4 Neon as bringing frontier-level intelligence with fast end-to-end task completion across complex software engineering, knowledge work, and science workflows. The Gemini API model page lists gemini-4-neon as a stable model with a unified 1,048,576-token context window, default synchronous output of 65,536 tokens, and long decode up to 1,048,576 tokens. It supports four thinking levels — low, medium, high (the default), and xhigh — and takes text, image, video, audio, and PDF input with text output.',
        'The model page lists function calling, structured outputs, code execution, search grounding, Grounding with Google Maps, file search, URL context, computer use, and tool retrieval. Caching is implicit only. Audio generation, image generation, and the Live API are not supported. Batch, Flex, and Priority inference are available. Official API pricing is $3 per million input tokens, $15 per million output tokens (including thinking tokens), and $0.15 per million cached input tokens; Neon is not available on the free tier.',
        'Google says Neon ranks #3 overall with a score of 61 on the Artificial Analysis Intelligence Index at its xhigh thinking level, #2 on the Vals Index, and #1 on the Artificial Analysis Coding Agent Index (58.6). At the default high thinking level, Google says it has a 32% lower cost per task than Carbon. These are first-party launch claims.',
      ],
    },
    {
      heading: 'Who can use it',
      body: [
        'Google’s launch post says Neon is rolling out in the Gemini API in Google AI Studio, in Gemini for business via the API and model dropdown, for paid Google AI Pro and Ultra subscribers in Google Antigravity, and for Pro and Ultra subscribers in the Gemini app. The model page and release notes confirm paid-tier API access only.',
        'Google places Neon between Gemini 4 Carbon, for the hardest long-horizon projects, and Gemini 4 Hydrogen, for fast everyday execution. In Google Antigravity, Neon can run standalone or act as an Orchestrator directing parallel Hydrogen subagents. A cyber-focused variant is rolling out to trusted defenders through the Fairwind Program.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: Introducing Gemini 4 Neon',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/',
    },
    {
      label: 'Gemini API: Gemini 4 Neon model page',
      url: 'https://ai.google.dev/gemini-api/docs/models/gemini-4-neon',
    },
    {
      label: 'Gemini API release notes (November 18, 2026)',
      url: 'https://ai.google.dev/gemini-api/docs/changelog',
    },
  ],
};
