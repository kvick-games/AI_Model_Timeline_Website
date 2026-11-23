import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'glm-5-4',
  release: {
    companyId: 'zhipu-glm',
    productLineId: 'glm-models',
    name: 'GLM-5.4',
    date: '2026-11-23',
  },
  logo: {
    modelLabel: 'GLM-5.4',
    modelMark: 'generic',
  },
  eyebrow: 'First flagship Loop Transformer',
  title: 'GLM-5.4 became Z.ai’s first flagship built on a Loop Transformer',
  dek: 'Z.ai released GLM-5.4 on November 23, 2026 as its first flagship Loop Transformer, looping 28 layers of the GLM-5 base twice at 750B scale and positioning the release as the start of Generalized Coding.',
  summary: 'GLM-5.4 adapts a pre-trained GLM-5 base into a Loop Transformer rather than training a looped model from scratch. Z.ai says the 750B-scale model reaches intelligence comparable to 2T–3T parameter models, adds vision alongside coding, and is available in Z.ai Chat, ZCode, and the GLM Coding Plan, with API access coming soon and open weights planned after safety hardening.',
  impact: 'The launch is Z.ai’s first flagship on a looped architecture, trading extra depth for parameter efficiency. The company did not publish GLM-5.4 benchmark scores, and it held back API access and downloadable weights pending further work, including safety hardening for a later open-weight release.',
  facts: [
    {label: 'Provider', value: 'Zhipu AI / Z.ai'},
    {label: 'Release date', value: 'November 23, 2026'},
    {label: 'Architecture', value: 'Loop Transformer; 28 GLM-5 base layers looped for two iterations, at 750B scale'},
    {label: 'Context window', value: '1M tokens (as described in Z.ai’s deployment notes)'},
    {label: 'Modalities', value: 'Coding plus vision; Z.ai says improvements in both'},
    {label: 'Availability', value: 'Z.ai Chat, ZCode, and GLM Coding Plan; API coming soon'},
    {label: 'Weights', value: 'Planned after safety hardening; not released at launch'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Z.ai describes GLM-5.4 as its first flagship model built on the Loop Transformer architecture. Instead of pre-training a looped model from scratch, the lab adapted an already pre-trained GLM-5 base through continued training. In a Loop Transformer, a shared block of layers runs for multiple iterations, refining hidden states from the previous pass. GLM-5.4 loops 28 layers of the GLM-5 base for two iterations at 750B scale.',
        'Z.ai says this lets the model reason more deeply without adding parameters, and that GLM-5.4 reaches intelligence levels comparable to 2T–3T parameter models. The launch post also notes a limitation: the model can get caught in overly long “marathon thinking” loops, though the company says that prolonged reflection and self-correction consistently improves accuracy beyond its parameter count. Z.ai did not publish GLM-5.4 benchmark scores.',
      ],
    },
    {
      heading: 'Architecture at 750B scale',
      body: [
        'To convert middle layers of an existing model into a multi-pass loop without blowing up activation norms, GLM-5.4 adds independent per-token gates for each iteration, which Z.ai calls gated progressive updates. After training, the first pass writes conservatively to build global context, and the second pass opens the gates to write fuller updates, with step size also adjusting by token difficulty.',
        'A hybrid KV cache reuses sparse KV selected in the first pass and keeps a local sliding window for the second pass, so an extra loop costs one sliding window of cache rather than a full context cache. Z.ai says this keeps the deployment-cost increase over GLM-5.3 well under control at 1M context lengths. The second loop also reuses the first loop’s sparse attention indices. The company reports inference throughput of up to 200 tokens per second in off-peak hours and 70–80 tokens per second at peak load.',
      ],
    },
    {
      heading: 'Generalized Coding and how it ships',
      body: [
        'Z.ai frames GLM-5.4 as the start of Generalized Coding, where code becomes the foundation for a wider range of tasks. Driven by improvements in both coding and vision, the company says the model can write code to generate and edit videos, build complete games, and handle 3D modeling and mechanical design.',
        'GLM-5.4 launched in Z.ai Chat, ZCode, and the GLM Coding Plan. Z.ai lists API access as coming soon and says it plans to open-source the model weights after completing necessary safety hardening.',
      ],
    },
  ],
  sources: [
    {
      label: 'Z.ai: GLM-5.4 launch post',
      url: 'https://z.ai/blog/glm-5.4',
    },
  ],
};
