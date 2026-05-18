import type {ModelArticle} from './types';

export const modelArticles: ModelArticle[] = [
  {
    slug: 'gpt-4o',
    release: {
      companyId: 'openai',
      productLineId: 'openai-gpt',
      name: 'GPT-4o',
      date: '2024-05-13',
    },
    logo: {
      modelLabel: 'GPT-4o',
      modelMark: 'gpt',
    },
    eyebrow: 'Native multimodal flagship',
    title: 'GPT-4o made voice, vision, and text feel like one model',
    dek: 'OpenAI positioned GPT-4o as an omni model: faster than GPT-4 class systems, available across ChatGPT, and built to handle text, image, and audio interactions with lower latency.',
    summary:
      'GPT-4o moved the public flagship conversation away from text-only model quality and toward interaction speed. The important shift was not just that it could read images or speak back, but that OpenAI framed those modes as part of the same product surface.',
    impact:
      'Its launch reset expectations for consumer AI assistants: realtime response, multimodal input, and broader free-tier access became part of the competitive baseline.',
    facts: [
      {label: 'Provider', value: 'OpenAI'},
      {label: 'Release date', value: 'May 13, 2024'},
      {label: 'Model family', value: 'GPT'},
      {label: 'Primary shift', value: 'Low-latency multimodal interaction'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'GPT-4o was presented as a single flagship model that could work across text, images, and audio instead of routing each mode through a visibly separate experience.',
          'For users, the most visible change was speed. The model helped make voice interaction feel less like dictation and more like an active conversation loop.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'The release showed that frontier progress was being judged by interface feel as much as benchmark tables. A model could become more important because it collapsed friction between modalities.',
          'It also widened access to stronger capabilities in ChatGPT, making the competitive pressure less about a premium-only model and more about the default assistant people touched every day.',
        ],
      },
    ],
    sources: [
      {label: 'OpenAI: Hello GPT-4o', url: 'https://openai.com/index/hello-gpt-4o/'},
      {
        label: 'OpenAI: GPT-4o and more tools to ChatGPT free users',
        url: 'https://openai.com/index/gpt-4o-and-more-tools-to-chatgpt-free/',
      },
      {label: 'OpenAI: GPT-4o system card', url: 'https://cdn.openai.com/gpt-4o-system-card.pdf'},
    ],
  },
  {
    slug: 'claude-3-5',
    release: {
      companyId: 'anthropic',
      productLineId: 'anthropic-claude',
      name: 'Claude 3.5',
      date: '2024-06-20',
    },
    logo: {
      modelLabel: 'Claude 3.5 Sonnet',
      modelMark: 'claude',
    },
    eyebrow: 'Coding and workbench leap',
    title: 'Claude 3.5 Sonnet turned Claude into a daily work model',
    dek: 'Anthropic used Claude 3.5 Sonnet to push the Claude line forward on coding, visual reasoning, and multistep work while keeping the fast Sonnet tier as the center of gravity.',
    summary:
      'Claude 3.5 Sonnet mattered because it made the efficient middle of the Claude family feel like the main product. It was fast enough for everyday use and strong enough for software, analysis, and document-heavy tasks.',
    impact:
      'The release sharpened the idea that the best practical model is often the one with the best balance of reasoning, latency, and tool workflow behavior.',
    facts: [
      {label: 'Provider', value: 'Anthropic'},
      {label: 'Release date', value: 'June 20, 2024'},
      {label: 'Model family', value: 'Claude'},
      {label: 'Primary shift', value: 'Fast frontier-class work model'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Claude 3.5 Sonnet was introduced as the first model in the Claude 3.5 family and quickly became the reference point for Claude-based coding and office work.',
          'Anthropic emphasized stronger benchmark performance, better visual reasoning, and a product experience that made artifacts and iterative work more central.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'The launch made Sonnet feel less like a compromise tier. It pushed competitors to answer not only with larger flagship models, but with models that were quick and economical enough to keep open all day.',
          'For builders, it helped normalize Claude as a serious default for code review, planning, prose editing, and tool-assisted workflows.',
        ],
      },
    ],
    sources: [
      {label: 'Anthropic: Introducing Claude 3.5 Sonnet', url: 'https://www.anthropic.com/news/claude-3-5-sonnet'},
      {
        label: 'Anthropic: Claude 3 model card addendum',
        url: 'https://www-cdn.anthropic.com/c6a80a657af445f40e31afac050f3bf76d3b1404.pdf',
      },
    ],
  },
  {
    slug: 'gemini-2-5',
    release: {
      companyId: 'google',
      productLineId: 'google-gemini',
      name: 'Gemini 2.5',
      date: '2025-03-25',
    },
    logo: {
      modelLabel: 'Gemini 2.5',
      modelMark: 'gemini',
    },
    eyebrow: 'Thinking model pivot',
    title: 'Gemini 2.5 put explicit reasoning at the center of Google model releases',
    dek: 'Google introduced Gemini 2.5 Pro as a model with thinking built into the release story, tying Gemini progress to longer reasoning, coding, and complex problem solving.',
    summary:
      'Gemini 2.5 marked a visible pivot in Google DeepMind messaging: model releases were no longer only about multimodal breadth, but about deliberate reasoning behavior as a headline capability.',
    impact:
      'The release helped make "thinking" a product category rather than a hidden implementation detail, especially for developers comparing frontier models on code and analysis tasks.',
    facts: [
      {label: 'Provider', value: 'Google'},
      {label: 'Release date', value: 'March 25, 2025'},
      {label: 'Model family', value: 'Gemini'},
      {label: 'Primary shift', value: 'Reasoning-first flagship framing'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Gemini 2.5 Pro was presented as Google’s newest model with thinking, available first through developer and Gemini surfaces before wider platform rollout.',
          'The model emphasized stronger performance on complex coding and reasoning tasks, making Gemini more directly comparable with other reasoning-focused releases.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'Google had already built a broad multimodal Gemini line. Gemini 2.5 made the important question whether Gemini could also compete in the slower, harder tasks where users expect visible deliberation.',
          'For the timeline, it marks the point where reasoning became a named part of Gemini’s release cadence rather than an assumed property of scale.',
        ],
      },
    ],
    sources: [
      {
        label: 'Google: Gemini 2.5, our newest Gemini model with thinking',
        url: 'https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/',
      },
    ],
  },
  {
    slug: 'deepseek-r1',
    release: {
      companyId: 'deepseek',
      productLineId: 'deepseek-models',
      name: 'DeepSeek-R1',
      date: '2025-01-20',
    },
    logo: {
      modelLabel: 'DeepSeek-R1',
      modelMark: 'deepseek',
    },
    eyebrow: 'Open reasoning shock',
    title: 'DeepSeek-R1 made open reasoning models impossible to ignore',
    dek: 'DeepSeek-R1 paired a reasoning-focused release with open weights and distilled variants, putting pressure on assumptions about frontier model cost, access, and geography.',
    summary:
      'DeepSeek-R1 became a turning point because it was not just another strong model. It arrived as an open release that developers could inspect, host, adapt, and compare against closed reasoning systems.',
    impact:
      'The release broadened the race from closed flagship APIs to open reasoning systems that could travel quickly through research labs, startups, and local inference communities.',
    facts: [
      {label: 'Provider', value: 'DeepSeek'},
      {label: 'Release date', value: 'January 20, 2025'},
      {label: 'Model family', value: 'DeepSeek'},
      {label: 'Primary shift', value: 'Open-weight reasoning release'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'DeepSeek-R1 introduced first-generation reasoning models and released both main checkpoints and distilled models based on Qwen and Llama families.',
          'The release made reasoning behavior something many teams could test outside a single hosted product, changing how quickly model capabilities could be reproduced and debated.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'R1 compressed several debates into one launch: open weights versus closed APIs, Chinese labs versus US frontier labs, and whether high-end reasoning required the same capital assumptions as earlier frontier models.',
          'On a timeline, R1 is a pressure point. Releases after it had to answer not only with model quality, but with a clearer story about cost, openness, and deployment control.',
        ],
      },
    ],
    sources: [
      {label: 'DeepSeek-AI: DeepSeek-R1 GitHub release', url: 'https://github.com/deepseek-ai/DeepSeek-R1'},
      {label: 'DeepSeek-R1 paper', url: 'https://arxiv.org/abs/2501.12948'},
    ],
  },
  {
    slug: 'sora-preview',
    release: {
      companyId: 'openai',
      productLineId: 'openai-sora',
      name: 'Sora Preview',
      date: '2024-02-15',
    },
    logo: {
      modelLabel: 'Sora',
      modelMark: 'sora',
    },
    eyebrow: 'Text-to-video preview',
    title: 'Sora preview turned video generation into the next frontier demo',
    dek: 'OpenAI previewed Sora as a text-to-video model capable of long, coherent clips, framing video generation as a path toward richer world simulation.',
    summary:
      'Sora’s preview mattered because it made video generation feel less like a short novelty clip and more like a frontier research direction. The announcement showed examples that pushed attention toward motion, scene consistency, and physical plausibility.',
    impact:
      'It raised the bar for generative media labs and made video model releases a first-class track next to text, image, and coding systems.',
    facts: [
      {label: 'Provider', value: 'OpenAI'},
      {label: 'Release date', value: 'February 15, 2024'},
      {label: 'Model family', value: 'Sora'},
      {label: 'Primary shift', value: 'Long-form text-to-video capability'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'OpenAI introduced Sora through a research preview, showing generated clips with complex scenes, multiple subjects, and camera-like movement.',
          'The technical framing connected video generation to world simulation, which made the announcement feel broader than a creative-tool launch.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'Sora turned text-to-video into a visible frontier category. It also forced product and safety questions into the same conversation: provenance, misinformation, artist feedback, and access controls.',
          'For timeline readers, Sora Preview marks the moment video models became part of the same release cadence conversation as LLMs and image generators.',
        ],
      },
    ],
    sources: [
      {
        label: 'OpenAI: Video generation models as world simulators',
        url: 'https://openai.com/index/video-generation-models-as-world-simulators/',
      },
      {label: 'OpenAI: Sora system card', url: 'https://openai.com/index/sora-system-card/'},
    ],
  },
  {
    slug: 'figure-f03-livestream',
    release: {
      companyId: 'figure',
      productLineId: 'figure-humanoids',
      name: 'F.03 livestream',
      date: '2026-05-13',
      endDate: '2026-05-17',
    },
    logo: {
      modelLabel: 'F.03 livestream',
      modelMark: 'figure',
    },
    eyebrow: 'Humanoid shift livestream',
    title: 'Figure made robot endurance part of the humanoid race',
    dek: 'Figure used a multi-day public stream to show Figure 03 / F.03 humanoids sorting packages, then pushed the fourth-day spectacle into a human-intern-versus-robot race.',
    summary:
      'The May 13-17, 2026 livestream marked a notable Figure milestone because it put a repetitive logistics task in front of the public for days. Figure framed the work as autonomous package sorting by multiple humanoids, with the robots detecting barcodes, reorienting packages, and keeping the conveyor moving.',
    impact:
      'For humanoid robotics, the event shifted attention from single-task highlight reels toward duration, reliability claims, multi-robot handoff behavior, and publicity-ready human comparisons. It made operational endurance a visible benchmark in the AI robotics timeline.',
    media: {
      src: 'articles/figure-f03-livestream.png',
      alt: 'Screenshot of the Figure F.03 livestream showing a human and a Figure robot sorting packages side by side on X.',
      caption: 'By the fourth-day publicity beat, Figure framed the stream as a direct “Man vs. Machine” package-sorting comparison, with public counters for time, package totals, and live chat reaction.',
    },
    facts: [
      {label: 'Provider', value: 'Figure'},
      {label: 'Event window', value: 'May 13-17, 2026'},
      {label: 'Event type', value: 'Livestream'},
      {label: 'Robot line', value: 'F.03 / Figure 03'},
      {label: 'System context', value: 'Figure 03 public livestream'},
      {label: 'Publicity beat', value: 'Human intern vs. Figure 03 race'},
      {label: 'Primary task', value: 'Small-package sorting'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Figure presented the stream as a multi-day warehouse-task broadcast rather than a short edited demo. The robots sorted small packages by finding the barcode, picking up the item, and placing it barcode-down onto a conveyor.',
          'The event also made coordination part of the claim: Figure described multiple humanoids sharing work, swapping when batteries ran low, and keeping the system running without a person in the loop.',
          'On the fourth day, May 17, Brett Adcock amplified the stream as a race between Figure 03 and a human intern at Figure. That turned the endurance demo into a publicity stunt: a direct, readable contest between embodied AI and human labor on the same package-sorting task.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'Humanoid robot progress is hard to judge from polished clips. A long-running public stream gave observers a more concrete artifact to inspect, debate, and compare against other embodied AI efforts.',
          'The human-versus-Figure framing made the benchmark legible outside robotics circles. It was not just a technical uptime claim; it was a public comparison meant to make speed, consistency, and fatigue part of the product story.',
          'On this timeline, the livestream is not just a Figure 03 demo. It marks the point where public robotics releases started looking more like operational reliability tests and media events at the same time.',
        ],
      },
    ],
    sources: [
      {label: 'X broadcast supplied for this timeline entry', url: 'https://x.com/i/broadcasts/1aJbdbgeAaQKX'},
      {label: 'Figure: initial stream announcement on X', url: 'https://x.com/Figure_robot/status/2054603845393875452'},
      {label: 'Brett Adcock: Human vs Figure 03 race on X', url: 'https://x.com/adcock_brett/status/2055839308662358139'},
      {label: 'Digg: Figure AI launches eight-hour robot livestream', url: 'https://digg.com/ai/uqxd5t9s'},
      {label: 'Figure: Helix, a VLA model for humanoid control', url: 'https://www.figure.ai/news/helix'},
      {label: 'Figure: Introducing Figure 03', url: 'https://www.figure.ai/news/introducing-figure-03'},
    ],
  },
];

export const modelArticlesBySlug = modelArticles.reduce<Record<string, ModelArticle>>((articles, article) => {
  articles[article.slug] = article;
  return articles;
}, {});
