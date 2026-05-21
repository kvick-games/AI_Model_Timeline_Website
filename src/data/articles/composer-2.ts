import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "composer-2",
  "release": {
    "companyId": "cursor",
    "productLineId": "cursor-composer",
    "name": "Composer 2",
    "date": "2026-03-19"
  },
  "logo": {
    "modelLabel": "Composer 2",
    "modelMark": "cursor"
  },
  "eyebrow": "Frontier-level coding model",
  "title": "Composer 2 made Cursor compete on coding-model quality and cost",
  "dek": "Cursor released Composer 2 on March 19, 2026, calling it frontier-level at coding and pairing the upgrade with a lower-cost Standard tier and a faster default option.",
  "summary": "Composer 2 was a larger step than the 1.5 update. Cursor reported large benchmark gains over Composer 1 and 1.5, tied the improvement to continued pretraining plus reinforcement learning, and priced the model as a core Cursor usage pool option.",
  "impact": "The release made Composer a more direct competitor to external frontier coding models by combining quality, speed, and pricing into the same release story.",
  "facts": [
    {
      "label": "Provider",
      "value": "Cursor"
    },
    {
      "label": "Release date",
      "value": "March 19, 2026"
    },
    {
      "label": "Model family",
      "value": "Composer"
    },
    {
      "label": "Training focus",
      "value": "Continued pretraining plus RL"
    },
    {
      "label": "Primary shift",
      "value": "Frontier-level coding quality and lower cost"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Composer 2 delivered large benchmark gains over Composer 1.5 and Composer 1, including CursorBench, Terminal-Bench 2.0, and SWE-bench Multilingual results reported by Cursor.",
        "Cursor said the quality jump came from its first continued-pretraining run followed by reinforcement learning on long-horizon coding tasks."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "Composer 2 made the model line feel like a serious platform bet. Cursor could now argue not only that Composer was fast inside the IDE, but that it was strong enough to anchor everyday agent work.",
        "The release also connected capability to economics: Standard and Fast tiers made model quality, latency, and usage pricing visible parts of the coding-tool competition."
      ]
    }
  ],
  "sources": [
    {
      "label": "Cursor: Introducing Composer 2",
      "url": "https://cursor.com/blog/composer-2"
    },
    {
      "label": "Cursor: Composer 2 technical report",
      "url": "https://cursor.com/resources/Composer2.pdf"
    }
  ]
};
