import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'qwen-4-max',
  release: {
    companyId: 'qwen',
    productLineId: 'qwen-models',
    name: 'Qwen4-Max',
    date: '2026-11-17',
  },
  logo: {
    modelLabel: 'Qwen4-Max',
    modelMark: 'generic',
  },
  eyebrow: 'Qwen4 flagship, enterprise pilots',
  title: 'Qwen4-Max brought Alibaba’s 2.4T flagship to enterprise pilots',
  dek: 'Alibaba Cloud announced Qwen4-Max on November 17, 2026 as the flagship of the Qwen4 series: 2.4 trillion total parameters, 71 billion active per token, native vision, a 1-million-token context window, and access through enterprise pilots.',
  summary:
    'Qwen4-Max is Alibaba’s Qwen4 flagship for long, tool-heavy professional work. It has 2.4 trillion total parameters, with 71 billion active per token and an additional 328 billion N-gram embedding parameters, native vision, and a 1M-token context window. Its architecture pairs Gated DeltaNet layers with Qwen Sparse Attention. A Live Delivery mode ships a usable first version of a long task early, then keeps delivering improved versions. Access at launch is through enterprise pilots on Alibaba Cloud; availability, features, and pricing vary by region.',
  impact:
    'This is the first Qwen4 flagship card on the public timeline. It moves Alibaba’s hosted frontier line past Qwen3.8-Max, but unlike that earlier Max launch, access starts in scoped enterprise pilots rather than a public API with published prices.',
  facts: [
    {label: 'Provider', value: 'Alibaba Cloud'},
    {label: 'Launch date', value: 'November 17, 2026'},
    {label: 'Scale', value: '2.4T total; 71B active per token'},
    {label: 'Added embeddings', value: '328B N-gram embedding parameters'},
    {label: 'Architecture', value: 'Gated DeltaNet + Qwen Sparse Attention'},
    {label: 'Context window', value: '1,000,000 tokens'},
    {label: 'Modalities', value: 'Native vision; text'},
    {label: 'Live Delivery', value: 'Usable first version early, then improved versions while the task runs'},
    {label: 'Access at launch', value: 'Enterprise pilots via Alibaba Cloud; pricing varies by region'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Alibaba Cloud describes Qwen4-Max as an always-on AI colleague built to use professional tools, carry long tasks through to completion, and deliver finished work rather than just answers. It has 2.4 trillion total parameters, 71 billion active per token, and an additional 328 billion N-gram embedding parameters. The new architecture pairs Gated DeltaNet layers with Qwen Sparse Attention to keep very long contexts efficient, and it reads images natively with up to 1 million tokens of context.',
        'With Live Delivery, Qwen4-Max ships a usable first version of a long task early, then keeps delivering improved versions so teams can review and redirect the work while it runs. On the Qwen Work360 industry benchmark, Alibaba reports a score of 52.69, up from 47.74 for Qwen3.8-Max, with about 24% and 35% fewer tokens at Xhigh and High reasoning effort and a 58% lower average cost per task. These are first-party launch claims.',
      ],
    },
    {
      heading: 'How it ships',
      body: [
        'Qwen4-Max is the same model Alibaba Cloud is bringing to enterprise teams, not a separate edition. Enterprise teams can talk to Alibaba Cloud to plan a pilot on their own workflows. Availability, features, and pricing vary by region and may change over time; no public API price was published in the launch post.',
        'Launch demonstrations included manufacturing (3D production lines and CAM toolpaths), a 48-hour science run with a robotic wet lab, IPO legal due diligence, financial research with 90 MCP tools, and Alibaba Cloud resource scheduling. Results described as “in the case shown” come from those specific demonstrations and are not a guarantee on other tasks.',
      ],
    },
  ],
  sources: [
    {
      label: 'Alibaba Cloud: Qwen4-Max for the enterprise',
      url: 'https://www.alibabacloud.com/blog/alibaba-cloud-brings-qwen4-max-to-the-enterprise-an-ai-colleague-that-plans-builds-and-delivers-finished-work_603786',
    },
  ],
};
