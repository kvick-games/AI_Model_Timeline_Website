import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "composer-1",
  "release": {
    "companyId": "cursor",
    "productLineId": "cursor-composer",
    "name": "Composer 1",
    "date": "2025-10-29"
  },
  "logo": {
    "modelLabel": "Composer 1",
    "modelMark": "cursor"
  },
  "eyebrow": "First Cursor coding model",
  "title": "Composer made Cursor a model builder, not just an editor",
  "dek": "Cursor introduced Composer alongside Cursor 2.0 on October 29, 2025, presenting it as its first coding model built for low-latency agentic work inside the editor.",
  "summary": "Composer 1 marked the point where Cursor moved beyond orchestrating third-party coding models and shipped its own agent model. Cursor described it as a fast frontier model for software engineering, trained with production search and editing tools and designed to keep multi-step coding work interactive.",
  "impact": "The launch made the coding harness more vertically integrated: model behavior, agent tools, editor workflow, and multi-agent UI all became parts of the same product system.",
  "facts": [
    {
      "label": "Provider",
      "value": "Cursor"
    },
    {
      "label": "Release date",
      "value": "October 29, 2025"
    },
    {
      "label": "Model family",
      "value": "Composer"
    },
    {
      "label": "Product surface",
      "value": "Cursor 2.0"
    },
    {
      "label": "Primary shift",
      "value": "First Cursor-built agentic coding model"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Cursor launched Composer with Cursor 2.0 as its first coding model, built for low-latency agentic coding and most turns completing in under 30 seconds.",
        "The technical post framed Composer as an agent model trained for real software engineering challenges with access to Cursor-style tools such as file editing, terminal use, and codebase-wide semantic search."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "Composer changed the shape of Cursor releases. Cursor was no longer only improving the editor shell around external models; it was also competing on the model layer that powers agent behavior.",
        "For the timeline, Composer 1 is the starting point for Cursor as a coding-model lab, with later Composer releases measuring progress against the same agentic software-engineering target."
      ]
    }
  ],
  "sources": [
    {
      "label": "Cursor: Introducing Cursor 2.0 and Composer",
      "url": "https://cursor.com/blog/2-0"
    },
    {
      "label": "Cursor: Composer technical launch post",
      "url": "https://cursor.com/blog/composer"
    }
  ]
};
