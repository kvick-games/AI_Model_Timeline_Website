import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'suno-v6',
  release: {
    companyId: 'suno',
    productLineId: 'suno-music',
    name: 'Suno v6',
    date: '2026-09-09',
  },
  logo: {
    modelLabel: 'Suno v6',
    modelMark: 'generic',
  },
  eyebrow: 'Licensed music-generation models',
  title: 'Suno v6 replaced prior Suno models with a licensed-partner generation',
  dek: 'Suno introduced its v6 music-model generation on September 9, 2026, developed with industry partners including Warner Music Group, BMG, and Believe, and said it will retire previous models as v6 rolls out.',
  summary:
    'Suno v6 is recorded as one timeline card for the family. The article notes three variants: flagship v6 (Pro/Premier), exploratory v6-wild (Pro/Premier), and faster free-tier v6-mini. Tech coverage frames the release around licensed training partnerships amid ongoing copyright litigation.',
  impact:
    'This is the first Suno company and release card on the public timeline. It places Suno under audio generation beside peers such as Stability Audio, and marks the shift onto a v6 generation built with major music-industry partners.',
  facts: [
    {label: 'Provider', value: 'Suno'},
    {label: 'Release date', value: 'September 9, 2026'},
    {label: 'Model family', value: 'Suno v6'},
    {label: 'Variants', value: 'v6; v6-wild; v6-mini'},
    {label: 'Primary domain', value: 'AI music generation'},
    {label: 'Industry partners', value: 'Warner Music Group, BMG, Believe'},
    {label: 'Prior models', value: 'Retired as v6 rolls out'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Suno describes v6 as faster, more expressive, and higher quality, with stronger control features such as plain-language section edits, mashups from multiple sources, sample/isolate/beat workflows, and creation from text, audio, images, and video.',
        'The family ships in three variants: v6 as the polished flagship for Pro and Premier, v6-wild for more varied exploration on those plans, and v6-mini as a faster free-tier option. As v6 rolls out, Suno says it will retire previous models and move the product entirely onto the v6 generation.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Suno frames v6 as developed with industry partners including Warner Music Group, BMG, and Believe, after earlier settlement and licensing deals with labels and distributors.',
        'Independent coverage ties the launch to licensed-music training and ongoing copyright suits from other rightsholders. For the timeline, the durable signal is the first Suno audio-generation entry plus the explicit cutover onto a partner-built v6 model suite.',
      ],
    },
  ],
  sources: [
    {
      label: 'Suno: Introducing v6',
      url: 'https://suno.com/blog/introducing-v6',
    },
    {
      label: 'TechCrunch: Suno v6 licensed-music models',
      url: 'https://techcrunch.com/2026/09/09/suno-replaces-its-ai-models-with-a-new-one-trained-on-licensed-music-as-copyright-suits-pile-up/',
    },
  ],
};
