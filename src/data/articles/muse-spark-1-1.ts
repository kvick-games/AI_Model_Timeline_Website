import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'muse-spark-1-1',
  release: {
    companyId: 'meta-ai',
    productLineId: 'meta-muse-spark',
    name: 'Muse Spark 1.1',
    date: '2026-07-09',
  },
  logo: {
    modelLabel: 'Muse Spark 1.1',
    modelMark: 'generic',
  },
  eyebrow: 'Agentic multimodal reasoning model',
  title: 'Muse Spark 1.1 put Meta back into the agentic model race',
  dek:
    'Meta introduced Muse Spark 1.1 as a major upgrade to its Muse Spark model, emphasizing agentic workflows, computer use, coding, multimodal reasoning, a 1M-token context window, and public developer access through the Meta Model API.',
  summary:
    'Muse Spark 1.1 is Meta Superintelligence Labs\' multimodal reasoning model for agentic tasks. The release is notable because it pairs model upgrades in tool use, computer use, coding, and multimodal understanding with the public preview of Meta Model API access.',
  impact:
    'For the timeline, Muse Spark 1.1 matters because Meta moved from a consumer and internal-AI story into a developer-facing frontier model lane. Its launch puts Meta alongside OpenAI, Anthropic, Google, and SpaceXAI in the market for long-context coding and agentic models.',
  facts: [
    {label: 'Provider', value: 'Meta AI / Meta Superintelligence Labs'},
    {label: 'Release date', value: 'July 9, 2026'},
    {label: 'Model family', value: 'Muse Spark'},
    {label: 'Primary domain', value: 'Agentic multimodal reasoning'},
    {label: 'Context window', value: '1 million tokens'},
    {label: 'Developer access', value: 'Meta Model API public preview'},
    {label: 'API pricing', value: '$1.25/M input tokens; $4.25/M output tokens'},
    {label: 'Consumer access', value: 'Thinking mode in Meta AI and meta.ai'},
  ],
  sections: [
    {
      heading: 'What changed',
      body: [
        'Meta introduced Muse Spark 1.1 as a significant upgrade over the first Muse Spark model, with gains in tool use, computer use, coding, and multimodal understanding.',
        'The release added public developer access through the new Meta Model API while also making the model available in Thinking mode inside Meta AI and on meta.ai.',
      ],
    },
    {
      heading: 'Agent and coding focus',
      body: [
        'Meta framed the model around long-running agentic work: planning across apps and services, using native tools and MCP servers, delegating work to subagents, and managing a 1M-token context window.',
        'The coding pitch centers on large codebases, debugging, feature implementation, migrations, and adapting to existing coding harnesses with planning, goal conditioning, subagents, and context compaction.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Muse Spark 1.1 gives Meta a named model entry in the same competitive category as Claude Opus and Sonnet, GPT-class agent models, Gemini, Kimi Code, GLM coding models, and Grok 4.5.',
        'The important shift is not just benchmark positioning. Meta paired the model with a paid API surface and aggressive token pricing, making Muse Spark a commercial developer model rather than only an internal or consumer assistant upgrade.',
      ],
    },
    {
      heading: 'Safety and deployment',
      body: [
        'Meta published a separate evaluation report for Muse Spark 1.1 and said the deployed system operates within its Advanced AI Scaling Framework thresholds after mitigations.',
        'The report highlights stronger adversarial robustness and recommends system-level controls for applications that give the model tool access, including strict tool allowlists and workspace isolation.',
      ],
    },
  ],
  sources: [
    {
      label: 'Meta AI: Introducing Muse Spark 1.1',
      url: 'https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/',
    },
    {
      label: 'AI at Meta on X: Muse Spark 1.1 announcement',
      url: 'https://x.com/AIatMeta/status/2075221088821518394',
    },
    {
      label: 'Meta Developer Blog: Build with Muse Spark on Meta Model API',
      url: 'https://developer.meta.com/ai/resources/blog/build-with-muse-spark/',
    },
    {
      label: 'Meta AI: Muse Spark 1.1 Evaluation Report',
      url: 'https://ai.meta.com/static-resource/muse-spark-1-1-evaluation-report',
    },
  ],
};
