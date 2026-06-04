import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'reve-2-0',
  release: {
    companyId: 'reve',
    productLineId: 'reve-image',
    name: 'Reve 2.0',
    date: '2026-06-03',
  },
  logo: {
    modelLabel: 'Reve 2.0',
    modelMark: 'generic',
  },
  eyebrow: 'Planning-first image model',
  title: 'Reve 2.0 entered the image race with layout-first generation controls',
  dek: 'Reve introduced Reve 2.0 as an image model built around planning and layout control, including a code-like intermediate representation, native 4K / 16MP rendering, and controllable editing.',
  summary:
    'Reve 2.0 is positioned as a new image-generation competitor with a workflow that plans structure before rendering. Its launch messaging emphasizes controllability, high-resolution output, and editing over prompt-only image creation.',
  impact:
    'For the timeline, Reve 2.0 matters because it shows a smaller new entrant competing on layout control and generation workflow. Reve claims the model is competitive with Nano Banana-class systems, but that claim should be treated as launch positioning rather than an independently settled benchmark.',
  facts: [
    {label: 'Provider', value: 'Reve'},
    {label: 'Release date', value: 'June 3, 2026'},
    {label: 'Model family', value: 'Reve'},
    {label: 'Output', value: 'Native 4K / 16MP rendering'},
    {label: 'Controls', value: 'Layout planning, editing, and intermediate representation'},
    {label: 'Positioning', value: 'Claims Nano Banana-class competitiveness'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Reve 2.0 is presented as a planning-first image model: it uses a structured, code-like intermediate representation to reason about layout before producing the final render.',
        'The launch surface highlights native 4K / 16MP output, precise editing, and stronger control over composition than a purely free-form prompt workflow.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Image generation competition is shifting from raw prompt quality toward controllable production tools. Reve 2.0 is notable because its differentiator is layout and editing control, not just another hosted text-to-image endpoint.',
        'The company and launch discussion frame it as competitive with Nano Banana-class image models. The timeline records that as a claim and market signal, not as an absolute ranking.',
      ],
    },
  ],
  sources: [
    {
      label: 'Reve: official app and model page',
      url: 'https://app.reve.com/',
    },
    {
      label: 'Google: Build with Nano Banana 2',
      url: 'https://blog.google/innovation-and-ai/technology/developers-tools/build-with-nano-banana-2/',
    },
  ],
};
