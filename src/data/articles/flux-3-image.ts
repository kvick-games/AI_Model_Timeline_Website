import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'flux-3-image',
  release: {
    companyId: 'black-forest-labs',
    productLineId: 'flux-image',
    name: 'FLUX 3 Image',
    date: '2026-10-01',
  },
  logo: {
    modelLabel: 'FLUX 3 Image',
    modelMark: 'generic',
  },
  eyebrow: 'Frontier image generation and editing',
  title: 'FLUX 3 Image brought bounding-box control and pixel-local edits to BFL’s multimodal stack',
  dek: 'Black Forest Labs released FLUX 3 Image on October 1, 2026 through its API and Playground — a frontier image model with bounding-box layout, multi-turn pixel-exact local edits, up to ten references, and native ~4K output.',
  summary:
    'FLUX 3 Image is the image side of Black Forest Labs’ FLUX 3 multimodal foundation model. One endpoint handles generate and edit: prompts can place elements with bounding boxes, recolor or replace several regions while locking the rest, combine up to ten reference images, and render from fast 768sq previews up to 4K (~16 megapixels).',
  impact:
    'For the timeline, FLUX 3 Image is a major frontier image marker: Black Forest Labs moves from the FLUX.1 / FLUX.2 image line into a FLUX 3-era product built around laid-out composition and agent-friendly pixel control, competing in the same high-control image lane as GPT Image 2.5, Seedream 5.0 Pro, and Ideogram.',
  facts: [
    {label: 'Provider', value: 'Black Forest Labs'},
    {label: 'Release date', value: 'October 1, 2026'},
    {label: 'Model family', value: 'FLUX 3'},
    {label: 'Primary domain', value: 'Image generation and editing'},
    {label: 'Layout control', value: 'Bounding boxes in the prompt (0–1000 canvas grid)'},
    {label: 'Editing', value: 'Pixel-exact local edits; multiple targeted changes per request'},
    {label: 'References', value: 'Up to 10 reference images'},
    {label: 'Output', value: 'Up to 4K (~16 MP); 15 aspect ratios'},
    {label: 'Availability', value: 'BFL API + Playground; commercial weights license'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Black Forest Labs positions FLUX 3 Image as maximum control over every pixel. You can generate from a plain text prompt, compose a scene by dragging bounding boxes for each element plus a scene caption, or skip the boxes and rely on strong prompt following.',
        'Editing is built for multi-turn, pixel-local work: mark the element to recolor, replace, move, resize, or remove, and keep everything else locked. The same endpoint accepts up to ten references and resolves generate-versus-edit from the prompt — there is no separate mode field. Resolution spans 768sq for previews through 1K, 2K, and 4K.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'FLUX 3 is one multimodal model jointly trained across image, video, and audio; FLUX 3 Image is the image product surface that follows the earlier FLUX 3 video preview. The release emphasizes agent-ready layout planning (an LLM can write the caption and element table) and commercial weights for companies running image generation at scale.',
        'On the public timeline this is the first dedicated FLUX 3 Image card. Earlier FLUX.1 and Kontext markers remain on the Black Forest Labs image line; this entry records the Oct 1, 2026 GA of the new frontier image stack rather than inventing intermediate FLUX.2 product markers.',
      ],
    },
  ],
  sources: [
    {
      label: 'Black Forest Labs: FLUX 3 Image',
      url: 'https://bfl.ai/models/flux-3-image',
    },
    {
      label: 'BFL docs: Release notes — FLUX 3 Image',
      url: 'https://docs.bfl.ai/release-notes',
    },
    {
      label: 'BFL docs: FLUX 3 Image overview',
      url: 'https://docs.bfl.ml/flux_3/flux3_image_overview',
    },
  ],
};
