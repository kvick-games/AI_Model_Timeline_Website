import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "claude-fable-5",
  "release": {
    "companyId": "anthropic",
    "productLineId": "anthropic-claude",
    "name": "Claude Fable 5",
    "date": "2026-06-09"
  },
  "logo": {
    "modelLabel": "Fable 5",
    "modelMark": "claude"
  },
  "eyebrow": "Public Mythos-class Claude",
  "title": "Claude Fable 5 brought Mythos-class capabilities to general use",
  "dek": "Anthropic launched Claude Fable 5 on June 9, 2026 as its most capable generally available Claude model, pairing Mythos-class performance with safeguards for higher-risk domains.",
  "summary": "Claude Fable 5 is the public release path for Anthropic's new Mythos-class model tier. It is positioned above Opus in capability, with particular emphasis on long-horizon software engineering, knowledge work, vision, memory, and scientific research.",
  "impact": "Fable 5 moves the Claude frontier beyond the Opus line while making safety controls part of the product boundary: sensitive cyber, biology, chemistry, and distillation requests fall back to Claude Opus 4.8 instead of using the unrestricted Mythos-class model.",
  "facts": [
    {
      "label": "Provider",
      "value": "Anthropic"
    },
    {
      "label": "Release date",
      "value": "June 9, 2026"
    },
    {
      "label": "Model tier",
      "value": "Mythos-class"
    },
    {
      "label": "Developer model ID",
      "value": "claude-fable-5"
    },
    {
      "label": "API pricing",
      "value": "$10/M input tokens; $50/M output tokens"
    },
    {
      "label": "Safety fallback",
      "value": "Claude Opus 4.8 for flagged domains"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Anthropic introduced Fable 5 as the generally available version of its Mythos-class model tier, with Claude Mythos 5 reserved for select trusted-access users and Project Glasswing partners.",
        "The launch framed Fable 5 as Anthropic's strongest public model to date, especially on longer autonomous tasks across software engineering, knowledge work, vision, memory, and scientific research."
      ]
    },
    {
      "heading": "How access works",
      "body": [
        "Fable 5 is available through Claude and the Claude API under the developer model ID claude-fable-5.",
        "Anthropic priced both Fable 5 and Mythos 5 at $10 per million input tokens and $50 per million output tokens, while noting a staged rollout for subscription-plan access because of expected demand."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "Fable 5 is the first public Claude release to make Mythos-class capability broadly accessible, shifting Anthropic's frontier story from the Opus line to a higher model tier.",
        "The release also makes safeguards a defining product feature: requests flagged in domains such as cybersecurity, biology and chemistry, or model distillation are handled by Claude Opus 4.8 instead of the Fable 5 model."
      ]
    }
  ],
  "sources": [
    {
      "label": "Claude on X: Claude Fable 5 announcement",
      "url": "https://x.com/claudeai/status/2064394146916229443"
    },
    {
      "label": "Anthropic: Claude Fable 5 and Claude Mythos 5",
      "url": "https://www.anthropic.com/news/claude-fable-5-mythos-5"
    }
  ]
};
