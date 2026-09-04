import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'muse-spark-1-3',
  release: {
    companyId: 'meta-ai',
    productLineId: 'meta-muse-spark',
    name: 'Muse Spark 1.3',
    date: '2026-09-02',
  },
  logo: {
    modelLabel: 'Muse Spark 1.3',
    modelMark: 'generic',
  },
  eyebrow: 'Meta’s coding and agent flagship',
  title: 'Muse Spark 1.3 became Meta’s recommended Spark for coding and long-horizon agents',
  dek: 'Meta released Muse Spark 1.3 on September 2, 2026 as the new default Muse Spark model in Muse Code and Meta Model API, with fewer tool calls and tokens than 1.2 on coding work.',
  summary: 'Muse Spark 1.3 is Meta Superintelligence Labs’ latest multimodal foundation model for agentic and coding work. It is generally available today as muse-spark-1.3 (and a contributor-tier variant), with a 1,048,576-token context window. Meta says it is recommended for new work over Spark 1.2 and 1.1.',
  impact: 'This is the first numbered Spark follow-up on the public timeline after Muse Spark 1.1. It keeps Meta in the frontier coding-agent lane with a live API default, without treating 1.2 as a required catch-up card unless added separately.',
  facts: [
    {label: 'Provider', value: 'Meta AI / Meta Superintelligence Labs'},
    {label: 'Release date', value: 'September 2, 2026'},
    {label: 'Developer model ID', value: 'muse-spark-1.3'},
    {label: 'Context window', value: '1,048,576 tokens'},
    {label: 'Availability', value: 'Muse Code and Meta Model API (GA)'},
    {label: 'Modalities', value: 'Text, image, video, audio, PDF in; text out'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'Meta says Muse Spark 1.3 improves agentic and coding performance after months of Muse Code and Meta Model API use. Previously available reasoning modes ship today, with max reasoning coming after more safety testing.',
        'Relative to Muse Spark 1.2, Meta engineers report it is faster and less verbose, using about 20% fewer tool calls and about 25% fewer tokens. Developer docs list muse-spark-1.3 as the recommended default, sharing a 1M-token context window with 1.2 and 1.1.',
      ],
    },
    {
      heading: 'How to call it',
      body: [
        'Muse Spark 1.3 is available today in Muse Code and on Meta Model API. Docs also list a discounted muse-spark-1.3-contributor tier. Audio understanding in 1.3 is not fully supported yet; Meta points audio work at Spark 1.2 or Muse Voice Transcribe.',
      ],
    },
  ],
  sources: [
    {
      label: 'Meta AI Research: Introducing Muse Spark 1.3',
      url: 'https://research.meta.ai/blog/introducing-muse-spark-1-3',
    },
    {
      label: 'Meta Model API: Models',
      url: 'https://ai.developer.meta.com/docs/models/',
    },
  ],
};
