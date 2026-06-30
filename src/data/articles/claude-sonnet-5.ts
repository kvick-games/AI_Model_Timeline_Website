import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "claude-sonnet-5",
  "release": {
    "companyId": "anthropic",
    "productLineId": "anthropic-claude",
    "name": "Claude Sonnet 5",
    "date": "2026-06-30"
  },
  "logo": {
    "modelLabel": "Sonnet 5",
    "modelMark": "claude"
  },
  "eyebrow": "Agentic Sonnet upgrade",
  "title": "Claude Sonnet 5 brought near-Opus agentic work to Anthropic's default model tier",
  "dek": "Anthropic released Claude Sonnet 5 on June 30, 2026, positioning it as the most agentic Sonnet model yet and making it the default model for Claude Free and Pro users.",
  "summary": "Claude Sonnet 5 is Anthropic's major Sonnet-class upgrade after Sonnet 4.6. It narrows the gap with Claude Opus 4.8 on agentic work while staying cheaper, and it launches across Claude, Claude Code, and the Claude Platform.",
  "impact": "The release matters because Sonnet is Anthropic's high-volume default model tier. Moving stronger planning, tool use, coding, and knowledge-work capability into that tier raises the baseline for everyday Claude usage and lower-cost developer agents.",
  "facts": [
    {
      "label": "Provider",
      "value": "Anthropic"
    },
    {
      "label": "Release date",
      "value": "June 30, 2026"
    },
    {
      "label": "Developer model ID",
      "value": "claude-sonnet-5"
    },
    {
      "label": "Launch availability",
      "value": "All Claude plans, Claude Code, and Claude Platform"
    },
    {
      "label": "Default plans",
      "value": "Free and Pro"
    },
    {
      "label": "Intro API pricing",
      "value": "$2/M input tokens; $10/M output tokens through August 31, 2026"
    },
    {
      "label": "Standard API pricing",
      "value": "$3/M input tokens; $15/M output tokens"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Anthropic introduced Claude Sonnet 5 as a substantial upgrade over Sonnet 4.6, with stronger reasoning, tool use, coding, knowledge work, and agentic performance.",
        "The launch positioned Sonnet 5 close to Opus 4.8 on many agentic tasks, while keeping the Sonnet line as the lower-priced option for high-volume professional work and developer agents."
      ]
    },
    {
      "heading": "How it ships",
      "body": [
        "Sonnet 5 became available across all Claude plans on launch day, including as the default model for Free and Pro users and as an option for Max, Team, and Enterprise users.",
        "Developers can call it as claude-sonnet-5 through the Claude API, with availability also extending to Claude Code and the broader Claude Platform."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "Claude's Sonnet tier has historically been the line where Anthropic's agentic coding and tool-use improvements reach the broadest audience.",
        "By putting stronger autonomous planning and tool work into the default model tier, Sonnet 5 raises the baseline for everyday Claude usage while giving developers a cheaper alternative to Opus 4.8 for many agent workflows."
      ]
    },
    {
      "heading": "Safety and pricing",
      "body": [
        "Anthropic said pre-deployment evaluations showed lower undesirable-behavior rates than Sonnet 4.6 overall, with cyber safeguards enabled by default and lower dangerous cyber capability than current Opus models.",
        "The model launched with introductory Claude Platform pricing of $2 per million input tokens and $10 per million output tokens through August 31, 2026, before moving to $3 per million input tokens and $15 per million output tokens."
      ]
    }
  ],
  "sources": [
    {
      "label": "Anthropic: Introducing Claude Sonnet 5",
      "url": "https://www.anthropic.com/news/claude-sonnet-5"
    },
    {
      "label": "Anthropic: Claude Sonnet",
      "url": "https://www.anthropic.com/claude/sonnet"
    }
  ]
};
