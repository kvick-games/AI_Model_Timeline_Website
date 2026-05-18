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
  {
    slug: 'composer-1',
    release: {
      companyId: 'cursor',
      productLineId: 'cursor-composer',
      name: 'Composer 1',
      date: '2025-10-29',
    },
    logo: {
      modelLabel: 'Composer 1',
      modelMark: 'cursor',
    },
    eyebrow: 'First Cursor coding model',
    title: 'Composer made Cursor a model builder, not just an editor',
    dek: 'Cursor introduced Composer alongside Cursor 2.0 on October 29, 2025, presenting it as its first coding model built for low-latency agentic work inside the editor.',
    summary:
      'Composer 1 marked the point where Cursor moved beyond orchestrating third-party coding models and shipped its own agent model. Cursor described it as a fast frontier model for software engineering, trained with production search and editing tools and designed to keep multi-step coding work interactive.',
    impact:
      'The launch made the coding harness more vertically integrated: model behavior, agent tools, editor workflow, and multi-agent UI all became parts of the same product system.',
    facts: [
      {label: 'Provider', value: 'Cursor'},
      {label: 'Release date', value: 'October 29, 2025'},
      {label: 'Model family', value: 'Composer'},
      {label: 'Product surface', value: 'Cursor 2.0'},
      {label: 'Primary shift', value: 'First Cursor-built agentic coding model'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Cursor launched Composer with Cursor 2.0 as its first coding model, built for low-latency agentic coding and most turns completing in under 30 seconds.',
          'The technical post framed Composer as an agent model trained for real software engineering challenges with access to Cursor-style tools such as file editing, terminal use, and codebase-wide semantic search.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'Composer changed the shape of Cursor releases. Cursor was no longer only improving the editor shell around external models; it was also competing on the model layer that powers agent behavior.',
          'For the timeline, Composer 1 is the starting point for Cursor as a coding-model lab, with later Composer releases measuring progress against the same agentic software-engineering target.',
        ],
      },
    ],
    sources: [
      {label: 'Cursor: Introducing Cursor 2.0 and Composer', url: 'https://cursor.com/blog/2-0'},
      {label: 'Cursor: Composer technical launch post', url: 'https://cursor.com/blog/composer'},
    ],
  },
  {
    slug: 'composer-1-5',
    release: {
      companyId: 'cursor',
      productLineId: 'cursor-composer',
      name: 'Composer 1.5',
      date: '2026-02-09',
    },
    logo: {
      modelLabel: 'Composer 1.5',
      modelMark: 'cursor',
    },
    eyebrow: 'Thinking model update',
    title: 'Composer 1.5 brought reasoning and self-summary into Cursor coding',
    dek: 'Cursor released Composer 1.5 on February 9, 2026, describing it as a stronger daily-use coding model built by scaling reinforcement learning on the Composer 1 base.',
    summary:
      'Composer 1.5 was the first major Composer upgrade after the initial launch. Cursor emphasized larger-scale reinforcement learning, thinking tokens for harder problems, and self-summarization so the model could continue through longer tasks when context ran short.',
    impact:
      'The release made long-horizon behavior a named part of the Composer roadmap and showed Cursor tuning the model for sustained software work rather than only faster single-turn edits.',
    facts: [
      {label: 'Provider', value: 'Cursor'},
      {label: 'Release date', value: 'February 9, 2026'},
      {label: 'Model family', value: 'Composer'},
      {label: 'Training focus', value: 'Scaled reinforcement learning'},
      {label: 'Primary shift', value: 'Thinking and self-summarization'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Cursor described Composer 1.5 as a significantly stronger model than Composer 1, trained by scaling reinforcement learning further on the same pretrained model.',
          'The release introduced a thinking-model framing for Composer and highlighted self-summarization for longer tasks, letting the model preserve useful context when it needed to keep exploring.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'Composer 1.5 shifted the Composer story from launch novelty to an improvement cadence. Cursor was showing that its own model could be iterated quickly with clearer long-task behavior.',
          'It also foreshadowed the later Composer 2 and 2.5 focus on long-running agent sessions, where memory, planning, and effort calibration matter as much as raw code generation.',
        ],
      },
    ],
    sources: [
      {label: 'Cursor: Introducing Composer 1.5', url: 'https://cursor.com/blog/composer-1-5'},
    ],
  },
  {
    slug: 'composer-2',
    release: {
      companyId: 'cursor',
      productLineId: 'cursor-composer',
      name: 'Composer 2',
      date: '2026-03-19',
    },
    logo: {
      modelLabel: 'Composer 2',
      modelMark: 'cursor',
    },
    eyebrow: 'Frontier-level coding model',
    title: 'Composer 2 made Cursor compete on coding-model quality and cost',
    dek: 'Cursor released Composer 2 on March 19, 2026, calling it frontier-level at coding and pairing the upgrade with a lower-cost Standard tier and a faster default option.',
    summary:
      'Composer 2 was a larger step than the 1.5 update. Cursor reported large benchmark gains over Composer 1 and 1.5, tied the improvement to continued pretraining plus reinforcement learning, and priced the model as a core Cursor usage pool option.',
    impact:
      'The release made Composer a more direct competitor to external frontier coding models by combining quality, speed, and pricing into the same release story.',
    facts: [
      {label: 'Provider', value: 'Cursor'},
      {label: 'Release date', value: 'March 19, 2026'},
      {label: 'Model family', value: 'Composer'},
      {label: 'Training focus', value: 'Continued pretraining plus RL'},
      {label: 'Primary shift', value: 'Frontier-level coding quality and lower cost'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Composer 2 delivered large benchmark gains over Composer 1.5 and Composer 1, including CursorBench, Terminal-Bench 2.0, and SWE-bench Multilingual results reported by Cursor.',
          'Cursor said the quality jump came from its first continued-pretraining run followed by reinforcement learning on long-horizon coding tasks.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'Composer 2 made the model line feel like a serious platform bet. Cursor could now argue not only that Composer was fast inside the IDE, but that it was strong enough to anchor everyday agent work.',
          'The release also connected capability to economics: Standard and Fast tiers made model quality, latency, and usage pricing visible parts of the coding-tool competition.',
        ],
      },
    ],
    sources: [
      {label: 'Cursor: Introducing Composer 2', url: 'https://cursor.com/blog/composer-2'},
      {label: 'Cursor: Composer 2 technical report', url: 'https://cursor.com/resources/Composer2.pdf'},
    ],
  },
  {
    slug: 'cursor-spacex-partnership',
    release: {
      companyId: 'cursor',
      productLineId: 'cursor-events',
      name: 'SpaceXAI partnership',
      date: '2026-04-21',
    },
    logo: {
      modelLabel: 'SpaceXAI partnership',
      modelMark: 'cursor',
    },
    eyebrow: 'Compute partnership',
    title: 'Cursor and SpaceXAI turned Composer into a compute race',
    dek: 'On April 21, 2026, Cursor announced a SpaceX partnership to accelerate model training, giving the Composer line access to xAI Colossus infrastructure after Cursor described compute as its bottleneck.',
    summary:
      'The SpaceXAI partnership mattered because it moved Composer from an IDE-model story into the larger frontier-compute contest. Cursor said each step up in compute had translated into more capable Composer models, and that the partnership would let its team leverage xAI Colossus infrastructure to scale model intelligence.',
    impact:
      'For the AI timeline, the deal marked SpaceXAI trying to turn Colossus-scale infrastructure into a path toward the same frontier territory occupied by Anthropic, OpenAI, and Google, with Cursor as a high-usage coding surface for that push.',
    facts: [
      {label: 'Parties', value: 'Cursor and SpaceXAI / SpaceX'},
      {label: 'Announcement date', value: 'April 21, 2026'},
      {label: 'Infrastructure', value: 'xAI Colossus'},
      {label: 'Model line', value: 'Composer'},
      {label: 'Event type', value: 'Partnership'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Cursor publicly framed the partnership as a way to accelerate model training after Composer 1, Composer 1.5, and Composer 2 had each used more training scale to improve coding ability.',
          'The announcement made compute the explicit bottleneck. Cursor said it wanted to push training further and would use xAI Colossus infrastructure to dramatically scale the intelligence of its models.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'The deal made coding models part of the broader infrastructure race. SpaceXAI was no longer only a distant compute story; it had a concrete software-engineering model partner with a large developer distribution surface.',
          'That made the partnership a pivotal moment for anyone tracking whether SpaceXAI could close the gap with the established frontier labs. Cursor brought the product loop and coding data; SpaceXAI brought the training cluster narrative.',
        ],
      },
    ],
    sources: [
      {label: 'Cursor: SpaceX model-training partnership', url: 'https://cursor.com/blog/spacex-model-training'},
      {label: 'Axios: SpaceX nears deal with Cursor', url: 'https://www.axios.com/2026/04/21/spacex-ai-cursor-deal'},
    ],
  },
  {
    slug: 'composer-2-5',
    release: {
      companyId: 'cursor',
      productLineId: 'cursor-composer',
      name: 'Composer 2.5',
      date: '2026-05-18',
    },
    logo: {
      modelLabel: 'Composer 2.5',
      modelMark: 'cursor',
    },
    eyebrow: 'Agentic coding model release',
    title: 'Composer 2.5 pushed Cursor deeper into long-running coding work',
    dek: 'Cursor launched Composer 2.5 on May 18, 2026, positioning it as a stronger coding model for sustained software tasks, complex instruction following, and day-to-day collaboration inside Cursor.',
    summary:
      'Composer 2.5 matters because Cursor framed the release around behavior on longer coding sessions rather than only short benchmark wins. The model became available directly in Cursor with Standard and Fast tiers, and Cursor paired the launch with doubled included usage for the first week. It also arrived after Cursor had made the SpaceXAI compute partnership public, tying the Composer line to a much larger training-cluster story.',
    impact:
      'For agentic coding tools, the launch sharpened the competition around model behavior inside the IDE: reliability over many steps, instruction adherence, latency, and included usage all became part of the product story. It was also notable at a moment when general-user access to frontier coding models was getting expensive, because Cursor was positioning Composer against then-current premium competitors such as Claude 4.7 Opus and GPT-5.5 while keeping standard Composer pricing much lower.',
    facts: [
      {label: 'Provider', value: 'Cursor'},
      {label: 'Release date', value: 'May 18, 2026'},
      {label: 'Model family', value: 'Composer'},
      {label: 'Product surface', value: 'Cursor'},
      {label: 'Primary shift', value: 'Long-running coding task reliability'},
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          'Cursor made Composer 2.5 available in Cursor as a new Composer generation after Composer 2. The release emphasized stronger intelligence, more reliable handling of complex instructions, and better behavior during sustained work.',
          'The launch also came with two usage tiers: a lower-cost Standard mode and a faster default mode. Cursor temporarily doubled included usage for the first week, making the model easier for existing users to try immediately after launch.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'Composer 2.5 was not just another checkbox in a model picker. It showed Cursor continuing to treat the coding model itself as part of the IDE product, where quality is measured by how well it keeps context and executes over a long edit session.',
          'That makes the release important for the coding-harness timeline: the competitive unit is no longer only the assistant UI, but the pairing of editor workflow, agent behavior, model speed, and pricing.',
          'As a historical note, Composer 2.5 landed in a period when heavy coding-agent use was becoming expensive for general users. Cursor was making a cost-performance argument: a Composer model that could be discussed alongside Claude 4.7 Opus and GPT-5.5, but with Standard pricing that made repeated coding sessions easier to justify.',
          'The launch page also made the SpaceXAI thread harder to separate from the model roadmap. Cursor said it was training a significantly larger model from scratch with SpaceXAI using Colossus 2, which made the Composer line one of the first public foundation-model efforts tied directly to that new training partnership.',
        ],
      },
    ],
    sources: [
      {label: 'Cursor: Introducing Composer 2.5', url: 'https://cursor.com/blog/composer-2-5'},
      {label: 'Cursor: Composer 2.5 changelog', url: 'https://cursor.com/changelog/composer-2-5'},
      {label: 'Cursor: Composer 2.5 announcement on X', url: 'https://x.com/cursor_ai/status/2056415413077233983'},
    ],
  },
];

export const modelArticlesBySlug = modelArticles.reduce<Record<string, ModelArticle>>((articles, article) => {
  articles[article.slug] = article;
  return articles;
}, {});
