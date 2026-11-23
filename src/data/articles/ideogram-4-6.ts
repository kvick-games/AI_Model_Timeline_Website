import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'ideogram-4-6',
  release: {
    companyId: 'ideogram',
    productLineId: 'ideogram-image',
    name: 'Ideogram 4.6',
    date: '2026-11-19',
  },
  logo: {
    modelLabel: 'Ideogram 4.6',
    modelMark: 'generic',
  },
  eyebrow: 'Native 4K image generation and precise editing',
  title: 'Ideogram 4.6 added native 4K generation and a precise multi-turn editing model',
  dek: 'Ideogram released Ideogram 4.6 on November 19, 2026 as an image generation and editing model with native 4K output, Generate and Precise Edit API endpoints, and official API prices starting at $0.008 per image.',
  summary:
    'Ideogram 4.6 is built for precise, multi-turn edits and new image generation at up to 4K, without upscaling. The official model page lists quality modes from Very low to High, up to five reference images on Generate, an optional mask on Precise Edit, and a first-place Rapidata Multi-step Image Edit score of 1,892 in the November 17, 2026 snapshot Ideogram published.',
  impact:
    'The timeline previously stopped at Ideogram 4.0, the typography-focused open-weight release. Ideogram 4.6 is a later hosted and API model in the same family, centered on precise editing and native 4K rather than on downloadable weights.',
  facts: [
    {label: 'Provider', value: 'Ideogram'},
    {label: 'Release date', value: 'November 19, 2026'},
    {label: 'Model family', value: 'Ideogram'},
    {label: 'Output', value: 'Native 2K or 4K (Very low quality supports up to 2K); no upscaling'},
    {label: 'API endpoints', value: 'Generate and Precise Edit'},
    {label: 'Quality modes', value: 'Very low, Low, Medium, High'},
    {label: 'References and masks', value: 'Up to five reference images on Generate; optional mask on Precise Edit'},
    {label: 'API pricing', value: 'From $0.008/image (Very low, 2K) to $0.60/image (High quality Precise Edit, 4K)'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Ideogram’s model page says Ideogram 4.6 was released on November 19, 2026, and that it brings Generate and Precise Edit endpoints to API workflows. The model is described as an image generation and editing system for precise creative control, with output up to 4K generated natively rather than upscaled. Users can make a focused change, review the result, and keep refining the same image across multiple turns.',
        'Official API pricing, in USD per image, is $0.008 at Very low quality for both generate and edit at up to 2K (4K is not offered in that mode); Low is $0.03 / $0.06 for 2K / 4K generate or edit; Medium is $0.06 / $0.12 for generate and $0.06 / $0.20 for edit; High is $0.10 / $0.20 for generate and $0.22 / $0.60 for edit. Edit pricing covers Precise Edit and Generate with reference images. 4K covers outputs up to 4096×4096 pixels; anything at 2K or below is billed at the 2K price.',
      ],
    },
    {
      heading: 'How Ideogram presents the results',
      body: [
        'The official page says Ideogram 4.6 ranks first on Rapidata’s Multi-step Image Edit benchmark with a score of 1,892, ahead of Ideogram 4.5 at 1,866, in a leaderboard snapshot from November 17, 2026. The evaluated configuration is Ideogram 4.6 Precise Edit at High quality. These are third-party scores as published by Ideogram, not independent scores collected for this timeline.',
        'On five first-party High-quality editing tasks, Ideogram reports more usable results than Ideogram 4.5: character consistency 85% (up from 69%), exact color 83% (up from 46%), product detail 86% (up from 61%), product shots 88% (up from 66%), and masked edits 90% (up from 82%). Ideogram 4.5 remains available for existing workflows; 4.0 remains the image-creation model on the earlier timeline card, and this entry does not add a separate 4.5 release.',
      ],
    },
  ],
  sources: [
    {
      label: 'Ideogram: Ideogram 4.6 model page',
      url: 'https://ideogram.ai/models/4.6/',
    },
  ],
};
