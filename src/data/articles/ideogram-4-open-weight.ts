import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'ideogram-4-open-weight',
  release: {
    companyId: 'ideogram',
    productLineId: 'ideogram-image',
    name: 'Ideogram 4.0',
    date: '2026-06-03',
  },
  logo: {
    modelLabel: 'Ideogram 4.0',
    modelMark: 'generic',
  },
  eyebrow: 'Open-weight image model',
  title: 'Ideogram 4.0 brought open weights to a typography-focused image model',
  dek: 'Ideogram released Ideogram 4.0 as a 9.3B open-weight image generation model with native 2K output, JSON prompting, bounding-box layout controls, color-palette control, and strong text rendering.',
  summary:
    'Ideogram 4.0 is the first open-weight release in the Ideogram line. It keeps the product family centered on typography and graphic-design control while adding downloadable gated weights for noncommercial research use.',
  impact:
    'For the timeline, Ideogram 4.0 is a major image-generation marker because it gives researchers and builders a compact open-weight model with practical layout, palette, and text controls rather than only prompt-based image synthesis.',
  facts: [
    {label: 'Provider', value: 'Ideogram'},
    {label: 'Release date', value: 'June 3, 2026'},
    {label: 'Model scale', value: '9.3B parameters'},
    {label: 'Output', value: 'Native 2K image generation'},
    {label: 'Controls', value: 'JSON prompting, bounding boxes, and color palettes'},
    {label: 'Access', value: 'Gated noncommercial open weights'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Earlier Ideogram releases were known for image generation with unusually strong rendered text. Ideogram 4.0 keeps that emphasis while adding a public open-weight checkpoint and more explicit composition controls.',
        'The release describes JSON prompting, bounding-box layout control, color-palette guidance, and native 2K generation, giving the model a more structured creative workflow than a plain text prompt alone.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'The open-weight release makes Ideogram a more visible competitor in the image-model ecosystem because teams can inspect and build around a 9.3B model instead of relying only on a hosted product surface.',
        'The license and access model are still gated and noncommercial, so this is better described as an open-weight release than as permissive open source.',
      ],
    },
  ],
  sources: [
    {
      label: 'Ideogram: Ideogram 4 repository',
      url: 'https://github.com/ideogram-oss/ideogram4',
    },
    {
      label: 'Ideogram docs: Available models',
      url: 'https://docs.ideogram.ai/using-ideogram/generation-settings/available-models',
    },
    {
      label: 'Ideogram: Introducing Ideogram 3.0',
      url: 'https://ideogram.ai/features/3.0',
    },
  ],
};
