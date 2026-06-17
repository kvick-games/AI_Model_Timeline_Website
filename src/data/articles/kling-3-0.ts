import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'kling-3-0',
  release: {
    companyId: 'kuaishou-kling',
    productLineId: 'kling-video',
    name: 'Kling 3.0',
    date: '2026-02-05',
  },
  logo: {
    modelLabel: 'Kling 3.0',
    modelMark: 'generic',
  },
  eyebrow: 'Cinematic video generation model',
  title: 'Kling 3.0 turned Kuaishou into a full-stack video-generation lab',
  dek: 'Kuaishou launched Kling 3.0 as a cinematic video model with storyboard generation, stronger multimodal control, native audio-video continuity, and better reference consistency across longer creative workflows.',
  summary:
    'Kling 3.0 is the culmination of a fast model cadence that started with Kuaishou opening applications for Kling in June 2024, moved through the 1.5 and 1.6 quality upgrades, and then accelerated across the 2.x line with multimodal video generation, native audio, and unified editing controls.',
  impact:
    'For the timeline, Kling matters because Kuaishou made video generation a recurring frontier-model race rather than a one-off product demo. By the 3.0 launch, the series was competing on cinematic control, reference consistency, audio-video generation, and storyboard-level production workflow.',
  facts: [
    {label: 'Provider', value: 'Kuaishou'},
    {label: 'Release date', value: 'February 5, 2026'},
    {label: 'Model family', value: 'Kling'},
    {label: 'Predecessors', value: 'Kling 2.5 Turbo, Kling O1, and Kling Video 2.6'},
    {label: 'Modalities', value: 'Text, image, video, and audio-oriented generation controls'},
    {label: 'Focus', value: 'Storyboard, cinematic control, native audio-video, and reference consistency'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'The original Kling release gave Kuaishou a public text-to-video and image-to-video system, with applications opening on June 6, 2024 and wider beta access following that summer.',
        'Kling 1.5 and 1.6 improved generation quality and creative controls, while Kling 2.0 introduced MVL and pushed the line toward richer multimodal input, output, and editing workflows.',
        'The late-2025 releases made the shift more explicit: 2.5 Turbo focused on speed and quality, O1 unified video generation and editing into one multimodal model surface, and Video 2.6 added simultaneous audio-visual generation.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Kling 3.0 framed the series around cinematic production rather than isolated prompt-to-clip generation. Storyboard generation, stronger camera control, subject consistency, and reference handling made the product feel closer to a directed creative workflow.',
        'That puts Kling in the same timeline lane as Sora, Veo, Runway, Luma, Seedance, and LTX: the competitive question is no longer only whether a model can make a short clip, but whether it can preserve identity, motion, audio, and intent across a usable production sequence.',
      ],
    },
  ],
  sources: [
    {
      label: 'Kuaishou: Kling initial launch',
      url: 'https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-unveils-proprietary-video-generation-model-kling',
    },
    {
      label: 'Kuaishou: Kling global beta access',
      url: 'https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-launches-full-beta-testing-kling-ai-global-users-0/',
    },
    {
      label: 'Kuaishou: Kling 2.0 launch',
      url: 'https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-advances-20-era-empowering-everyone-tell-great-stories/',
    },
    {
      label: 'Kuaishou: Kling anniversary and 2.1 note',
      url: 'https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-celebrates-first-anniversary-achieves-annualized/',
    },
    {
      label: 'Kuaishou: Kling 2.5 Turbo launch',
      url: 'https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-25-turbo-video-model-industry-leading/',
    },
    {
      label: 'Kuaishou: Kling O1 launch',
      url: 'https://ir.kuaishou.com/news-releases/news-release-details/kling-o1-launches-worlds-first-unified-multimodal-video-model-0',
    },
    {
      label: 'Kuaishou: Kling Video 2.6 launch',
      url: 'https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-video-26-model-simultaneous-audio-visual',
    },
    {
      label: 'Kuaishou: Kling 3.0 launch',
      url: 'https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-30-model-ushering-era-where-everyone-can-be',
    },
    {
      label: 'The Decoder: Kling 1.5 update',
      url: 'https://the-decoder.com/ai-video-generator-kling-releases-version-1-5-with-impressive-features/',
    },
  ],
};
