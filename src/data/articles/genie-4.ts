import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'genie-4',
  release: {
    companyId: 'google',
    productLineId: 'google-world-models',
    name: 'Genie 4',
    date: '2026-11-18',
  },
  logo: {
    modelLabel: 'Genie 4',
    modelMark: 'google',
  },
  eyebrow: 'Interactive world model, now public and in the Gemini API',
  title: 'Genie 4 moved from a limited research preview into Project Genie and the Gemini API',
  dek: 'Google DeepMind announced Genie 4 research on October 27, 2026 for trusted testers, opened it to eligible Google AI Ultra subscribers in Project Genie on November 18, and added it to the Gemini API and AI Studio on November 19.',
  summary:
    'Genie 4 (genie-4) is Google DeepMind’s real-time interactive world model, with mid-session text steering and synchronized native audio. The timeline date is November 18, 2026, when Google first called the model publicly available in Project Genie. The Gemini API followed one day later, offering 720p 24 fps worlds with 48 kHz stereo audio from a text prompt, a 16:9 reference image, or both.',
  impact:
    'Genie, Genie 2, and Genie 3 remain on the timeline as research releases. Genie 4 is the first Genie model recorded at public product availability rather than at the research announcement, because that is when it left a limited tester program and shipped in Project Genie and, the next day, the Gemini API.',
  facts: [
    {label: 'Provider', value: 'Google DeepMind'},
    {label: 'Research announcement', value: 'October 27, 2026 (limited trusted testers)'},
    {label: 'Public in Project Genie', value: 'November 18, 2026 (eligible Google AI Ultra)'},
    {label: 'Gemini API availability', value: 'November 19, 2026'},
    {label: 'Developer model ID', value: 'genie-4 (Stable)'},
    {label: 'Output', value: '720p (1280×720) 16:9 video at 24 fps, with 48 kHz stereo audio'},
    {label: 'Inputs', value: 'Text, a 16:9 reference image, or both; real-time keyboard and mid-session text'},
    {label: 'Session limit', value: 'Up to 120 seconds (Google says coherence is strongest in the first 45–90 seconds)'},
    {label: 'API pricing', value: '$1.50/M input; $9/M text output; $17.50/M video output (~$0.10/sec, audio included); paid tier only'},
  ],
  sections: [
    {
      heading: 'From preview to public launch',
      body: [
        'Google’s October 27, 2026 announcement described Genie 4 as a new world model for real-time interactive simulation, with unprecedented realism and native audio. The model incorporates Gemini Omni to anchor appearance and behavior, and other Gemini models for reasoning that helps keep a simulation coherent. At that point Google said it had started rolling the model out to a limited group of trusted testers, with access “coming soon” for Google AI Ultra subscribers in Project Genie and early access partners in the Gemini API and AI Studio.',
        'On November 18, 2026, Google posted that Genie 4 was now available: eligible Google AI Ultra subscribers could use it in a new Project Genie experience, with Google AI Pro members able to join a waitlist. Google calls Genie 4 its most realistic and interactive world model yet, with mid-session prompting to edit environments in real time and, for the first time in the series, real-time native audio that adapts as the scene unfolds. All Project Genie video and audio includes SynthID watermarking.',
      ],
    },
    {
      heading: 'Gemini API availability',
      body: [
        'On November 19, 2026, Google said that following the previous day’s launch, Genie 4 was available to developers through the Gemini API via the Interactions API, and in Google AI Studio. Developers can seed a world from text, a 16:9 reference image, or both, then steer a continuous 720p 24 fps stream with synchronized native audio using real-time keyboard controls and live text prompts.',
        'The Gemini API model page lists genie-4 as a stable, paid-tier-only model. Output is 1280×720 16:9 video at 24 fps with 48 kHz stereo audio. Sessions last up to 120 seconds, with visual coherence and object permanence described as strongest during the first 45–90 seconds. Official API pricing is $1.50 per million input tokens, $9.00 per million text output tokens, and $17.50 per million video output tokens, with audio bundled into the video rate, or about $0.10 per second.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: We’re announcing Genie 4 (October 27, 2026)',
      url: 'https://blog.google/innovation-and-ai/models-and-research/google-deepmind/introducing-genie-4/',
    },
    {
      label: 'Google: Genie 4 is now available in Project Genie (November 18, 2026)',
      url: 'https://blog.google/innovation-and-ai/models-and-research/google-deepmind/genie-4-now-available-project-genie/',
    },
    {
      label: 'Google: Genie 4 now available through the Gemini API (November 19, 2026)',
      url: 'https://blog.google/innovation-and-ai/technology/developers-tools/genie-4-in-gemini-api/',
    },
    {
      label: 'Gemini API: Genie 4 model page',
      url: 'https://ai.google.dev/gemini-api/docs/models/genie-4',
    },
  ],
};
