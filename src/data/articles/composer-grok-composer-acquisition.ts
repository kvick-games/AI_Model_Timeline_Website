import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "composer-grok-composer-acquisition",
  "release": {
    "companyId": "cursor",
    "productLineId": "cursor-composer",
    "name": "Composer -> Grok Composer",
    "date": "2026-06-16"
  },
  "logo": {
    "modelLabel": "Grok Composer",
    "modelMark": "xai"
  },
  "eyebrow": "Acquisition and rename",
  "title": "SpaceX turned Composer into Grok Composer",
  "dek": "On June 16, 2026, SpaceX exercised its option to acquire Cursor in an all-stock transaction, turning the Composer model line into a SpaceXAI-owned coding model lineage.",
  "summary": "The acquisition changed how the timeline should read Composer: the pre-acquisition releases remain Cursor history, but the model family continues forward under the Grok Composer name. That keeps the technical lineage intact while making the ownership and branding shift visible.",
  "impact": "For agentic coding, the deal joined Cursor's developer surface and Composer training loop with SpaceXAI's compute story. It made coding models a central part of SpaceXAI's enterprise AI push rather than only a feature inside Cursor.",
  "facts": [
    {
      "label": "Acquirer",
      "value": "SpaceX"
    },
    {
      "label": "Acquired company",
      "value": "Cursor / Anysphere"
    },
    {
      "label": "Transaction",
      "value": "$60B all-stock option exercise"
    },
    {
      "label": "Timeline label",
      "value": "Grok Composer"
    },
    {
      "label": "Event type",
      "value": "Acquisition"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "SpaceX exercised the acquisition option that had been attached to the April model-training partnership with Cursor. The timeline records that as a dated ownership event inside the Composer lane, not as a separate SpaceXAI model family.",
        "The historical Composer releases keep their original names. Releases after the acquisition should use the Grok Composer name so the board shows both continuity and the new SpaceXAI ownership."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "Cursor had already said training scale was the bottleneck for making Composer more capable, and the April partnership gave the team access to SpaceXAI's Colossus infrastructure.",
        "SpaceXAI then shipped Composer 2.5 inside Grok Build before the acquisition, which made the naming collision visible: the same coding model line was now appearing in both Cursor's model story and SpaceXAI's developer tooling.",
        "Treating the June 16 event as a bridge preserves the product history. Composer began as Cursor's own coding model; Grok Composer is the post-acquisition continuation of that line."
      ]
    }
  ],
  "sources": [
    {
      "label": "TechCrunch: SpaceX to acquire Cursor for $60B",
      "url": "https://techcrunch.com/2026/06/16/spacex-to-acquire-cursor-for-60b-in-stock-days-after-blockbuster-ipo/"
    },
    {
      "label": "SpaceX acquisition announcement on X",
      "url": "https://x.com/SpaceX/status/2066873915717136548"
    },
    {
      "label": "Cursor: SpaceX model-training partnership",
      "url": "https://cursor.com/blog/spacex-model-training"
    },
    {
      "label": "SpaceXAI: Composer 2.5 in Grok Build",
      "url": "https://x.ai/news/composer-2-5"
    }
  ]
};
