import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "spacex-cursor-acquisition",
  "release": {
    "companyId": "spacex",
    "productLineId": "spacex-events",
    "name": "SpaceX acquires Cursor",
    "date": "2026-06-16"
  },
  "logo": {
    "modelLabel": "SpaceX acquires Cursor",
    "modelMark": "spacex"
  },
  "eyebrow": "SpaceX acquisition event",
  "title": "SpaceX's Cursor acquisition became its own AI timeline row",
  "dek": "On June 16, 2026, SpaceX exercised its option to acquire Cursor, creating a SpaceX-side ownership marker beside the existing xAI and Cursor Composer entries.",
  "summary": "This entry records the acquisition from SpaceX's row. The Cursor row preserves the Composer-to-Grok-Composer lineage, the xAI row mirrors the Grok Build rebrand and acquisition context, and the SpaceX row shows the acquiring company as a first-class participant.",
  "impact": "Adding SpaceX as an adjacent row makes the ownership structure legible without splitting the Composer family. It keeps SpaceX's corporate action attached to xAI while still showing Cursor as the origin of the coding model line.",
  "facts": [
    {
      "label": "Company timeline",
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
      "label": "Related line",
      "value": "Composer -> Grok Composer"
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
        "SpaceX's acquisition moved Cursor from the April model-training partnership into a SpaceX-owned developer tooling and model-training story.",
        "The timeline now shows that corporate event in three connected places: Cursor for lineage, xAI for Grok Build and SpaceXAI context, and SpaceX for the acquiring company."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "The acquisition gave SpaceX a direct software surface for its AI ambitions: Cursor's coding agent workflow and the Composer model line.",
        "It also clarified why later Composer-family labeling should read as Grok Composer while historical Cursor releases keep their original Composer names."
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
      "label": "xAI: Composer 2.5 in Grok Build",
      "url": "https://x.ai/news/composer-2-5"
    }
  ]
};
