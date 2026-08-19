import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'glm-5-3',
  release: {
    companyId: 'zhipu-glm',
    productLineId: 'glm-models',
    name: 'GLM-5.3',
    date: '2026-08-14',
  },
  logo: {
    modelLabel: 'GLM-5.3',
    modelMark: 'generic',
  },
  eyebrow: 'Post-trained coding and cybersecurity flagship',
  title: 'GLM-5.3 turned post-training scale into a coding and cyber leap',
  dek: 'Z.ai released GLM-5.3 on August 14, 2026 as a text-only, million-token flagship for complex software engineering, long-horizon agents, and vulnerability research.',
  summary: 'GLM-5.3 keeps the same base model and 1M-token context as GLM-5.2, but scales post-training across more realistic engineering environments. Z.ai reports a 50% gain on its internal coding benchmark, large jumps on public agent benchmarks, and unexpectedly strong cybersecurity performance.',
  impact: 'The release showed how far a lab could move an existing open-model base through post-training alone. Its cyber results also changed the launch itself: Z.ai made the model available through its services immediately but delayed the public weights for two weeks of additional safety evaluation and hardening.',
  facts: [
    {
      label: 'Provider',
      value: 'Zhipu AI / Z.ai',
    },
    {
      label: 'Release date',
      value: 'August 14, 2026',
    },
    {
      label: 'Developer model ID',
      value: 'glm-5.3',
    },
    {
      label: 'Input modality',
      value: 'Text',
    },
    {
      label: 'Context window',
      value: '1M tokens',
    },
    {
      label: 'Maximum output',
      value: '128K tokens',
    },
    {
      label: 'Reasoning effort',
      value: 'Low, high, or max; reasoning always enabled',
    },
    {
      label: 'Weights',
      value: 'Announced for two weeks after launch, following safety review',
    },
    {
      label: 'API pricing',
      value: '$1.40/M input; $4.40/M output; $0.26/M cached input',
    },
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'GLM-5.3 uses the same base model as GLM-5.2. Z.ai attributes the release gains to a month of scaled post-training across more environments, more varied tasks, and more compute, building on IndexShare, SAO, and the slime asynchronous reinforcement-learning stack.',
        'The model preserves GLM-5.2’s text-only 1M-token context window and 128K maximum output. It always reasons, with low, high, and max effort levels; applications that previously disabled thinking must update that setting before migrating.',
      ],
    },
    {
      heading: 'Coding and long-horizon agents',
      body: [
        'Z.ai says GLM-5.3 improved by 50% over GLM-5.2 on its private Z.ai Code Bench while using fewer output tokens. The training environments were designed around complete engineering and research workflows rather than isolated coding exercises.',
        'On Z.ai’s launch evaluations, GLM-5.3 rose from 4.6 to 28.3 on Terminal-Bench 3.0, from 46.2 to 66.9 on DeepSWE v1.1, and from 23.8 to 28.5 on Agents’ Last Exam. These are first-party results and should be read as launch claims until broader independent evaluation catches up.',
      ],
    },
    {
      heading: 'Emergent cyber capability',
      body: [
        'Z.ai added vulnerability-discovery environments during post-training and reported that the model began reasoning across multi-stage exploitation chains. GLM-5.3 scored 84.5% on CyberGym versus 77.2% for GLM-5.2, and 54.4% on ExploitBench versus 24.4% for GLM-5.2.',
        'The company says GLM models identified 2,436 vulnerabilities across 269 projects after expert review and deduplication. Because of the dual-use risk, Z.ai delayed the public weight release for two weeks while it completed additional safety evaluation and hardening.',
      ],
    },
    {
      heading: 'How it ships',
      body: [
        'GLM-5.3 launched through Z.ai’s API, GLM Coding Plan, ZCode, and compatible coding agents. Requests for GLM-5.2 and GLM-5.1 on the Coding Plan are automatically routed to GLM-5.3.',
        'Official API pricing is unchanged from GLM-5.2 at $1.40 per million input tokens, $0.26 per million cached input tokens, and $4.40 per million output tokens. Z.ai said the downloadable weights would follow two weeks after launch rather than shipping on day one.',
      ],
    },
  ],
  sources: [
    {
      label: 'Z.ai: GLM-5.3 launch post',
      url: 'https://z.ai/blog/glm-5.3',
    },
    {
      label: 'Z.ai developer docs: GLM-5.3',
      url: 'https://docs.z.ai/guides/llm/glm-5.3',
    },
    {
      label: 'Z.ai developer docs: GLM Coding Plan',
      url: 'https://docs.z.ai/devpack/overview',
    },
    {
      label: 'Z.ai developer docs: API pricing',
      url: 'https://docs.z.ai/guides/overview/pricing',
    },
    {
      label: 'Axios: Z.ai delays GLM-5.3 weights over cyber risk',
      url: 'https://www.axios.com/2026/08/14/china-open-source-ai-glm-53',
    },
  ],
};
