import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'qwen-image-3-0',
  release: {
    companyId: 'qwen',
    productLineId: 'qwen-image',
    name: 'Qwen-Image-3.0',
    date: '2026-07-22',
  },
  logo: {
    modelLabel: 'Qwen-Image-3.0',
    modelMark: 'generic',
  },
  eyebrow: 'Third-generation image model',
  title: 'Qwen-Image-3.0 targeted useful, information-dense image generation',
  dek: 'Alibaba Qwen launched its third-generation foundational image model with longer prompts, finer text and texture rendering, multilingual output, and knowledge-rich layouts aimed at production work.',
  summary:
    'Qwen-Image-3.0 centers its release on “Real”: rich content, authentic details, and deep knowledge. Qwen says the model can follow prompts up to 4.5k tokens, render text as small as 10 pixels, and natively produce content in 12 languages.',
  impact:
    'For the timeline, Qwen-Image-3.0 matters because Alibaba is pushing image generation beyond attractive standalone pictures toward dense, usable artifacts such as newspapers, storyboards, exam papers, infographics, and interface mockups.',
  facts: [
    {label: 'Provider', value: 'Alibaba Qwen'},
    {label: 'Release date', value: 'July 22, 2026'},
    {label: 'Model family', value: 'Qwen-Image'},
    {label: 'Model generation', value: '3.0'},
    {label: 'Prompt length', value: 'Up to 4.5k tokens'},
    {label: 'Native text rendering', value: '12 languages'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Qwen organizes the release around three capabilities: rich content, authentic details, and deep knowledge. The longer instruction window is designed for complex compositions with many independent elements, including grids of infographics and deeply nested interfaces.',
        'The launch examples emphasize small text, formulas, multilingual copy, lifelike textures, interface simulation, more than 100 artistic styles, and image editing that preserves the source style while adding or restoring fine detail.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'The competitive target is productivity rather than image aesthetics alone. Qwen positions the model for design, content creation, education, and e-commerce tasks where layout, readable text, factual structure, and editing control determine whether an output is actually usable.',
        'The release also gives Alibaba a dedicated frontier image lane alongside its Qwen language models and Wan video models, broadening the company’s creative-model footprint on the timeline.',
      ],
    },
  ],
  sources: [
    {
      label: 'Alibaba Qwen: Qwen-Image-3.0 announcement on X',
      url: 'https://x.com/Alibaba_Qwen/status/2079906336381509659',
    },
    {
      label: 'Qwen: Qwen-Image-3.0 — Rich Content, Authentic Details, Deep Knowledge',
      url: 'https://qwen.ai/blog?id=qwen-image-3.0',
    },
  ],
};
