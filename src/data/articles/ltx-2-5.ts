import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'ltx-2-5',
  release: {
    companyId: 'lightricks',
    productLineId: 'ltx-video',
    name: 'LTX-2.5',
    date: '2026-08-11',
  },
  logo: {
    modelLabel: 'LTX-2.5',
    modelMark: 'generic',
  },
  eyebrow: 'Open world model for video, real-time, and physical AI',
  title: 'LTX-2.5 backfilled Lightricks’ next open world model after LTX-2.3',
  dek: 'Lightricks released LTX-2.5 on August 11, 2026 as its most capable open-weights world model yet, with better prompt understanding, sharper visuals, native multishot, and day-one ComfyUI support.',
  summary:
    'LTX-2.5 is an open-weights world model for video generation, real-time applications, and physical AI. The official launch post and release notes highlight a new diffusion video decoder, Diffusion Fidelity Rendering, native multishot continuity, a custom Gemma 4 text encoder with a prompt enhancer, automatic duration, a pretrained fine-tuning checkpoint, and a substantially improved distilled model.',
  impact:
    'The timeline previously stopped at LTX-2.3 in March 2026. This backfill records the official August 11, 2026 LTX-2.5 launch so the LTX line is no longer missing its current open world model.',
  facts: [
    {label: 'Provider', value: 'Lightricks / LTX'},
    {label: 'Release date', value: 'August 11, 2026'},
    {label: 'Model family', value: 'LTX'},
    {label: 'Type', value: 'Open-weights world model for video, real-time, and physical AI'},
    {label: 'Headline features', value: 'Native multishot, diffusion video decoder, Diffusion Fidelity Rendering, auto duration'},
    {label: 'Text stack', value: 'Custom Gemma 4 12B text encoder and dedicated prompt enhancer'},
    {label: 'Access', value: 'Open weights on Hugging Face, native ComfyUI, and the LTX API'},
    {label: 'License note', value: 'Permissive open weights; free for organizations under $10M ARR'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'LTX’s August 11, 2026 newsroom post, “Introducing LTX-2.5: The Open World Model for Video, Real-Time, & Physical AI,” says the company released its most capable open-weights world model yet, available to download and run the same day. The post highlights a rebuilt generation pipeline: a new diffusion video decoder for fewer high-motion artifacts, native multishot generation that holds character, scene, and voice across cuts, Diffusion Fidelity Rendering that spends compute on high-fidelity keyframes according to scene complexity, a pretrained checkpoint for domain adaptation including physical AI and robotics, and a substantially better distilled model.',
        'Official release notes add a custom Gemma 4 12B text encoder, a dedicated prompt enhancer, automatic duration prediction, a native EXR workflow, and cleaner permissive licensing. The model page describes LTX-2.5 as an open-weights world model that teams can fine-tune and deploy themselves, with day-one ComfyUI support, Hugging Face weights, and a managed LTX API. The company says self-hosted generation of a 10-second 720p clip takes 6.8 seconds on 2× GB200 GPUs. Official API prices are billed per second of generated video: ltx-2-5-fast at $0.09 (720p), $0.13 (1080p), $0.19 (1440p), and $0.30 (4K); ltx-2-5-pro at $0.12 (720p) and $0.17 (1080p).',
      ],
    },
    {
      heading: 'Why this is a backfill',
      body: [
        'The public timeline already had LTX-2.3, dated March 4, 2026, and then stopped. LTX-2.5 is an official later release, dated August 11, 2026 on the LTX newsroom post and on the same-day release notes, so it is added here as a backfill rather than as a newly announced model.',
        'No parameter count is stated in the official launch post, so this card does not carry forward the 22B figure from LTX-2.3.',
      ],
    },
  ],
  sources: [
    {
      label: 'LTX: Introducing LTX-2.5 (August 11, 2026)',
      url: 'https://ltx.io/newsroom/introducing-ltx-2-5',
    },
    {
      label: 'LTX: LTX-2.5 model page',
      url: 'https://ltx.io/model/ltx-2-5',
    },
    {
      label: 'LTX: Release notes (August 11, 2026)',
      url: 'https://ltx.io/release-notes',
    },
    {
      label: 'Lightricks: LTX-2.5 model card',
      url: 'https://huggingface.co/Lightricks/LTX-2.5',
    },
  ],
};
