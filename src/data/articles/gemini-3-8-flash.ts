import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-3-8-flash',
  release: {
    companyId: 'google',
    productLineId: 'google-gemini',
    name: 'Gemini 3.8 Flash',
    date: '2026-09-02',
  },
  logo: {
    modelLabel: 'Gemini 3.8 Flash',
    modelMark: 'gemini',
  },
  eyebrow: 'Google’s next Flash workhorse',
  title: 'Gemini 3.8 Flash raised the Flash bar for coding and long-horizon agents',
  dek: 'Google released Gemini 3.8 Flash on September 2, 2026 as its most intelligent Flash workhorse, with the same introductory price as 3.7 Flash and a specialized Cyber twin kept off general availability.',
  summary: 'Gemini 3.8 Flash is the successor to Gemini 3.7 Flash. Google positions it for software engineering, agentic tasks, and multi-step reasoning at Flash speed. It is generally available in the Gemini app, Google AI Studio, and the Gemini API under model-id gemini-3.8-flash, with a 1M-token input window and 64k max output.',
  impact: 'This is the third Flash drop in six weeks. It keeps the cheap Flash lane competitive with larger frontier models on long-horizon coding and professional-agent benchmarks, while Gemini 3.8 Flash Cyber stays a trusted-defender specialist rather than a second public card.',
  facts: [
    {label: 'Provider', value: 'Google'},
    {label: 'Release date', value: 'September 2, 2026'},
    {label: 'Developer model ID', value: 'gemini-3.8-flash'},
    {label: 'Context window', value: '1M input tokens'},
    {label: 'Maximum output', value: '64k tokens'},
    {label: 'Introductory API pricing', value: '$0.75/M input; $3.75/M output through December 31, 2026'},
    {label: 'Specialized twin', value: 'Gemini 3.8 Flash Cyber (Fairwind Program; not generally available)'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Google’s blog frames 3.8 Flash as the most intelligent workhorse in the Flash line, with gains over 3.7 Flash on software engineering, agentic tasks, and multi-step reasoning. Introductory pricing matches 3.7 Flash: $0.75 per million input tokens and $3.75 per million output tokens through December 31, 2026, then $1.50 / $7.50.',
        'The DeepMind model card (published 2 September 2026) lists multimodal input (text, image, video, audio, PDF), text output, a 1M-token context window, 64k max output, and tool use including function calling, search, and computer use. Status on the Flash product page is general availability.',
      ],
    },
    {
      heading: 'Flash Cyber is not a second public card',
      body: [
        'Gemini 3.8 Flash Cyber is the same-day specialist twin for vulnerability detection and automated patching. Google says it is available to trusted defenders through the Fairwind Program, not as a general-availability consumer/API model.',
        'This timeline records one public Flash card. Cyber is noted here the way Mythos sits next to Fable: same launch, restricted access, not a separate default-board entry.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: Introducing Gemini 3.8 Flash and 3.8 Flash Cyber',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/',
    },
    {
      label: 'Google DeepMind: Gemini 3.8 Flash model card',
      url: 'https://deepmind.google/models/model-cards/gemini-3-8-flash/',
    },
    {
      label: 'Google DeepMind: Gemini 3.8 Flash',
      url: 'https://deepmind.google/models/gemini/flash/',
    },
  ],
};
