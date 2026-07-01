import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "claude-fable-mythos-restored",
  "release": {
    "companyId": "anthropic",
    "productLineId": "anthropic-events",
    "name": "Fable/Mythos access restored",
    "date": "2026-07-01"
  },
  "logo": {
    "modelLabel": "Fable/Mythos",
    "modelMark": "claude"
  },
  "eyebrow": "Claude access restored",
  "title": "Claude Fable 5 returned after U.S. export controls were lifted",
  "dek": "Anthropic said the U.S. Department of Commerce lifted export controls on Claude Fable 5 and Mythos 5 on June 30, clearing Fable 5 to return globally on July 1.",
  "summary": "The July 1 restoration ended the broad customer suspension that began on June 12, when an immediate U.S. export-control directive forced Anthropic to disable Fable 5 and Mythos 5 for all users while it worked through nationality-access compliance and safeguard concerns.",
  "impact": "The restoration matters because it turned the Fable 5 shutdown into a completed policy cycle: government intervention, model-safeguard review, stronger cyber classifiers, and renewed deployment under closer U.S. government collaboration.",
  "facts": [
    {
      "label": "Provider",
      "value": "Anthropic"
    },
    {
      "label": "Restoration date",
      "value": "July 1, 2026"
    },
    {
      "label": "Controls lifted",
      "value": "June 30, 2026"
    },
    {
      "label": "Models affected",
      "value": "Claude Fable 5 and Claude Mythos 5"
    },
    {
      "label": "Fable availability",
      "value": "Claude Platform, Claude.ai, Claude Code, and Claude Cowork"
    },
    {
      "label": "Event type",
      "value": "Policy action"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Anthropic said the Department of Commerce lifted the export controls on Claude Fable 5 and Claude Mythos 5 on June 30, allowing Fable 5 to return to global users the next day.",
        "The company said Fable 5 would be available on the Claude Platform, Claude.ai, Claude Code, and Claude Cowork, with cloud-partner access to be re-enabled as quickly as possible."
      ]
    },
    {
      "heading": "Why access had been suspended",
      "body": [
        "The June 12 directive required Anthropic to restrict access to foreign nationals. Because the order took effect immediately and the company could not reliably verify nationality in real time, it suspended both Fable 5 and Mythos 5 for all users.",
        "The dispute centered on a reported way to bypass Fable 5 safeguards for some cybersecurity work. Anthropic said the behavior did not expose unique Mythos-level cyber capabilities, but it still trained an improved classifier to block the reported bypass pattern."
      ]
    },
    {
      "heading": "What changed in safeguards",
      "body": [
        "Anthropic said researchers from the U.S. Department of Commerce's Center for AI Standards and Innovation tested the prior and updated safeguards and agreed they were strong.",
        "The redeployment also came with a proposed industry framework for scoring AI jailbreak severity and a deeper commitment to government collaboration on pre-release testing, information sharing, and frontier AI security research."
      ]
    }
  ],
  "sources": [
    {
      "label": "Anthropic: Redeploying Fable 5",
      "url": "https://www.anthropic.com/news/redeploying-fable-5"
    },
    {
      "label": "Anthropic: Statement on Fable 5 and Mythos 5 access",
      "url": "https://www.anthropic.com/news/fable-mythos-access"
    },
    {
      "label": "The Guardian: U.S. export controls lifted",
      "url": "https://www.theguardian.com/technology/2026/jul/01/anthropic-fable-mythos-ai-models-us-export-controls-lifted"
    }
  ]
};
