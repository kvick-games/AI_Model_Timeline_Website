import type {ModelArticle} from '../types';
import {publicAssetPath} from '../publicAssets';

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
  "summary": "Claude Sonnet 5 is Anthropic's major Sonnet-class upgrade after Sonnet 4.6. It narrows the gap with Claude Opus 4.8 on agentic work while launching at a promotional $2 per million input tokens and $10 per million output tokens.",
  "impact": "The release matters because Sonnet is Anthropic's high-volume default model tier. Moving stronger planning, tool use, coding, and knowledge-work capability into that tier at a lower launch price raises the baseline for everyday Claude usage and cheaper developer agents.",
  "media": {
    "src": publicAssetPath("articles/claude-sonnet-5-benchmarks.png"),
    "alt": "Benchmark comparison table for Claude Sonnet 5 against Sonnet 4.6 and Opus 4.8 across agentic coding, multidisciplinary reasoning, computer use, and knowledge work.",
    "caption": "Anthropic's Sonnet 5 launch benchmarks show gains over Sonnet 4.6 and near-Opus 4.8 performance across agentic coding, reasoning, computer use, and knowledge-work tasks."
  },
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
      "label": "Intro cache-hit price",
      "value": "$0.20/M cached input tokens"
    },
    {
      "label": "Standard API pricing",
      "value": "$3/M input tokens; $15/M output tokens from September 1, 2026"
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
        "By putting stronger autonomous planning and tool work into the default model tier, Sonnet 5 raises the baseline for everyday Claude usage while giving developers a cheaper alternative to Opus 4.8 for many agent workflows.",
        "The price made that positioning sharper: Sonnet 5 opened at less than half Opus 4.8's current $5 input and $25 output rates while landing close to Opus on several launch benchmarks."
      ]
    },
    {
      "heading": "Safety and pricing",
      "body": [
        "Anthropic said pre-deployment evaluations showed lower undesirable-behavior rates than Sonnet 4.6 overall, with cyber safeguards enabled by default and lower dangerous cyber capability than current Opus models.",
        "The model launched with introductory Claude Platform pricing of $2 per million input tokens, $10 per million output tokens, and $0.20 per million cache-hit input tokens through August 31, 2026.",
        "On September 1, 2026, Anthropic says Sonnet 5 moves to standard pricing of $3 per million input tokens, $15 per million output tokens, and $0.30 per million cache-hit input tokens."
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
    },
    {
      "label": "Anthropic Sonnet 5 benchmark image",
      "url": "https://pbs.twimg.com/media/HMFGxPUXQAAM9OA?format=png&name=4096x4096"
    }
  ]
};
