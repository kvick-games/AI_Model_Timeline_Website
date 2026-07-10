import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'seedream-5-0-pro',
  release: {
    companyId: 'bytedance-seedance',
    productLineId: 'seedream-image',
    name: 'Seedream 5.0 Pro',
    date: '2026-07-08',
  },
  logo: {
    modelLabel: 'Seedream 5.0 Pro',
    modelMark: 'generic',
  },
  eyebrow: 'Professional image-generation model',
  title: 'Seedream 5.0 Pro put ByteDance into the GPT Image 2-class image race',
  dek: 'ByteDance Seed launched Seedream 5.0 Pro as a multimodal image model for complex infographics, precision editing, realistic textures, multilingual rendering, and production-grade visual assets.',
  summary:
    'Seedream 5.0 Pro is the professional follow-up to Seedream 5.0 Lite. Its launch pitch overlaps directly with the current frontier image-model battleground: text-heavy layouts, structured visual reasoning, high-quality editing, photorealistic output, and multilingual generation.',
  impact:
    'For the timeline, Seedream 5.0 Pro matters because it makes ByteDance a serious image-generation contender alongside GPT Image 2, Nano Banana, Ideogram, Midjourney, and Reve. The GPT Image 2 comparison is recorded as a competitive signal from feature overlap and early positioning, not as an independent benchmark verdict.',
  facts: [
    {label: 'Provider', value: 'ByteDance Seed'},
    {label: 'Release date', value: 'July 8, 2026'},
    {label: 'Model family', value: 'Seedream'},
    {label: 'Model tier', value: '5.0 Pro'},
    {label: 'Primary domain', value: 'Image generation and editing'},
    {label: 'Competitive frame', value: 'GPT Image 2-class production image model'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'ByteDance describes Seedream 5.0 Pro as a multimodal image-generation model with advanced reasoning, efficient content creation, and professional production capabilities.',
        'The release emphasizes dense infographic generation, text-rich commercial layouts, interactive precision editing, sketch rendering, layer separation, multi-image fusion, realistic lighting and portrait texture, and native multilingual input and generation.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'GPT Image 2 raised expectations for image systems that can generate immediately usable visuals instead of only attractive single images. Seedream 5.0 Pro is notable because ByteDance is aiming at the same professional surface: structured diagrams, localized copy, design edits, and production assets.',
        'The important timeline signal is not that Seedream has definitively beaten OpenAI, but that ByteDance is now competing in the same high-control image workflow category as GPT Image 2.',
      ],
    },
  ],
  sources: [
    {
      label: 'ByteDance Seed: Introducing Seedream 5.0 Pro',
      url: 'https://seed.bytedance.com/en/blog/beyond-generation-it-understands-design-introducing-seedream-5-0-pro',
    },
    {
      label: 'ByteDance Seed: Seedream 5.0 Pro model page',
      url: 'https://seed.bytedance.com/en/seedream5_0_pro',
    },
    {
      label: 'OpenAI: Introducing ChatGPT Images 2.0',
      url: 'https://openai.com/index/introducing-chatgpt-images-2-0/',
    },
    {
      label: 'OpenAI API: GPT Image 2 model page',
      url: 'https://developers.openai.com/api/docs/models/gpt-image-2',
    },
  ],
};
