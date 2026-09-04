import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'wan3-0',
  release: {
    companyId: 'qwen',
    productLineId: 'wan-video',
    name: 'Wan3.0',
    date: '2026-08-06',
  },
  logo: {
    modelLabel: 'Wan3.0',
    modelMark: 'generic',
  },
  eyebrow: 'Alibaba’s 30-second video model',
  title: 'Wan3.0 stretched Alibaba video generation to a 30-second all-in-one API',
  dek: 'Alibaba launched Wan3.0 on August 6, 2026 on Model Studio: up to 30 seconds in a single pass, native audio, and text, image, audio, video, and document inputs.',
  summary: 'Wan3.0 is the new generation of Alibaba’s Wan video family. Official Model Studio docs describe it as an all-in-one model (wan3.0-video / wan3.0-video-prime) covering text-to-video, image-to-video, multi-modal reference, video editing, and extension, with 30fps MP4 output at 480P, 720P, or 1080P.',
  impact: 'This is the first Wan card past Wan2.2 on the public timeline. It moves the family from short clips toward complete 30-second stories with built-in dialogue, BGM, and document-to-video, on Alibaba Cloud rather than as a new open-weights drop.',
  facts: [
    {label: 'Provider', value: 'Alibaba / Tongyi Wanxiang'},
    {label: 'Release date', value: 'August 6, 2026'},
    {label: 'Model IDs', value: 'wan3.0-video / wan3.0-video-prime'},
    {label: 'Max duration', value: '30 seconds per generation'},
    {label: 'Inputs', value: 'Text, image, audio, video, documents, web pages'},
    {label: 'Output', value: 'MP4, 30fps, 480P / 720P / 1080P'},
    {label: 'API pricing', value: '$0.05/s 480P; $0.10/s 720P; $0.20/s 1080P'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Alibaba’s Model Studio blog dated 2026-08-06 says Wan3.0 generates up to 30 seconds in a single pass, up from short clips, with smart duration recommendation and video extension. It natively outputs dialogue, background music, and sound effects.',
        'Inputs go beyond text and image: audio, video, and — for the first time in the family — documents (PPT, PDF, DOC, XLS, and more) or a public web page. Docs list up to 20 multi-modal references per request and built-in video editing (add/remove/replace, style, dialogue) without a full regenerate.',
      ],
    },
    {
      heading: 'How it ships',
      body: [
        'Wan3.0 is available on Alibaba Cloud Model Studio. The API model names are wan3.0-video and wan3.0-video-prime. Official pricing starts at $0.05 per second for 480P, $0.10 for 720P, and $0.20 for 1080P.',
      ],
    },
  ],
  sources: [
    {
      label: 'Alibaba Cloud Model Studio: Wan3.0 blog',
      url: 'https://modelstudio.alibabacloud.com/intl/blog/wan3-ai-video-generation-model/',
    },
    {
      label: 'Alibaba Cloud: Wan3.0 video generation guide',
      url: 'https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-guide',
    },
  ],
};
