import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "claude-opus-4-8",
  "release": {
    "companyId": "anthropic",
    "productLineId": "anthropic-claude",
    "name": "Claude 4.8 Opus",
    "date": "2026-05-28"
  },
  "logo": {
    "modelLabel": "Claude Opus 4.8",
    "modelMark": "claude"
  },
  "eyebrow": "Flagship reasoning update",
  "title": "Claude Opus 4.8 retakes the lead across agentic benchmarks",
  "dek": "Anthropic refreshed the top of the Claude line with Opus 4.8, posting gains over Opus 4.7 on coding, reasoning, computer use, and agentic finance work.",
  "summary": "Claude Opus 4.8 is the latest step in Anthropic's flagship Opus track, arriving roughly six weeks after Opus 4.7. Anthropic's launch benchmarks show it leading Opus 4.7, GPT-5.5, and Gemini 3.1 Pro on most agentic tasks, with GPT-5.5 still ahead on terminal coding.",
  "impact": "The update keeps Anthropic at the frontier as rival labs ship on a similarly compressed schedule, reinforcing Opus as the high-capability anchor of the Claude family.",
  "media": {
    "src": "articles/claude-opus-4-8.png",
    "alt": "Benchmark comparison table for Claude Opus 4.8 against Opus 4.7, GPT-5.5, and Gemini 3.1 Pro across agentic coding, terminal coding, reasoning, computer use, knowledge work, and financial analysis.",
    "caption": "Anthropic's launch benchmarks: Opus 4.8 leads on SWE-Bench Pro (69.2%), Humanity's Last Exam, OSWorld-Verified (83.4%), GDPval-AA (1890), and Finance Agent v2 (53.9%), while GPT-5.5 stays ahead on Terminal-Bench 2.1 (78.2% vs 74.6%)."
  },
  "facts": [
    {
      "label": "Provider",
      "value": "Anthropic"
    },
    {
      "label": "Release date",
      "value": "May 28, 2026"
    },
    {
      "label": "Agentic coding (SWE-Bench Pro)",
      "value": "69.2%"
    },
    {
      "label": "Computer use (OSWorld-Verified)",
      "value": "83.4%"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Claude Opus 4.8 continues the Opus 4.x line, following Opus 4.7 in April 2026 and Opus 4.5 in late 2025.",
        "On Anthropic's launch benchmarks it improves over Opus 4.7 on agentic coding (69.2% vs 64.3% on SWE-Bench Pro), multidisciplinary reasoning (57.9% with tools on Humanity's Last Exam), agentic computer use (83.4% on OSWorld-Verified), knowledge work (1890 on GDPval-AA), and agentic financial analysis (53.9% on Finance Agent v2)."
      ]
    },
    {
      "heading": "Where it trails",
      "body": [
        "GPT-5.5 remained the leader on agentic terminal coding, scoring 78.2% on Terminal-Bench 2.1 against Opus 4.8's 74.6%.",
        "Across the rest of the published suite, Opus 4.8 led Opus 4.7, GPT-5.5, and Gemini 3.1 Pro."
      ]
    },
    {
      "heading": "Why it matters",
      "body": [
        "The release sustains an unusually fast flagship cadence, with successive Opus updates landing only weeks apart.",
        "It keeps pressure on competing frontier labs that have been shipping on a similarly compressed schedule."
      ]
    }
  ],
  "sources": [
    {
      "label": "Anthropic on X: Claude Opus 4.8 announcement",
      "url": "https://x.com/claudeai/status/2060042702150930686"
    }
  ]
};
