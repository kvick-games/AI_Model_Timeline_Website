import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-3-7-flash',
  release: {
    companyId: 'google',
    productLineId: 'google-gemini',
    name: 'Gemini 3.7 Flash',
    date: '2026-08-13',
  },
  logo: {
    modelLabel: 'Gemini 3.7 Flash',
    modelMark: 'gemini',
  },
  eyebrow: 'Google’s agentic Flash workhorse',
  title: 'Gemini 3.7 Flash raised the ceiling for fast coding agents',
  dek: 'Google released Gemini 3.7 Flash on August 13, 2026 as a production-ready model for complex coding, web development, knowledge work, and reliable multi-step agents.',
  summary: 'Gemini 3.7 Flash combines a 1M-token context window, multimodal input, tunable reasoning, built-in tools, and stronger agentic execution at introductory pricing of $0.75 per million input tokens and $3.75 per million output tokens.',
  impact: 'The release pushes the Flash tier deeper into work previously reserved for larger models, giving developers a faster and less expensive option for long-running coding and agent workflows.',
  facts: [
    {
      label: 'Provider',
      value: 'Google',
    },
    {
      label: 'Release date',
      value: 'August 13, 2026',
    },
    {
      label: 'Developer model ID',
      value: 'gemini-3.7-flash',
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
      label: 'Introductory API pricing',
      value: '$0.75/M input; $3.75/M output through December 31, 2026',
    },
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Gemini 3.7 Flash improves real-world software engineering, agentic workflows, and web development, with a particular focus on completing multi-step work reliably and recovering from roadblocks.',
        'Google also highlights stronger design parity: the model can generate interfaces from design mocks and audit existing implementations against those references more accurately.',
      ],
    },
    {
      heading: 'How it ships',
      body: [
        'The stable gemini-3.7-flash endpoint is generally available and ready for production use. It accepts text, images, video, audio, and PDFs and returns text.',
        'Developers can select low, medium, or high thinking effort. The model supports code execution, computer use in preview, file search, function calling, Maps and Search grounding, structured outputs, caching, and URL context.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Google describes 3.7 Flash as its most intelligent workhorse model yet for coding and agents, positioning the fast tier as a primary production model rather than a lightweight fallback.',
        'Its introductory price is half the standard rate planned after December 31, 2026, making the launch especially aggressive for teams evaluating high-volume agent workloads.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google AI for Developers: Gemini 3.7 Flash release notes',
      url: 'https://ai.google.dev/gemini-api/docs/changelog',
    },
    {
      label: 'Google AI for Developers: Gemini 3.7 Flash',
      url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash',
    },
    {
      label: 'Google AI for Developers: What’s new in Gemini 3.7 Flash',
      url: 'https://ai.google.dev/gemini-api/docs/latest-model',
    },
    {
      label: 'Google DeepMind: Gemini 3.7 Flash',
      url: 'https://deepmind.google/models/gemini/flash/',
    },
  ],
};
