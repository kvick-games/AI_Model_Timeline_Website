import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'qwen-image-2-1',
  release: {
    companyId: 'qwen',
    productLineId: 'qwen-image',
    name: 'Qwen-Image-2.1',
    date: '2026-09-20',
  },
  logo: {
    modelLabel: 'Qwen-Image-2.1',
    modelMark: 'generic',
  },
  eyebrow: 'Unified open image generation + editing',
  title: 'Qwen-Image-2.1 open-sourced unified text-to-image and editing at 7B',
  dek: 'Alibaba Qwen released Qwen-Image-2.1 on September 20, 2026 as an open-source unified text-to-image and image-editing model with a 7B visual generation component, native transparent RGBA output, up to 10 reference images, and native 2K resolution.',
  summary:
    'Qwen-Image-2.1 pairs compact 7B visual generation (32 Single-Stream DiT layers) with editing controls: local edits via circles, painted annotations, or masks, identity preservation across people and products, improved typography, and native RGBA/transparency workflows. Weights are on Hugging Face under the Qwen Research License (non-commercial unless separately licensed).',
  impact:
    'This is the first Qwen-Image-2.x card on the timeline and a major open image drop: one model covers generation and editing, including transparent assets, without a separate closed API gate.',
  facts: [
    {label: 'Provider', value: 'Alibaba Qwen'},
    {label: 'Release date', value: 'September 20, 2026'},
    {label: 'Model family', value: 'Qwen-Image'},
    {label: 'Visual generation size', value: '7B parameters (32 Single-Stream DiT layers)'},
    {label: 'Capabilities', value: 'Unified text-to-image + image editing'},
    {label: 'Transparency', value: 'Native RGBA / transparent generation and editing'},
    {label: 'References', value: 'Up to 10 reference images'},
    {label: 'Resolution', value: 'Native 2K (e.g. 2048×2048 and listed aspect ratios)'},
    {label: 'License', value: 'Qwen Research License (non-commercial unless separate terms)'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Hugging Face lists Qwen-Image-2.1 as a unified text-to-image generation and image editing model. The visual generation component is 7B parameters across 32 Single-Stream DiT layers, with mixed-granularity attention and prefix KV cache reuse aimed at strong quality at lower compute cost.',
        'Headline features include native transparent (RGBA) generation and editing, support for up to 10 reference images, local edit hints via circles, painted annotations, or separate masks, identity preservation for people and products, and improved typography and portrait lighting. Example pipelines target native 2K outputs.',
      ],
    },
    {
      heading: 'License and availability',
      body: [
        'Public weights are published at Qwen/Qwen-Image-2.1 on Hugging Face. The model card states the Qwen Research License Agreement, which is non-commercial unless separate commercial terms apply — the same research-license pattern used for other Qwen open releases.',
        'Diffusers integration uses QwenImage21Pipeline for text-to-image, editing, and transparent-image prompts.',
      ],
    },
  ],
  sources: [
    {
      label: 'Hugging Face: Qwen/Qwen-Image-2.1',
      url: 'https://huggingface.co/Qwen/Qwen-Image-2.1',
    },
    {
      label: 'Gate News: Alibaba Qwen releases Qwen-Image-2.1 (Sep 20)',
      url: 'https://www.gate.com/news/detail/alibaba-qwen-releases-open-source-image-model-qwen-image-21-with-7b-24422532',
    },
  ],
};
