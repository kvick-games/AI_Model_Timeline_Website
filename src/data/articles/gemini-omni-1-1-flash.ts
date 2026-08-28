import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gemini-omni-1-1-flash',
  release: {
    companyId: 'google',
    productLineId: 'google-omni',
    name: 'Gemini Omni 1.1 Flash',
    date: '2026-08-27',
  },
  logo: {
    modelLabel: 'Omni 1.1 Flash',
    modelMark: 'gemini',
  },
  eyebrow: 'Video Flash with studio controls',
  title: 'Gemini Omni 1.1 Flash added scene extension, keyframes, and 4K upscale',
  dek: 'Google DeepMind released Gemini Omni 1.1 Flash on August 27, 2026 as a named video-model bump: longer scene extension, first-and-last-frame interpolation, 360p drafts, 1080p/4K upscale, and short video references.',
  summary: 'Omni 1.1 Flash is the first numbered Flash line in the Gemini Omni family. Google says the model can read up to 10 seconds of prior footage (was the last second) and extend a scene in 10-second chunks out to 40 seconds. It also interpolates between first and last frames, accepts up to 3 seconds of video as a reference, and can draft at 360p then upscale to 1080p or 4K. The API id is gemini-omni-1.1-flash.',
  impact: 'The drop moved Omni from a 10-second API preview into longer, directed video production. Scene extension and keyframe control landed in the Gemini API, AI Studio, Flow, and the Gemini app on the same day.',
  facts: [
    {
      label: 'Provider',
      value: 'Google DeepMind',
    },
    {
      label: 'Release date',
      value: 'August 27, 2026',
    },
    {
      label: 'API model ID',
      value: 'gemini-omni-1.1-flash',
    },
    {
      label: 'Output',
      value: 'Generative video',
    },
    {
      label: 'Scene extension',
      value: 'Up to 10s prior context; 10s chunks to 40s total',
    },
    {
      label: 'New controls',
      value: 'First/last-frame interpolation; up to 3s video references',
    },
    {
      label: 'Resolutions',
      value: '360p drafts; 720p standard; 1080p and 4K upscale',
    },
    {
      label: 'Surfaces',
      value: 'Gemini API, Google AI Studio, Flow, Gemini app scene extension',
    },
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Google positioned Omni 1.1 Flash as production-ready creative control for developers. Scene extension now analyzes up to 10 seconds of prior context instead of only the last second, then continues the clip in 10-second increments up to 40 seconds total.',
        'First-and-last-frame interpolation generates the in-between for camera orbits, zooms, and loops. Drafts can run at 360p (Google claims up to 60% faster and about one-third the cost of 720p), then upscale to 1080p or 4K. Multimodal input can include up to three seconds of reference video.',
      ],
    },
    {
      heading: 'Where it landed',
      body: [
        'The model is live in the Gemini API and Google AI Studio under gemini-omni-1.1-flash, and on Gemini Enterprise Agent Platform. Google AI Plus, Pro, and Ultra subscribers get it in Flow the same day, with scene extension in the Gemini app.',
        'The companion Flow post lists start/end frames, 1080p/4K export, and cheap 360p drafts as the consumer-facing controls. Adobe Firefly, Figma Weave, GMI Cloud, and Runway are cited as already using Omni Flash in production.',
      ],
    },
  ],
  sources: [
    {
      label: 'Google: Build with Gemini Omni 1.1 Flash',
      url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/',
    },
    {
      label: 'Google Labs: New creative controls in Flow',
      url: 'https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/',
    },
  ],
};
