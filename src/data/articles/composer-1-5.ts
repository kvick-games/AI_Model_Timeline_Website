import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "composer-1-5",
  "release": {
    "companyId": "cursor",
    "productLineId": "cursor-composer",
    "name": "Composer 1.5",
    "date": "2026-02-09"
  },
  "logo": {
    "modelLabel": "Composer 1.5",
    "modelMark": "cursor"
  },
  "eyebrow": "Thinking model update",
  "title": "Composer 1.5 brought reasoning and self-summary into Cursor coding",
  "dek": "Cursor released Composer 1.5 on February 9, 2026, describing it as a stronger daily-use coding model built by scaling reinforcement learning on the Composer 1 base.",
  "summary": "Composer 1.5 was the first major Composer upgrade after the initial launch. Cursor emphasized larger-scale reinforcement learning, thinking tokens for harder problems, and self-summarization so the model could continue through longer tasks when context ran short.",
  "impact": "The release made long-horizon behavior a named part of the Composer roadmap and showed Cursor tuning the model for sustained software work rather than only faster single-turn edits.",
  "facts": [
    {
      "label": "Provider",
      "value": "Cursor"
    },
    {
      "label": "Release date",
      "value": "February 9, 2026"
    },
    {
      "label": "Model family",
      "value": "Composer"
    },
    {
      "label": "Training focus",
      "value": "Scaled reinforcement learning"
    },
    {
      "label": "Primary shift",
      "value": "Thinking and self-summarization"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Cursor described Composer 1.5 as a significantly stronger model than Composer 1, trained by scaling reinforcement learning further on the same pretrained model.",
        "The release introduced a thinking-model framing for Composer and highlighted self-summarization for longer tasks, letting the model preserve useful context when it needed to keep exploring."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "Composer 1.5 shifted the Composer story from launch novelty to an improvement cadence. Cursor was showing that its own model could be iterated quickly with clearer long-task behavior.",
        "It also foreshadowed the later Composer 2 and 2.5 focus on long-running agent sessions, where memory, planning, and effort calibration matter as much as raw code generation."
      ]
    }
  ],
  "sources": [
    {
      "label": "Cursor: Introducing Composer 1.5",
      "url": "https://cursor.com/blog/composer-1-5"
    }
  ]
};
