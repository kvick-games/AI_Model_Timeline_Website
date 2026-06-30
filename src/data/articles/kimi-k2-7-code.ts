import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "kimi-k2-7-code",
  "release": {
    "companyId": "moonshot-kimi",
    "productLineId": "kimi-models",
    "name": "Kimi K2.7 Code",
    "date": "2026-06-12"
  },
  "logo": {
    "modelLabel": "K2.7 Code",
    "modelMark": "generic"
  },
  "eyebrow": "Open-weight coding model",
  "title": "Kimi K2.7 Code moved Kimi further into coding-agent work",
  "dek": "Moonshot AI released Kimi K2.7 Code on June 12, 2026 as a coding-focused Kimi model with open weights, a 1T-parameter MoE architecture, 256K context, and stronger long-horizon agent performance.",
  "summary": "Kimi K2.7 Code is a coding-focused agentic model built on Kimi K2.6. Moonshot positioned it around end-to-end software engineering tasks, better long-context instruction following, and lower reasoning-token use than K2.6.",
  "impact": "The release matters because it keeps a low-cost, open-weight model in the same conversation as premium coding agents. Kimi is competing on the combination of open weights, multimodal input, long context, tool use, and API pricing aimed at sustained coding workflows.",
  "facts": [
    {
      "label": "Provider",
      "value": "Moonshot AI"
    },
    {
      "label": "Release date",
      "value": "June 12, 2026"
    },
    {
      "label": "Model family",
      "value": "Kimi K2"
    },
    {
      "label": "Developer model ID",
      "value": "kimi-k2.7-code"
    },
    {
      "label": "Scale",
      "value": "1T total / 32B active parameters"
    },
    {
      "label": "Context",
      "value": "256K tokens"
    },
    {
      "label": "Primary shift",
      "value": "Open-weight coding-agent model"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Moonshot introduced Kimi K2.7 Code as a coding-focused agentic model built on Kimi K2.6, with emphasis on real-world long-horizon coding tasks and complex software engineering workflows.",
        "The Hugging Face model card lists a 1T-parameter MoE with 32B active parameters, 256K context, MoonViT vision encoding, and support for text, image, and video input through the official API."
      ]
    },
    {
      "heading": "How it ships",
      "body": [
        "The model is available through the Kimi API using the kimi-k2.7-code model ID, with OpenAI-compatible and Anthropic-compatible integration paths documented for coding tools such as Claude Code, Cline, RooCode, and OpenCode.",
        "Moonshot also published weights on Hugging Face under a Modified MIT license and describes the model as supporting automatic context caching, tool calls, JSON Mode, Partial Mode, long thinking, and deep reasoning."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "Kimi K2.7 Code sharpened the open-weight coding-model lane at a moment when coding agents were becoming one of the main surfaces for frontier model competition.",
        "The economics are part of the story: Kimi lists the model at $0.95 per million input tokens, $4.00 per million output tokens, and $0.19 per million cache-hit tokens, making repeated agent loops cheaper than many premium closed coding models."
      ]
    }
  ],
  "sources": [
    {
      "label": "Kimi API Platform: Kimi K2.7 Code integration guide",
      "url": "https://platform.kimi.ai/docs/guide/agent-support"
    },
    {
      "label": "Kimi API Platform: Kimi K2.7 Code pricing",
      "url": "https://platform.kimi.ai/docs/pricing/chat-k27-code"
    },
    {
      "label": "Moonshot AI: Kimi K2.7 Code model card",
      "url": "https://huggingface.co/moonshotai/Kimi-K2.7-Code"
    }
  ]
};
