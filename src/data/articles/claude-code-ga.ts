import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "claude-code-ga",
  "release": {
    "companyId": "anthropic",
    "productLineId": "anthropic-claude-code",
    "name": "Claude Code GA",
    "date": "2025-05-22"
  },
  "logo": {
    "modelLabel": "Claude Code",
    "modelMark": "anthropic"
  },
  "eyebrow": "Coding harness release",
  "title": "Claude Code GA made Anthropic's coding agent generally available",
  "dek": "GA means general availability: on May 22, 2025, Anthropic moved Claude Code beyond its limited research preview and made it a generally available coding harness alongside the Claude 4 launch.",
  "summary": "Claude Code GA was not a new model checkpoint. It was the production availability milestone for Anthropic's agentic coding harness: a developer tool that brings Claude into terminal, IDE, SDK, and background-task workflows.",
  "impact": "The release made Claude Code a first-class Anthropic developer product rather than only a preview attached to a model launch, putting the workflow surface around Claude into direct competition with other coding agents and AI IDEs.",
  "facts": [
    {
      "label": "Provider",
      "value": "Anthropic"
    },
    {
      "label": "Release date",
      "value": "May 22, 2025"
    },
    {
      "label": "Type",
      "value": "Coding harness release"
    },
    {
      "label": "GA means",
      "value": "General availability"
    },
    {
      "label": "Product surface",
      "value": "Terminal, IDE integrations, SDK, and GitHub Actions"
    }
  ],
  "sections": [
    {
      "heading": "What GA means",
      "body": [
        "GA is short for general availability. In this case, it means Claude Code moved out of the limited research preview that Anthropic introduced on February 24, 2025 and became a generally available developer product.",
        "That makes the May 22 pin different from the Claude 4 model pin on the same date. Claude Opus 4 and Claude Sonnet 4 were model releases; Claude Code GA was the coding harness becoming broadly available."
      ]
    },
    {
      "heading": "What changed",
      "body": [
        "Anthropic described Claude Code as bringing Claude into more of the development workflow: terminal use, native VS Code and JetBrains integrations, background tasks through GitHub Actions, and an extensible Claude Code SDK.",
        "The original February preview had introduced Claude Code as Anthropic's first agentic coding tool, letting developers delegate engineering tasks to Claude directly from the terminal."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "The milestone showed that the release cadence for coding assistants was no longer only about the underlying model. The harness, integrations, permissions, background execution, and review workflow were becoming their own competitive layer.",
        "For the timeline, Claude Code belongs in coding harnesses because the historical event is the product surface around Claude becoming generally available, not a separate Claude model generation."
      ]
    }
  ],
  "sources": [
    {
      "label": "Anthropic: Introducing Claude 4",
      "url": "https://www.anthropic.com/news/claude-4"
    },
    {
      "label": "Anthropic: Claude 3.7 Sonnet and Claude Code",
      "url": "https://www.anthropic.com/news/claude-3-7-sonnet"
    }
  ]
};
