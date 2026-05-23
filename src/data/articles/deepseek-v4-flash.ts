import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "deepseek-v4-flash",
  "release": {
    "companyId": "deepseek",
    "productLineId": "deepseek-models",
    "name": "DeepSeek-V4-Flash",
    "date": "2026-04-24"
  },
  "logo": {
    "modelLabel": "V4 Flash",
    "modelMark": "deepseek"
  },
  "eyebrow": "Fast million-token tier",
  "title": "DeepSeek-V4-Flash made the V4 release a practical production tier",
  "dek": "DeepSeek launched V4-Flash on April 24, 2026 as the smaller DeepSeek-V4 preview model, pairing 284B total parameters, 13B active parameters, open weights, and 1M-token context.",
  "summary": "DeepSeek-V4-Flash was the efficient half of the V4 release. It gave developers a lower-cost, faster route into the same million-token context story while still supporting Thinking and Non-Thinking modes.",
  "impact": "Flash mattered because DeepSeek was not only chasing a flagship benchmark point. It made the default V4 migration path a cheaper production model, with legacy DeepSeek chat and reasoner endpoints eventually routing through V4-Flash modes.",
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
      "value": "284B total / 13B active parameters"
    },
    {
      "label": "Context",
      "value": "1M tokens"
    },
    {
      "label": "Primary shift",
      "value": "Economical open-weight long-context model"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "DeepSeek released V4-Flash alongside V4-Pro as part of the V4 preview and made the model available through chat, API access, and open weights.",
        "The model kept the 1M-token context window and dual reasoning modes while using a much smaller MoE footprint than the Pro model."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "V4-Flash made long-context DeepSeek use less dependent on the biggest model in the family. That matters for teams routing routine coding, document, and agent tasks where speed and cost are as important as peak reasoning.",
        "It also became the compatibility bridge for older DeepSeek endpoints, making the efficient model tier the default path for many existing integrations."
      ]
    }
  ],
  "sources": [
    {
      "label": "DeepSeek: V4 Preview Release",
      "url": "https://api-docs.deepseek.com/news/news260424"
    },
    {
      "label": "DeepSeek-AI: DeepSeek-V4-Flash model card",
      "url": "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash"
    }
  ]
};
