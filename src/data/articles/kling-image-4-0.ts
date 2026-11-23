import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'kling-image-4-0',
  release: {
    companyId: 'kuaishou-kling',
    productLineId: 'kling-image',
    name: 'Kling Image 4.0',
    date: '2026-11-18',
  },
  logo: {
    modelLabel: 'Kling Image 4.0',
    modelMark: 'generic',
  },
  eyebrow: 'Native 8K image generation model',
  title: 'Kling Image 4.0 gave Kuaishou a dedicated 8K image model alongside its video line',
  dek: 'Kling AI released Kling Image 4.0 on November 18, 2026 as a next-generation image model with native 8K output, text rendering of up to 2,000 characters, and sets of up to 10 cohesive images from a single prompt.',
  summary:
    'Kling Image 4.0 is a separate image model from the Kling video line. Kling AI says it uses a native unified understanding and generation architecture in a single autoregressive framework, is live on Kling Creative Studio, and is available via API to enterprises and developers.',
  impact:
    'This is the first Kling image model on the timeline. It records a dedicated image product surface—native 8K, long-form layouts, and multi-image sets—rather than folding image work into the existing Kling video line.',
  facts: [
    {label: 'Provider', value: 'Kling AI / Kuaishou'},
    {label: 'Release date', value: 'November 18, 2026'},
    {label: 'Model family', value: 'Kling Image'},
    {label: 'Architecture', value: 'Native unified understanding and generation; autoregressive'},
    {label: 'Output', value: 'Native 8K image generation'},
    {label: 'Text in image', value: 'Up to 2,000 characters; 70+ preset fonts; seven languages'},
    {label: 'Image sets', value: 'Up to 10 images from a single prompt; long-form layouts'},
    {label: 'Availability', value: 'Kling Creative Studio for all users; API for enterprises and developers'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Kling AI’s November 18, 2026 launch post introduces Kling Image 4.0 as its next-generation AI image creation model, now live on Kling Creative Studio and available via API. The company says the model brings visual understanding and image generation together in a single autoregressive framework, and that it is available to all users.',
        'The post highlights three upgrades: enhanced realism with native 8K generation; text rendering of up to 2,000 characters in a single image, with prompts of up to 15,000 tokens, 70+ preset commercial fonts, and support for Simplified Chinese, Traditional Chinese, English, Japanese, Korean, Spanish, and Portuguese; and consistent image sets of up to 10 images from a single prompt, plus long-form images for e-commerce product pages and web design. It also lists 110+ preset color-grading styles and the option to extract a palette from a reference image.',
      ],
    },
    {
      heading: 'How it sits on the timeline',
      body: [
        'Kling’s existing timeline entries are video models, through Kling 3.0. Kling Image 4.0 is recorded on a separate image product line so the two surfaces stay distinct.',
        'A Kling AI press release on November 23, 2026 restated the same launch for a wider audience. The timeline date follows the official November 18 product blog, which is when Kling said the model was live and available to all users.',
      ],
    },
  ],
  sources: [
    {
      label: 'Kling AI: Meet Kling Image 4.0',
      url: 'https://kling.ai/blog/kling-image-4-stunningly-realistic-sharp-precise',
    },
    {
      label: 'Kling AI: Kling Image 4.0 press release (November 23, 2026)',
      url: 'https://www.globenewswire.com/news-release/2026/11/23/3408138/0/en/kling-ai-launches-kling-image-4-0-with-photographic-realism-and-native-8k-generation.html',
    },
  ],
};
