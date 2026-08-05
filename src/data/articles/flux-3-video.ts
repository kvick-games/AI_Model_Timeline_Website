import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'flux-3-video',
  release: {
    companyId: 'black-forest-labs',
    productLineId: 'flux-video',
    name: 'FLUX 3',
    date: '2026-08-04',
  },
  logo: {
    modelLabel: 'FLUX 3',
    modelMark: 'generic',
  },
  eyebrow: 'Multimodal video model launch',
  title: 'FLUX 3 brought native audio, keyframes, and 20-second generation into one model',
  dek: 'Black Forest Labs launched FLUX 3 for text-to-video, image-to-video, ordered keyframe control, continuation, multilingual dialogue, and native audio, with clips up to 20 seconds at native 1080p.',
  summary:
    'FLUX 3 is Black Forest Labs\' first video-generation family and a major expansion beyond the company\'s image roots. The hosted model can build multi-shot clips from text, images, or multiple frames while generating optional speech, effects, and ambience with the video.',
  impact:
    'The release puts long-form shot generation, native audio, text rendering, keyframe control, continuation, and a draft-to-final workflow behind one multimodal model. It also creates a new open-video contender, although the launch-day product is hosted: Black Forest Labs says open weights, 2K, and 4K output are coming soon.',
  facts: [
    {label: 'Provider', value: 'Black Forest Labs'},
    {label: 'Launch date', value: 'August 4, 2026'},
    {label: 'Inputs', value: 'Text, images, ordered keyframes, and existing video'},
    {label: 'Output', value: 'Up to 20 seconds at native 1080p'},
    {label: 'Audio', value: 'Optional native speech, effects, and ambience'},
    {label: 'Access at launch', value: 'BFL API and partner tools'},
    {label: 'Open weights', value: 'Announced as coming soon; not released at launch'},
  ],
  sections: [
    {
      heading: 'What launched',
      body: [
        'FLUX 3 Video accepts simple or complex text prompts, a start or end frame, multiple ordered keyframes, or an existing clip to continue. Black Forest Labs says it can produce multiple scenes and camera angles in one generation while retaining momentum, framing, and scene logic across continuations.',
        'Audio is generated alongside the frames when requested, including multilingual dialogue, accents, sound effects, ambience, and lip sync. The launch supports clips up to 20 seconds at native 1080p through the BFL API and an initial group of partner tools.',
      ],
    },
    {
      heading: 'A draft-to-final workflow',
      body: [
        'Draft mode produces a fast preview so creators can explore prompts and creative directions before paying for a full-quality render. A selected draft can then be sent back to FLUX 3 for a final pass that preserves the core subject and composition.',
        'That workflow makes the model notable as a production system, not only a quality checkpoint: iteration, keyframe direction, native audio, continuation, and final rendering are designed as parts of one loop.',
      ],
    },
    {
      heading: 'The open-weights boundary',
      body: [
        'FLUX 3 belongs in the open-video comparison because Black Forest Labs explicitly announced that open weights are coming. The weights were not downloadable on launch day, however, so this entry does not label the August 4 release itself as open-weight.',
        'The same distinction applies to output tiers: native 1080p is available at launch, while 2K and 4K were announced for a later release. Those future milestones should be dated separately when Black Forest Labs ships them.',
      ],
    },
  ],
  sources: [
    {
      label: 'Black Forest Labs: FLUX 3 model page',
      url: 'https://bfl.ai/models/flux-3',
    },
    {
      label: 'Black Forest Labs: FLUX 3 launch announcement',
      url: 'https://x.com/bfl_ai/status/2084693191484469305',
    },
  ],
};
