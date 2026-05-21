import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "gemini-managed-agents",
  "release": {
    "companyId": "google",
    "productLineId": "google-coding-tools",
    "name": "Managed Agents in Gemini API",
    "date": "2026-05-19"
  },
  "logo": {
    "modelLabel": "Managed Agents",
    "modelMark": "gemini"
  },
  "eyebrow": "Gemini API agent platform",
  "title": "Managed Agents brought Antigravity-style agents to the Gemini API",
  "dek": "Google announced Managed Agents in the Gemini API, letting developers run the Antigravity agent in an isolated cloud sandbox and define custom agents with instructions, skills, and data.",
  "summary": "Managed Agents turned Google agent infrastructure into an API product. Developers could create agents that reason, use tools, execute code, browse, and preserve environment state across interactions.",
  "impact": "The release put Google into the managed agent runtime competition, where the product is not only a model endpoint but an execution environment with files, tools, state, and sandboxing.",
  "facts": [
    {
      "label": "Provider",
      "value": "Google"
    },
    {
      "label": "Release date",
      "value": "May 19, 2026"
    },
    {
      "label": "API surface",
      "value": "Gemini API / Interactions API"
    },
    {
      "label": "Agent engine",
      "value": "Antigravity agent on Gemini 3.5 Flash"
    },
    {
      "label": "Execution",
      "value": "Isolated ephemeral Linux environment"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Google launched Managed Agents in the Gemini API with a single-call path to spin up an agent that reasons, uses tools, and executes code in an isolated Linux environment.",
        "The post also highlighted reusable agent definitions through files such as AGENTS.md and SKILL.md, making agent behavior more versionable."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "The release made cloud-hosted agent execution a first-class developer platform feature.",
        "For the timeline, it belongs beside coding harnesses because it changes what a model API can be: not just generation, but managed task execution with state and tools."
      ]
    }
  ],
  "sources": [
    {
      "label": "Google: Managed Agents in the Gemini API",
      "url": "https://blog.google/innovation-and-ai/technology/developers-tools/managed-agents-gemini-api/"
    },
    {
      "label": "Google: Developer highlights from I/O 2026",
      "url": "https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/"
    }
  ]
};
