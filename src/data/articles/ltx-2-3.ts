import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'ltx-2-3',
  release: {
    companyId: 'lightricks',
    productLineId: 'ltx-video',
    name: 'LTX-2.3',
    date: '2026-03-04',
  },
  logo: {
    modelLabel: 'LTX-2.3',
    modelMark: 'generic',
  },
  eyebrow: 'Open audio-video foundation model',
  title: 'LTX-2.3 moved Lightricks into synchronized open audio-video generation',
  dek: 'Lightricks published LTX-2.3 as a 22B DiT-based audio-video model with open weights, synchronized video and audio, text/image/video/audio conditioning, distilled checkpoints, and multiscale upscalers.',
  summary:
    'LTX-2.3 is the open-weight continuation of the LTX line after LTX-Video 0.9.x and LTX-2. It expands the series from fast image/text-to-video toward a joint audio-video foundation model with local execution and API/demo access.',
  impact:
    'For the timeline, LTX-2.3 is a useful marker because Lightricks is no longer just shipping a fast open video checkpoint; it is packaging synchronized audio-video generation, control LoRAs, upscalers, and training hooks into a broader creative-model stack.',
  facts: [
    {label: 'Provider', value: 'Lightricks'},
    {label: 'Release date', value: 'March 4, 2026'},
    {label: 'Model family', value: 'LTX / LTX-Video'},
    {label: 'Scale', value: '22B checkpoints'},
    {label: 'Modalities', value: 'Text, image, video, and audio to synchronized audio-video'},
    {label: 'Access', value: 'Open weights plus API Playground'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'The original LTX-Video releases focused on real-time image-to-video and text-to-video generation. LTX-2.3 pushes the family into joint audio-video generation with synchronized output in one model.',
        'The Hugging Face model card lists full and distilled 22B checkpoints, spatial and temporal upscalers, and IC-LoRA/control assets; the GitHub repo exposes the inference, pipeline, and trainer packages around that stack.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Open video models are increasingly competing on workflow rather than a single checkpoint. LTX-2.3 makes that shift visible: full model, distilled model, upscalers, control adapters, and training tools are all part of the release surface.',
        'It also gives the timeline a clean bridge from LTX-Video 0.9.x, through the LTX-2 audio-video announcement, into a concrete open-weight 2.3 release.'
      ],
    },
  ],
  sources: [
    {
      label: 'Lightricks: LTX-2.3 model card',
      url: 'https://huggingface.co/Lightricks/LTX-2.3',
    },
    {
      label: 'Lightricks: LTX-2 GitHub repository',
      url: 'https://github.com/Lightricks/LTX-2',
    },
    {
      label: 'Lightricks: Introducing LTX-2',
      url: 'https://website.ltx.video/blog/introducing-ltx-2',
    },
  ],
};
