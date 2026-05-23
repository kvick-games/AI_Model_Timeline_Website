import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "deepseek-v4-pro",
  "release": {
    "companyId": "deepseek",
    "productLineId": "deepseek-models",
    "name": "DeepSeek-V4-Pro",
    "date": "2026-04-24"
  },
  "logo": {
    "modelLabel": "V4 Pro",
    "modelMark": "deepseek"
  },
  "eyebrow": "Million-token open flagship",
  "title": "DeepSeek-V4-Pro pushed open weights into million-token agent work",
  "dek": "DeepSeek launched V4-Pro on April 24, 2026 as the flagship DeepSeek-V4 preview model: a 1.6T-parameter MoE with 49B active parameters, open weights, API access, and 1M-token context.",
  "summary": "DeepSeek-V4-Pro was the high-capability half of the V4 release. It combined a much larger MoE scale with long-context efficiency work, agentic coding emphasis, and a unified Thinking / Non-Thinking model interface.",
  "impact": "For the timeline, V4-Pro marks the next DeepSeek pressure point after R1. The claim was no longer only open reasoning access; it was open-weight, million-token context aimed directly at frontier coding, reasoning, and agent workflows.",
  "facts": [
    {
      "label": "Provider",
      "value": "DeepSeek"
    },
    {
      "label": "Release date",
      "value": "April 24, 2026"
    },
    {
      "label": "Model family",
      "value": "DeepSeek-V4"
    },
    {
      "label": "Scale",
      "value": "1.6T total / 49B active parameters"
    },
    {
      "label": "Context",
      "value": "1M tokens"
    },
    {
      "label": "Primary shift",
      "value": "Open-weight flagship for long-context agents"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "DeepSeek presented V4-Pro as the flagship model in the V4 preview, with open weights, API availability, and a million-token context window across official DeepSeek services.",
        "The technical report framed the model around hybrid attention, stronger residual-style connections, and training/post-training work intended to improve long-context efficiency, coding, reasoning, and agent tasks."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "V4-Pro kept DeepSeek in the open-model pressure lane after R1 by moving from a reasoning shock to a broader frontier-style model family.",
        "The model also made agentic coding a central part of the launch story, which put open weights, long context, and tool-heavy workflows on the same competitive axis as closed flagship APIs."
      ]
    }
  ],
  "sources": [
    {
      "label": "DeepSeek: V4 Preview Release",
      "url": "https://api-docs.deepseek.com/news/news260424"
    },
    {
      "label": "DeepSeek-AI: DeepSeek-V4-Pro model card",
      "url": "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro"
    }
  ]
};
