import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'mimo-v2-6-pro',
  release: {
    companyId: 'xiaomi-mimo',
    productLineId: 'mimo-models',
    name: 'MiMo-V2.6-Pro',
    date: '2026-09-22',
  },
  logo: {
    modelLabel: 'MiMo-V2.6-Pro',
    modelMark: 'generic',
  },
  eyebrow: 'Xiaomi open-weight omnimodal frontier',
  title: 'MiMo-V2.6-Pro open-sourced Xiaomi’s AA Index 46 omnimodal flagship',
  dek: 'Xiaomi MiMo released MiMo-V2.6-Pro on September 22, 2026 as a native fully multimodal open-weight frontier model with a 1M-token context window, claiming the strongest open-source score on the Artificial Analysis Intelligence Index at 46.',
  summary:
    'MiMo-V2.6-Pro is a sparse MoE with about 1.02T total parameters and 42B activated, native text/image/video/audio input, and a 1M context window. Xiaomi positions it as the open-source AA Intelligence Index leader at 46, ahead of Kimi K3 and Qwen3.8 Max, while still trailing closed frontier peers such as Claude Fable 5.1 and GPT-6 Astra. Weights and RL resources shipped on Hugging Face; API access uses mimo-v2.6-pro at V2.5 pricing.',
  impact:
    'This is the first Xiaomi MiMo card on the public timeline and a major open-weight foundation drop: omnimodal, agent-oriented, and priced to push the open-source intelligence-vs-cost frontier without waiting on a closed API gate.',
  facts: [
    {label: 'Provider', value: 'Xiaomi MiMo'},
    {label: 'Release date', value: 'September 22, 2026'},
    {label: 'API model', value: 'mimo-v2.6-pro'},
    {label: 'Architecture', value: 'Sparse MoE — ~1.02T total / 42B activated'},
    {label: 'Context window', value: '1M tokens'},
    {label: 'Modalities', value: 'Native text, image, video, and audio'},
    {label: 'AA Intelligence Index', value: '46 (claimed open-source lead)'},
    {label: 'Weights', value: 'Hugging Face XiaomiMiMo/MiMo-V2.6-Pro-RL (+ RL stack)'},
    {label: 'Availability', value: 'Xiaomi MiMo API, Desktop, OpenRouter, HF weights'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Xiaomi’s release post frames MiMo-V2.6 as scaling reinforcement learning for self-improvement across coding, general agents, visual, and cybersecurity tasks. The Pro checkpoint is the series flagship: sparse MoE, roughly 1.02T total / 42B active parameters, 1M context, and native omnimodal encoders for text, image, video, and audio.',
        'On Artificial Analysis’s Intelligence Index, Xiaomi reports MiMo-V2.6-Pro at 46, ahead of Kimi K3 and Qwen3.8 Max among open-source models while still behind Claude Fable 5.1 and GPT-6 Astra. Agent benchmarks are described as roughly Claude Opus 5 / GPT-5.6 Sol class on several suites.',
      ],
    },
    {
      heading: 'Open weights and API',
      body: [
        'Weights for MiMo-V2.6-Pro-RL are published on Hugging Face under the XiaomiMiMo/mimo-v26 collection, alongside Flash and distill companions plus open RL environments and training code. The public API model id is mimo-v2.6-pro; Xiaomi says V2.6 keeps the same pricing as V2.5, with an UltraSpeed mode for higher throughput.',
        'This timeline entry covers Pro only. MiMo-V2.6-Flash was released in the same series but is not added here.',
      ],
    },
  ],
  sources: [
    {
      label: 'Xiaomi MiMo: MiMo-V2.6 release',
      url: 'https://mimo.mi.com/docs/en-US/news/latest/v2-6',
    },
    {
      label: 'Hugging Face: XiaomiMiMo/mimo-v26 collection',
      url: 'https://huggingface.co/collections/XiaomiMiMo/mimo-v26',
    },
    {
      label: 'Hugging Face: MiMo-V2.6-Pro-RL',
      url: 'https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL',
    },
  ],
};
