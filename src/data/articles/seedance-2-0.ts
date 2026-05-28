import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'seedance-2-0',
  release: {
    companyId: 'bytedance-seedance',
    productLineId: 'seedance-video',
    name: 'Seedance 2.0',
    date: '2026-02-12',
  },
  logo: {
    modelLabel: 'Seedance 2.0',
    modelMark: 'generic',
  },
  eyebrow: 'Unified multimodal video model',
  title: 'Seedance 2.0 made ByteDance a top-tier video model contender',
  dek: 'ByteDance Seed launched Seedance 2.0 as a unified multimodal audio-video model that accepts text, image, audio, and video inputs for controllable video creation.',
  summary:
    'Seedance 2.0 is the main-line follow-up to Seedance 1.0 and Seedance 1.5 Pro. It shifts the family from fast visual video generation and native audio-video synthesis into broader multimodal reference, editing, continuation, and synchronized audio-video workflows.',
  impact:
    'For the timeline, Seedance 2.0 belongs beside Sora, Veo, Kling, Runway, and LTX because it marks ByteDance becoming a serious frontier video lab, with model capabilities centered on mixed references, complex motion, controllability, and native sound.',
  facts: [
    {label: 'Provider', value: 'ByteDance Seed'},
    {label: 'Release date', value: 'February 12, 2026'},
    {label: 'Model family', value: 'Seedance'},
    {label: 'Modalities', value: 'Text, image, audio, and video inputs'},
    {label: 'Output', value: '15-second multi-shot audio-video with dual-channel audio'},
    {label: 'Predecessor', value: 'Seedance 1.5 Pro'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Seedance 2.0 uses a unified multimodal audio-video joint generation architecture instead of treating video, references, editing, and sound as separate steps.',
        'ByteDance says the model can combine natural language with multiple image, video, and audio references, then use those inputs for composition, motion, camera movement, visual effects, audio, editing, and video continuation.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'The Seedance line moved quickly: Seedance 1.0 focused on multi-shot visual video, Seedance 1.5 Pro added native joint audio-video generation, and Seedance 2.0 unified those capabilities around richer multimodal control.',
        'That makes Seedance 2.0 an important video-generation milestone rather than just an incremental version bump. It reflects the shift from prompt-only clips toward director-style creative systems that can use reference assets, generate sound, extend shots, and edit existing video.',
      ],
    },
  ],
  sources: [
    {
      label: 'ByteDance Seed: Seedance 2.0 official launch',
      url: 'https://seed.bytedance.com/en/blog/seedance-2-0-official-launch',
    },
    {
      label: 'ByteDance Seed: Seedance 2.0 model page',
      url: 'https://seed.bytedance.com/en/seedance2_0',
    },
    {
      label: 'ByteDance Seed: Seedance 1.5 Pro official release',
      url: 'https://seed.bytedance.com/en/blog/sound-and-vision-all-in-one-take-the-official-release-of-seedance-1-5-pro',
    },
    {
      label: 'ByteDance Seed: Seedance 1.0 technical report',
      url: 'https://seed.bytedance.com/en/public_papers/seedance-1-0-exploring-the-boundaries-of-video-generation-models',
    },
  ],
};
