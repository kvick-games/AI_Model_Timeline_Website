import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  "slug": "glm-5-2",
  "release": {
    "companyId": "zhipu-glm",
    "productLineId": "glm-models",
    "name": "GLM-5.2",
    "date": "2026-06-13"
  },
  "logo": {
    "modelLabel": "GLM-5.2",
    "modelMark": "generic"
  },
  "eyebrow": "Open-weight long-context coding model",
  "title": "GLM-5.2 made Z.ai's GLM line a million-token coding contender",
  "dek": "Zhipu AI / Z.ai released GLM-5.2 in June 2026 as a flagship long-horizon model with 1M context, 128K output, open weights, and stronger coding-agent benchmarks than GLM-5.1.",
  "summary": "GLM-5.2 is Z.ai's flagship model for project-scale engineering and long-horizon agent work. The release moves the GLM family from a 200K-context GLM-5 generation to a documented 1M-token context window, adds explicit reasoning-effort control, and ships with MIT-licensed open weights.",
  "impact": "The release matters because it puts a Chinese open-weight model directly into the coding-agent race, close to closed frontier systems on Z.ai's reported coding benchmarks while keeping API pricing and local deployment paths visible to developers.",
  "facts": [
    {
      "label": "Provider",
      "value": "Zhipu AI / Z.ai"
    },
    {
      "label": "Release date",
      "value": "June 13, 2026"
    },
    {
      "label": "Model family",
      "value": "GLM-5"
    },
    {
      "label": "Developer model ID",
      "value": "glm-5.2"
    },
    {
      "label": "Context",
      "value": "1M tokens"
    },
    {
      "label": "Maximum output",
      "value": "128K tokens"
    },
    {
      "label": "Scale",
      "value": "744B total / 40B active parameters"
    },
    {
      "label": "License",
      "value": "MIT open weights"
    },
    {
      "label": "Primary shift",
      "value": "Open-weight flagship for long-horizon coding agents"
    }
  ],
  "sections": [
    {
      "heading": "What changed",
      "body": [
        "Z.ai positions GLM-5.2 as a flagship foundation model for long-horizon tasks, especially project-scale software engineering. Official documentation lists text input and output, a 1M-token context window, 128K maximum output, streaming, function calling, context caching, structured output, and MCP integration.",
        "The key jump over the earlier GLM-5 family is practical long context: Z.ai says GLM-5.2 was trained for long-horizon coding-agent scenarios and is intended to keep project architecture, constraints, logs, and tool feedback in one sustained workflow."
      ]
    },
    {
      "heading": "Coding and reasoning",
      "body": [
        "Z.ai reports that GLM-5.2 improves over GLM-5.1 on standard coding benchmarks, including 81.0 vs. 62.0 on Terminal-Bench 2.1 and 62.1 vs. 58.4 on SWE-bench Pro. Those are first-party launch numbers, so they are best treated as positioning until independent re-runs settle the comparison.",
        "The API adds a reasoning_effort control for GLM-5.2 and later models. The documented default is max, with high available for lower-latency runs and compatibility mappings for lower effort names used by other protocols."
      ]
    },
    {
      "heading": "How it ships",
      "body": [
        "GLM-5.2 is available through Z.ai's API as glm-5.2 and through the GLM Coding Plan for coding tools. Z.ai's setup docs also describe a glm-5.2[1m] suffix for enabling the 1M-context coding configuration in compatible tools.",
        "Weights are published on Hugging Face under an MIT license, and the GLM-5 repository lists GLM-5.2 and GLM-5.2-FP8 downloads. Z.ai documents local serving support through SGLang, vLLM, xLLM, Transformers, and KTransformers."
      ]
    },
    {
      "heading": "Why it mattered",
      "body": [
        "GLM-5.2 arrived days after Kimi K2.7 Code and shortly after Claude Fable/Mythos access became restricted, making open or broadly accessible coding models a sharper part of the June 2026 model race.",
        "Its combination of open weights, 1M context, explicit coding-agent positioning, and sub-frontier API pricing gives developers another credible option for long-running repository work without relying only on closed Western flagship models."
      ]
    }
  ],
  "sources": [
    {
      "label": "Z.ai developer docs: GLM-5.2",
      "url": "https://docs.z.ai/guides/llm/glm-5.2"
    },
    {
      "label": "Z.ai developer docs: model switching for GLM-5.2",
      "url": "https://docs.z.ai/devpack/latest-model"
    },
    {
      "label": "Z.ai GitHub: GLM-5.2 model repository",
      "url": "https://github.com/zai-org/GLM-5"
    },
    {
      "label": "Z.ai: GLM-5.2 Hugging Face model card",
      "url": "https://huggingface.co/zai-org/GLM-5.2"
    },
    {
      "label": "South China Morning Post: GLM-5.2 launch coverage",
      "url": "https://www.scmp.com/tech/tech-trends/article/3357115/zhipu-ais-stock-rockets-after-chinese-firm-makes-glm-52-open-source"
    }
  ]
};
