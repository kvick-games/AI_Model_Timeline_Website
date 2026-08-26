import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'glm-5-3-flash',
  release: {
    companyId: 'zhipu-glm',
    productLineId: 'glm-models',
    name: 'GLM-5.3-Flash',
    date: '2026-08-26',
  },
  logo: {
    modelLabel: 'GLM-5.3-Flash',
    modelMark: 'generic',
  },
  eyebrow: 'First natively multimodal GLM-5',
  title: 'GLM-5.3-Flash made the Ox Alpha stealth model official',
  dek: 'Z.ai released GLM-5.3-Flash on August 26, 2026 as the first natively multimodal model in the GLM-5 series: 320B total parameters, 18B active, open weights, and a hybrid attention stack built for cheap long context.',
  summary: 'GLM-5.3-Flash starts from a newly trained base rather than a post-trained GLM-5.3. Z.ai says a hybrid sparse-plus-linear attention design, Manifold-Constrained Hyper-Connections, and a 30T-token multimodal corpus let it beat GLM-5.2 on coding and agent work at about one-tenth the price, while approaching Claude Opus 4.8. Before the reveal it ran anonymously as ox-alpha on OpenCode and OpenRouter.',
  impact: 'The drop closed the Ox Alpha mystery and put a cheap multimodal open-weight GLM on the same cost-performance frontier Z.ai had teen teasing in stealth. It also showed the lab serving a popular public model at scale on Chinese AI chips, with downloadable weights on day one.',
  facts: [
    {
      label: 'Provider',
      value: 'Zhipu AI / Z.ai',
    },
    {
      label: 'Release date',
      value: 'August 26, 2026',
    },
    {
      label: 'Stealth preview',
      value: 'OpenRouter / OpenCode ox-alpha',
    },
    {
      label: 'Architecture',
      value: '320B total / 18B active MoE; 45 layers; hybrid sparse and linear attention; mHC',
    },
    {
      label: 'Input modality',
      value: 'Natively multimodal (text and vision)',
    },
    {
      label: 'Pre-training',
      value: '30T-token multimodal corpus',
    },
    {
      label: 'Context',
      value: 'Up to 1M tokens (IndexPool long-context stack)',
    },
    {
      label: 'Weights',
      value: 'Open weights on Hugging Face at launch',
    },
    {
      label: 'Local serving',
      value: 'SGLang, vLLM, TokenSpeed',
    },
    {
      label: 'Cost claim',
      value: 'About 1/10 prior frontier price; AA Intelligence Index 57 at $0.045 per task (discounted)',
    },
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'GLM-5.3-Flash is a new base model, not a cheaper decode of GLM-5.3. Z.ai cut the stack versus the GLM-4.5 generation to 320B total parameters, 18B active, and 45 layers, then added hybrid sparse and linear attention plus Manifold-Constrained Hyper-Connections. Linear attention handles local state; sparse attention pulls global context through a lightweight indexer. IndexPool compresses four indexer keys into one so 1M-token context stays cheap.',
        'The company says this cuts attention compute and KV-cache size versus GLM-5.3 by 3.0x and 4.4x. Combined with a 30T-token multimodal pre-training corpus, the pitch is more intelligence per unit of compute, with visual coding and GUI self-verification in the loop.',
      ],
    },
    {
      heading: 'Ox Alpha, then open weights',
      body: [
        'For about a week before the name, Z.ai served the model anonymously as ox-alpha on OpenCode and OpenRouter to collect live traffic. The official post says it became the most popular model of that week, with all of that traffic running on Chinese AI chips.',
        'Unlike GLM-5.3, whose public weights were delayed for a two-week cyber safety review, GLM-5.3-Flash shipped downloadable weights on Hugging Face the same day. Local inference is listed for SGLang, vLLM, and TokenSpeed. GLM Coding Plan users get the model with 3x the usable quota of GLM-5.3, plus Browser Use and Computer Use in ZCode.',
      ],
    },
    {
      heading: 'Launch scores',
      body: [
        'These are Z.ai launch numbers and should be read as first-party claims. On Artificial Analysis Intelligence Index v4.1.1 the company reports a score of 57 at $0.045 per discounted task. Versus GLM-5.2 it reports 63.4 vs 46.2 on DeepSWE v1.1, 48.8 vs 26.2 on AutomationBench v1.0.6, and 84.3 vs 81.0 on Terminal-Bench 2.1.',
        'On Z.ai Code Bench v1.0 at max effort, GLM-5.3-Flash is listed at 29.0 against Claude Opus 4.8 at 29.5. Vision numbers are new versus text-only GLM-5.2: 62.4 on OfficeQA Pro, 89.4 on CharXiv Reasoning with tools, and 78.0 on Chartography with tools.',
      ],
    },
  ],
  sources: [
    {
      label: 'Z.ai: GLM-5.3-Flash launch post',
      url: 'https://z.ai/blog/glm-5.3-flash',
    },
    {
      label: 'Hugging Face: zai-org/GLM-5.3-Flash',
      url: 'https://huggingface.co/zai-org/GLM-5.3-Flash',
    },
  ],
};
