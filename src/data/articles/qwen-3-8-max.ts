import type {ModelArticle} from '../types';
import {publicAssetPath} from '../publicAssets';

export const article: ModelArticle = {
  slug: 'qwen-3-8-max',
  release: {
    companyId: 'qwen',
    productLineId: 'qwen-models',
    name: 'Qwen3.8-Max',
    date: '2026-08-03',
  },
  logo: {
    modelLabel: 'Qwen3.8-Max',
    modelMark: 'generic',
  },
  eyebrow: '2.4T flagship; open weights promised next week',
  title: 'Qwen3.8-Max put Alibaba\'s flagship weights on a one-week clock',
  dek: 'Alibaba launched its most capable Qwen model for autonomous coding and professional cowork, published $2 / $6 per-million-token API pricing, and said both the Max checkpoint and a 27B sibling would go open-weight the following week.',
  summary:
    'Qwen3.8-Max is Alibaba\'s 2.4-trillion-parameter flagship for long-horizon coding, professional deliverables, and multimodal agent work. It launched in Qwen Studio and through the QwenCloud API with public pricing while Alibaba committed to releasing its weights the following week.',
  impact:
    'The launch matters because Qwen is pairing a frontier-scale hosted model with a near-term promise to publish the Max checkpoint itself. If delivered, that would move Alibaba\'s highest-capability tier from an API-only product into the open-weight model race.',
  media: {
    src: publicAssetPath('articles/qwen-3-8-max-benchmarks.jpg'),
    alt: 'Alibaba Qwen benchmark chart comparing Qwen3.8-Max with Qwen3.7-Max, Qwen3.7-Plus, Claude Opus 4.8, Claude Fable 5, Gemini 3.1 Pro, and GPT-5.6 Sol across coding, cowork, visual reasoning, and computer-use evaluations.',
    caption:
      'Qwen\'s launch chart reports vendor-run results across 16 coding, cowork, visual-reasoning, web, mobile, and computer-use benchmarks.',
  },
  facts: [
    {label: 'Provider', value: 'Alibaba Qwen'},
    {label: 'Launch date', value: 'August 3, 2026'},
    {label: 'Scale', value: '2.4 trillion parameters'},
    {label: 'Focus', value: 'Coding, cowork, and multimodal agents'},
    {label: 'API pricing', value: '$2 input / $6 output per 1M tokens'},
    {label: 'Implicit caching', value: '$0.25 per 1M tokens'},
    {label: 'Open weights', value: 'Promised for the following week'},
    {label: 'Smaller sibling', value: 'Qwen3.8-27B also promised as open-weight'},
  ],
  sections: [
    {
      heading: 'What Qwen emphasized',
      body: [
        'Alibaba positioned Qwen3.8-Max around autonomous work rather than chat alone. Its launch examples included more than ten days of self-evolving software development from an empty folder to a production project, with the full trace published on GitHub.',
        'Qwen also highlighted production-quality deliverables across hundreds of professions, closed-loop planning across more than 500 chip-design turns and a simulated year of e-commerce strategy, plus native vision as a continuous planning and self-correction signal.',
      ],
    },
    {
      heading: 'How it ships',
      body: [
        'The model launched through Qwen Studio and the QwenCloud API at $2 per million input tokens, $6 per million output tokens, and $0.25 per million implicitly cached tokens.',
        'Alibaba said the Qwen3.8-Max weights would follow the launch the next week and announced an open-weight Qwen3.8-27B at the same time. Until the Max checkpoint is actually published, this timeline classifies the launch as a frontier LLM rather than an available open-weight release.',
      ],
    },
    {
      heading: 'The vendor benchmark picture',
      body: [
        'Qwen\'s launch chart compares 3.8 Max with Qwen3.7 Max and Plus, Claude Opus 4.8 and Fable 5, Gemini 3.1 Pro, and GPT-5.6 Sol. It reports leading scores among the models shown on PaperBench, BabyVision, ERQA, PerceptionBench, LVBench, and OSWorld-Verified, while other tests remain led by Fable 5 or GPT-5.6 Sol.',
        'Those numbers are vendor-reported launch results, not independent leaderboard findings. Their significance is the breadth of the claim: Alibaba is presenting one model across software engineering, research reproduction, professional tasks, long-horizon work, visual reasoning, web development, mobile use, and desktop computer use.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Qwen\'s Max line had served as Alibaba\'s hosted frontier tier. A public 2.4T Max checkpoint would therefore be a larger openness shift than releasing another smaller derivative, even though practical local deployment would remain far beyond ordinary consumer hardware.',
        'The short promised gap between API launch and weight publication also creates a clear verification point: the model becomes an open-weight landmark when the downloadable checkpoint, license, and deployment details arrive—not merely when they are announced.',
      ],
    },
  ],
  sources: [
    {
      label: 'Alibaba Qwen: Qwen3.8-Max launch announcement on X',
      url: 'https://x.com/Alibaba_Qwen/status/2084100707423289643',
    },
    {
      label: 'Qwen: Qwen3.8 launch blog',
      url: 'https://qwen.ai/blog?id=qwen3.8',
    },
    {
      label: 'QwenCloud: Qwen3.8-Max model and API',
      url: 'https://www.qwencloud.com/models/qwen3.8-max',
    },
    {
      label: 'GitHub: Qwen3.8-Max autonomous coding project trace',
      url: 'https://github.com/qwen-code-dev-bot/oh-my-cli',
    },
  ],
};
