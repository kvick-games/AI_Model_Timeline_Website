import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-4-carbon',
  release: {
    companyId: 'google',
    productLineId: 'google-gemini',
    name: 'Gemini 4 Carbon',
    date: '2026-11-10',
  },
  logo: {
    modelLabel: 'Gemini 4 Carbon',
    modelMark: 'gemini',
  },
  eyebrow: 'Google’s strongest Gemini 4 model',
  title: 'Gemini 4 Carbon became generally available as Google’s strongest model',
  dek: 'Gemini 4 Carbon reached general availability on November 10, 2026 for paying developers and enterprises in the Gemini API and AI Studio, and for Google AI Ultra subscribers in the Gemini app, AI Mode in Search, and Google Antigravity.',
  summary: 'Gemini 4 Carbon (gemini-4-carbon) is Google’s strongest model, a step above Gemini 4 Argon, with frontier performance on long-horizon agentic workflows, software engineering, scientific reasoning, and cybersecurity. It takes text, image, video, audio, and PDF input, produces text output, and supports a 1M-token unified input-output limit through the Gemini API.',
  impact: 'Carbon is the second Gemini 4 model on the timeline and takes the top slot from Argon, which Google still recommends for the majority of software engineering and knowledge work. It moves Google’s strongest reasoning model from a Fairwind-limited cyber preview into broad paid-developer and Ultra-subscriber access.',
  facts: [
    {label: 'Provider', value: 'Google DeepMind'},
    {label: 'General availability', value: 'November 10, 2026'},
    {label: 'Developer model ID', value: 'gemini-4-carbon (Stable)'},
    {label: 'Context window', value: '1,048,576 tokens (unified input and output)'},
    {label: 'Maximum output', value: '65,536 tokens by default; up to 1,048,576 with long decode'},
    {label: 'Inputs / outputs', value: 'Text, image, video, audio, PDF in; text out'},
    {label: 'Thinking levels', value: 'Low, medium, high'},
    {label: 'API pricing', value: '$2/M input and $10/M output through November 30, 2026; then $4/M and $20/M'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Google’s November 10, 2026 announcement describes Gemini 4 Carbon as its strongest model, with frontier performance in cybersecurity and long-horizon agentic workflows across complex knowledge work, software engineering, and scientific reasoning. After the Gemini 4 Argon launch, Google says Carbon is built for tasks that test the limits of a model’s intelligence — such as complex, multi-step coding and debugging and open-ended scientific research — and uses more tokens than Argon to explore, reason, and run extended verification loops. Argon remains, in Google’s words, the ideal choice for the majority of software engineering and knowledge work.',
        'The Gemini API model page lists gemini-4-carbon as a stable model: Google’s most capable reasoning model for complex software engineering, mathematical and scientific problem solving, high factual accuracy, autonomous multi-step agents, and long decode up to 1M tokens. It supports function calling, structured outputs, code execution, search grounding, Grounding with Google Maps, file search, URL context, and computer use. Caching is implicit only. Audio generation, image generation, and the Live API are not supported. Batch, Flex, and Priority inference are available.',
      ],
    },
    {
      heading: 'Who can use it',
      body: [
        'Google’s GA post says Carbon is available via the API in Google AI Studio and Gemini for business for all paying developers and enterprises, at the same introductory price as Gemini 4 Argon: $2 per million input tokens and $10 per million output tokens. After the introductory period expires on November 30, 2026, the price becomes $4 and $20 per million tokens. It is also rolling out to all Google AI Ultra subscribers in Google Antigravity, the Gemini app, and AI Mode in Search.',
        'Two weeks before general availability, Google released Carbon to a set of cybersecurity defenders through the Fairwind Program. Cyber defenders can still apply to that program for access to Carbon for cyber. Google is also previewing /swarm in Antigravity, which turns a single prompt into a coordinated team of agents.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: Gemini 4 Carbon is now available',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/',
    },
    {
      label: 'Gemini API: Gemini 4 Carbon model page',
      url: 'https://ai.google.dev/gemini-api/docs/models/gemini-4-carbon',
    },
  ],
};
