import type {ArticleFact, ModelArticle, ModelLogo} from './types';

export type TokenPricingBasis = 'launch-era' | 'current' | 'derived' | 'price-update';
export type TokenBillingModel = 'input-output' | 'combined';
export type TokenCostTier = 'economy' | 'standard' | 'premium';

type SyntheticPricingArticle = {
  dek?: string;
  eyebrow?: string;
  impact?: string;
  logo: ModelLogo;
  primaryShift?: string;
  release: ModelArticle['release'];
  summary?: string;
  title?: string;
};

export type TokenPricingRecord = {
  slug: string;
  basis: TokenPricingBasis;
  billingModel: TokenBillingModel;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
  cachedInputUsdPerMillion?: number;
  pricedAt: string;
  providerLabel: string;
  modelLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  note?: string;
  syntheticArticle?: SyntheticPricingArticle;
};

const PRICED_AT_CURRENT = '2026-06-09';

const sources = {
  openAiPricing: {
    label: 'OpenAI API pricing',
    url: 'https://developers.openai.com/api/docs/pricing',
  },
  openAiGpt35: {
    label: 'OpenAI: Introducing ChatGPT and Whisper APIs',
    url: 'https://openai.com/index/introducing-chatgpt-and-whisper-apis/',
  },
  openAiGpt4: {
    label: 'OpenAI: GPT-4',
    url: 'https://openai.com/index/gpt-4-research/',
  },
  openAiDevDay: {
    label: 'OpenAI DevDay pricing update',
    url: 'https://openai.com/index/new-models-and-developer-products-announced-at-devday/',
  },
  openAiGpt4o: {
    label: 'OpenAI: Hello GPT-4o',
    url: 'https://openai.com/index/hello-gpt-4o/',
  },
  openAiGpt4oMini: {
    label: 'OpenAI: GPT-4o mini',
    url: 'https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/',
  },
  anthropicPricing: {
    label: 'Anthropic Claude pricing',
    url: 'https://platform.claude.com/docs/en/about-claude/pricing',
  },
  anthropicClaude3Family: {
    label: 'Anthropic: Claude 3 family',
    url: 'https://www.anthropic.com/news/claude-3-family',
  },
  anthropicClaude35: {
    label: 'Anthropic: Claude 3.5 Sonnet',
    url: 'https://www.anthropic.com/news/claude-3-5-sonnet',
  },
  anthropicClaude37: {
    label: 'Anthropic: Claude 3.7 Sonnet',
    url: 'https://www.anthropic.com/news/claude-3-7-sonnet',
  },
  anthropicClaude4: {
    label: 'Anthropic: Claude 4',
    url: 'https://www.anthropic.com/news/claude-4',
  },
  geminiPricing: {
    label: 'Google Gemini API pricing',
    url: 'https://ai.google.dev/gemini-api/docs/pricing',
  },
  googleGemini15FlashPricing: {
    label: 'Google Developers Blog: Gemini 1.5 Flash price update',
    url: 'https://developers.googleblog.com/gemini-15-flash-updates-google-ai-studio-gemini-api/',
  },
  xAiPricing: {
    label: 'xAI API pricing',
    url: 'https://docs.x.ai/developers/pricing',
  },
  xAiGrok41Fast: {
    label: 'xAI: Grok 4.1 Fast',
    url: 'https://x.ai/news/grok-4-1-fast',
  },
} as const;

function pricingArticle({
  companyId,
  date,
  logo,
  modelLabel,
  productLineId,
  providerLabel,
  releaseName,
}: {
  companyId: string;
  date: string;
  logo: ModelLogo['modelMark'];
  modelLabel: string;
  productLineId: string;
  providerLabel: string;
  releaseName?: string;
}): SyntheticPricingArticle {
  return {
    release: {
      companyId,
      productLineId,
      name: releaseName ?? modelLabel,
      date,
    },
    logo: {
      modelLabel,
      modelMark: logo,
    },
    eyebrow: 'API pricing marker',
    title: `${modelLabel} exposes the cost curve around ${providerLabel}`,
    summary: `${modelLabel} is included as a pricing anchor so the timeline can compare model capability releases against first-party API token costs.`,
    impact: `The pricing marker helps show when ${providerLabel} made a model tier cheap enough, or expensive enough, to change how developers could use it in production.`,
    primaryShift: 'API token price anchor',
  };
}

export const tokenPricingRecords: TokenPricingRecord[] = [
  {
    slug: 'openai-openai-gpt-gpt-3-5-2022-11-30',
    basis: 'launch-era',
    billingModel: 'combined',
    inputUsdPerMillion: 2,
    outputUsdPerMillion: 2,
    pricedAt: '2023-03-01',
    providerLabel: 'OpenAI',
    modelLabel: 'GPT-3.5 Turbo',
    sourceLabel: sources.openAiGpt35.label,
    sourceUrl: sources.openAiGpt35.url,
    note: 'Launch API price was a flat $0.002 per 1K tokens, normalized here to $2 per 1M tokens.',
    syntheticArticle: pricingArticle({
      companyId: 'openai',
      date: '2022-11-30',
      logo: 'gpt',
      modelLabel: 'GPT-3.5 Turbo',
      productLineId: 'openai-gpt',
      providerLabel: 'OpenAI',
      releaseName: 'GPT-3.5',
    }),
  },
  {
    slug: 'openai-openai-gpt-gpt-4-2023-03-14',
    basis: 'launch-era',
    billingModel: 'input-output',
    inputUsdPerMillion: 30,
    outputUsdPerMillion: 60,
    pricedAt: '2023-03-14',
    providerLabel: 'OpenAI',
    modelLabel: 'GPT-4',
    sourceLabel: sources.openAiGpt4.label,
    sourceUrl: sources.openAiGpt4.url,
    note: '8K context launch price, normalized from $0.03 / 1K prompt tokens and $0.06 / 1K completion tokens.',
    syntheticArticle: pricingArticle({
      companyId: 'openai',
      date: '2023-03-14',
      logo: 'gpt',
      modelLabel: 'GPT-4',
      productLineId: 'openai-gpt',
      providerLabel: 'OpenAI',
    }),
  },
  {
    slug: 'openai-openai-gpt-gpt-4-turbo-2023-11-06',
    basis: 'launch-era',
    billingModel: 'input-output',
    inputUsdPerMillion: 10,
    outputUsdPerMillion: 30,
    pricedAt: '2023-11-06',
    providerLabel: 'OpenAI',
    modelLabel: 'GPT-4 Turbo',
    sourceLabel: sources.openAiDevDay.label,
    sourceUrl: sources.openAiDevDay.url,
    note: 'Launch-era API price from OpenAI DevDay, normalized from $0.01 / 1K input and $0.03 / 1K output.',
    syntheticArticle: pricingArticle({
      companyId: 'openai',
      date: '2023-11-06',
      logo: 'gpt',
      modelLabel: 'GPT-4 Turbo',
      productLineId: 'openai-gpt',
      providerLabel: 'OpenAI',
    }),
  },
  {
    slug: 'gpt-4o',
    basis: 'derived',
    billingModel: 'input-output',
    inputUsdPerMillion: 5,
    outputUsdPerMillion: 15,
    pricedAt: '2024-05-13',
    providerLabel: 'OpenAI',
    modelLabel: 'GPT-4o',
    sourceLabel: sources.openAiGpt4o.label,
    sourceUrl: sources.openAiGpt4o.url,
    note: 'Derived from OpenAI describing GPT-4o as 50% cheaper than GPT-4 Turbo in the API.',
  },
  {
    slug: 'openai-openai-gpt-gpt-4o-mini-2024-07-18',
    basis: 'launch-era',
    billingModel: 'input-output',
    inputUsdPerMillion: 0.15,
    outputUsdPerMillion: 0.6,
    pricedAt: '2024-07-18',
    providerLabel: 'OpenAI',
    modelLabel: 'GPT-4o mini',
    sourceLabel: sources.openAiGpt4oMini.label,
    sourceUrl: sources.openAiGpt4oMini.url,
    note: 'OpenAI announced this price directly as 15 cents per 1M input tokens and 60 cents per 1M output tokens.',
    syntheticArticle: {
      release: {
        companyId: 'openai',
        productLineId: 'openai-gpt',
        name: 'GPT-4o mini',
        date: '2024-07-18',
      },
      logo: {
        modelLabel: 'GPT-4o mini',
        modelMark: 'gpt',
      },
      eyebrow: 'Cost-compression release',
      title: 'GPT-4o mini made sub-dollar frontier-adjacent calls visible',
      summary:
        'GPT-4o mini is the clearest cost-compression anchor in the OpenAI timeline, dropping general text API pricing to cents per million tokens while keeping strong small-model performance.',
      impact:
        'Its launch made chains, batch-style workflows, and high-volume support interactions easier to justify because the unit economics were no longer tied to flagship GPT-4 prices.',
      primaryShift: 'Sub-dollar multimodal API pricing',
    },
  },
  {
    slug: 'openai-openai-gpt-gpt-5-4-2026-03-05',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 2.5,
    outputUsdPerMillion: 15,
    cachedInputUsdPerMillion: 0.25,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'OpenAI',
    modelLabel: 'GPT-5.4',
    sourceLabel: sources.openAiPricing.label,
    sourceUrl: sources.openAiPricing.url,
    note: 'Current standard short-context API price; long-context, batch, flex, priority, and regional pricing differ.',
    syntheticArticle: pricingArticle({
      companyId: 'openai',
      date: '2026-03-05',
      logo: 'gpt',
      modelLabel: 'GPT-5.4',
      productLineId: 'openai-gpt',
      providerLabel: 'OpenAI',
    }),
  },
  {
    slug: 'openai-openai-gpt-gpt-5-5-2026-04-23',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 5,
    outputUsdPerMillion: 30,
    cachedInputUsdPerMillion: 0.5,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'OpenAI',
    modelLabel: 'GPT-5.5',
    sourceLabel: sources.openAiPricing.label,
    sourceUrl: sources.openAiPricing.url,
    note: 'Current standard short-context API price; long-context, batch, flex, priority, and regional pricing differ.',
    syntheticArticle: pricingArticle({
      companyId: 'openai',
      date: '2026-04-23',
      logo: 'gpt',
      modelLabel: 'GPT-5.5',
      productLineId: 'openai-gpt',
      providerLabel: 'OpenAI',
    }),
  },
  {
    slug: 'anthropic-anthropic-claude-claude-3-2024-03-04',
    basis: 'launch-era',
    billingModel: 'input-output',
    inputUsdPerMillion: 15,
    outputUsdPerMillion: 75,
    pricedAt: '2024-03-04',
    providerLabel: 'Anthropic',
    modelLabel: 'Claude 3 Opus',
    sourceLabel: sources.anthropicClaude3Family.label,
    sourceUrl: sources.anthropicClaude3Family.url,
    note: 'Claude 3 family launch pricing ranged from Haiku at $0.25 / $1.25 to Sonnet at $3 / $15 and Opus at $15 / $75 per 1M tokens; the badge uses Opus as the flagship tier.',
    syntheticArticle: pricingArticle({
      companyId: 'anthropic',
      date: '2024-03-04',
      logo: 'claude',
      modelLabel: 'Claude 3 Opus',
      productLineId: 'anthropic-claude',
      providerLabel: 'Anthropic',
      releaseName: 'Claude 3',
    }),
  },
  {
    slug: 'claude-3-5',
    basis: 'launch-era',
    billingModel: 'input-output',
    inputUsdPerMillion: 3,
    outputUsdPerMillion: 15,
    pricedAt: '2024-06-20',
    providerLabel: 'Anthropic',
    modelLabel: 'Claude 3.5 Sonnet',
    sourceLabel: sources.anthropicClaude35.label,
    sourceUrl: sources.anthropicClaude35.url,
    note: 'Launch pricing for Claude 3.5 Sonnet.',
  },
  {
    slug: 'anthropic-anthropic-claude-claude-3-7-2025-02-24',
    basis: 'launch-era',
    billingModel: 'input-output',
    inputUsdPerMillion: 3,
    outputUsdPerMillion: 15,
    pricedAt: '2025-02-24',
    providerLabel: 'Anthropic',
    modelLabel: 'Claude 3.7 Sonnet',
    sourceLabel: sources.anthropicClaude37.label,
    sourceUrl: sources.anthropicClaude37.url,
    note: 'Launch pricing for Claude 3.7 Sonnet; Anthropic listed the same price for standard and extended thinking modes.',
    syntheticArticle: pricingArticle({
      companyId: 'anthropic',
      date: '2025-02-24',
      logo: 'claude',
      modelLabel: 'Claude 3.7 Sonnet',
      productLineId: 'anthropic-claude',
      providerLabel: 'Anthropic',
      releaseName: 'Claude 3.7',
    }),
  },
  {
    slug: 'anthropic-anthropic-claude-claude-4-2025-05-22',
    basis: 'launch-era',
    billingModel: 'input-output',
    inputUsdPerMillion: 15,
    outputUsdPerMillion: 75,
    pricedAt: '2025-05-22',
    providerLabel: 'Anthropic',
    modelLabel: 'Claude Opus 4',
    sourceLabel: sources.anthropicClaude4.label,
    sourceUrl: sources.anthropicClaude4.url,
    note: 'Claude 4 launch pricing listed Sonnet 4 at $3 / $15 and Opus 4 at $15 / $75 per 1M tokens; the badge uses Opus 4 as the flagship tier.',
    syntheticArticle: pricingArticle({
      companyId: 'anthropic',
      date: '2025-05-22',
      logo: 'claude',
      modelLabel: 'Claude Opus 4',
      productLineId: 'anthropic-claude',
      providerLabel: 'Anthropic',
      releaseName: 'Claude 4',
    }),
  },
  {
    slug: 'anthropic-anthropic-claude-claude-4-6-sonnet-2026-02-17',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 3,
    outputUsdPerMillion: 15,
    cachedInputUsdPerMillion: 0.3,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Anthropic',
    modelLabel: 'Claude Sonnet 4.6',
    sourceLabel: sources.anthropicPricing.label,
    sourceUrl: sources.anthropicPricing.url,
    syntheticArticle: pricingArticle({
      companyId: 'anthropic',
      date: '2026-02-17',
      logo: 'claude',
      modelLabel: 'Claude Sonnet 4.6',
      productLineId: 'anthropic-claude',
      providerLabel: 'Anthropic',
      releaseName: 'Claude 4.6 Sonnet',
    }),
  },
  {
    slug: 'anthropic-anthropic-claude-claude-4-7-opus-2026-04-16',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 5,
    outputUsdPerMillion: 25,
    cachedInputUsdPerMillion: 0.5,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Anthropic',
    modelLabel: 'Claude Opus 4.7',
    sourceLabel: sources.anthropicPricing.label,
    sourceUrl: sources.anthropicPricing.url,
    syntheticArticle: pricingArticle({
      companyId: 'anthropic',
      date: '2026-04-16',
      logo: 'claude',
      modelLabel: 'Claude Opus 4.7',
      productLineId: 'anthropic-claude',
      providerLabel: 'Anthropic',
      releaseName: 'Claude 4.7 Opus',
    }),
  },
  {
    slug: 'claude-opus-4-8',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 5,
    outputUsdPerMillion: 25,
    cachedInputUsdPerMillion: 0.5,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Anthropic',
    modelLabel: 'Claude Opus 4.8',
    sourceLabel: sources.anthropicPricing.label,
    sourceUrl: sources.anthropicPricing.url,
  },
  {
    slug: 'claude-fable-5',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 10,
    outputUsdPerMillion: 50,
    cachedInputUsdPerMillion: 1,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Anthropic',
    modelLabel: 'Claude Fable 5',
    sourceLabel: sources.anthropicPricing.label,
    sourceUrl: sources.anthropicPricing.url,
  },
  {
    slug: 'google-google-gemini-gemini-1-5-2024-02-15',
    basis: 'price-update',
    billingModel: 'input-output',
    inputUsdPerMillion: 0.075,
    outputUsdPerMillion: 0.3,
    pricedAt: '2024-08-12',
    providerLabel: 'Google',
    modelLabel: 'Gemini 1.5 Flash',
    sourceLabel: sources.googleGemini15FlashPricing.label,
    sourceUrl: sources.googleGemini15FlashPricing.url,
    note: 'Official Gemini 1.5 Flash price update for prompts under 128K tokens; the timeline pin is the Gemini 1.5 family marker, so the badge uses the clearest cost-compression tier.',
    syntheticArticle: pricingArticle({
      companyId: 'google',
      date: '2024-02-15',
      logo: 'gemini',
      modelLabel: 'Gemini 1.5 Flash',
      productLineId: 'google-gemini',
      providerLabel: 'Google',
      releaseName: 'Gemini 1.5',
    }),
  },
  {
    slug: 'google-google-gemini-gemini-2-0-2025-02-05',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 0.1,
    outputUsdPerMillion: 0.4,
    cachedInputUsdPerMillion: 0.025,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Google',
    modelLabel: 'Gemini 2.0 Flash',
    sourceLabel: sources.geminiPricing.label,
    sourceUrl: sources.geminiPricing.url,
    note: 'Current/deprecation-era Gemini 2.0 Flash text, image, and video price; Google marks Gemini 2.0 Flash as shut down June 1, 2026.',
    syntheticArticle: pricingArticle({
      companyId: 'google',
      date: '2025-02-05',
      logo: 'gemini',
      modelLabel: 'Gemini 2.0 Flash',
      productLineId: 'google-gemini',
      providerLabel: 'Google',
      releaseName: 'Gemini 2.0',
    }),
  },
  {
    slug: 'gemini-2-5',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 1.25,
    outputUsdPerMillion: 10,
    cachedInputUsdPerMillion: 0.125,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Google',
    modelLabel: 'Gemini 2.5 Pro',
    sourceLabel: sources.geminiPricing.label,
    sourceUrl: sources.geminiPricing.url,
    note: 'Current standard Gemini 2.5 Pro price for prompts up to 200K tokens; larger prompts are priced higher.',
  },
  {
    slug: 'google-google-gemini-gemini-3-1-pro-preview-2026-02-19',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 2,
    outputUsdPerMillion: 12,
    cachedInputUsdPerMillion: 0.2,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Google',
    modelLabel: 'Gemini 3.1 Pro Preview',
    sourceLabel: sources.geminiPricing.label,
    sourceUrl: sources.geminiPricing.url,
    note: 'Current standard text/image/video price for prompts up to 200K tokens; audio and larger prompts are priced differently.',
    syntheticArticle: pricingArticle({
      companyId: 'google',
      date: '2026-02-19',
      logo: 'gemini',
      modelLabel: 'Gemini 3.1 Pro Preview',
      productLineId: 'google-gemini',
      providerLabel: 'Google',
      releaseName: 'Gemini 3.1 Pro (Preview)',
    }),
  },
  {
    slug: 'google-google-gemini-gemini-3-1-flash-lite-2026-03-03',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 0.25,
    outputUsdPerMillion: 1.5,
    cachedInputUsdPerMillion: 0.025,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Google',
    modelLabel: 'Gemini 3.1 Flash-Lite',
    sourceLabel: sources.geminiPricing.label,
    sourceUrl: sources.geminiPricing.url,
    note: 'Current standard text/image/video price; audio, batch, flex, and priority pricing differ.',
    syntheticArticle: pricingArticle({
      companyId: 'google',
      date: '2026-03-03',
      logo: 'gemini',
      modelLabel: 'Gemini 3.1 Flash-Lite',
      productLineId: 'google-gemini',
      providerLabel: 'Google',
    }),
  },
  {
    slug: 'gemini-3-5-flash',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 1.5,
    outputUsdPerMillion: 9,
    cachedInputUsdPerMillion: 0.15,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'Google',
    modelLabel: 'Gemini 3.5 Flash',
    sourceLabel: sources.geminiPricing.label,
    sourceUrl: sources.geminiPricing.url,
    note: 'Current standard Gemini API price; batch, flex, priority, grounding, and audio pricing differ.',
  },
  {
    slug: 'xai-xai-grok-grok-4-1-2025-11-17',
    basis: 'launch-era',
    billingModel: 'input-output',
    inputUsdPerMillion: 0.2,
    outputUsdPerMillion: 0.5,
    cachedInputUsdPerMillion: 0.05,
    pricedAt: '2025-11-17',
    providerLabel: 'xAI',
    modelLabel: 'Grok 4.1 Fast',
    sourceLabel: sources.xAiGrok41Fast.label,
    sourceUrl: sources.xAiGrok41Fast.url,
    note: 'Badge uses Grok 4.1 Fast, the first-party priced API variant tied to the Grok 4.1 release window.',
    syntheticArticle: pricingArticle({
      companyId: 'xai',
      date: '2025-11-17',
      logo: 'xai',
      modelLabel: 'Grok 4.1 Fast',
      productLineId: 'xai-grok',
      providerLabel: 'xAI',
      releaseName: 'Grok 4.1',
    }),
  },
  {
    slug: 'xai-xai-grok-grok-4-20-2026-02-17',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 1.25,
    outputUsdPerMillion: 2.5,
    cachedInputUsdPerMillion: 0.2,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'xAI',
    modelLabel: 'Grok 4.20',
    sourceLabel: sources.xAiPricing.label,
    sourceUrl: sources.xAiPricing.url,
    syntheticArticle: pricingArticle({
      companyId: 'xai',
      date: '2026-02-17',
      logo: 'xai',
      modelLabel: 'Grok 4.20',
      productLineId: 'xai-grok',
      providerLabel: 'xAI',
    }),
  },
  {
    slug: 'xai-xai-grok-grok-4-3-beta-2026-04-17',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 1.25,
    outputUsdPerMillion: 2.5,
    cachedInputUsdPerMillion: 0.2,
    pricedAt: PRICED_AT_CURRENT,
    providerLabel: 'xAI',
    modelLabel: 'Grok 4.3',
    sourceLabel: sources.xAiPricing.label,
    sourceUrl: sources.xAiPricing.url,
    syntheticArticle: pricingArticle({
      companyId: 'xai',
      date: '2026-04-17',
      logo: 'xai',
      modelLabel: 'Grok 4.3',
      productLineId: 'xai-grok',
      providerLabel: 'xAI',
      releaseName: 'Grok 4.3 (Beta)',
    }),
  },
];

export const tokenPricingBySlug = tokenPricingRecords.reduce<Record<string, TokenPricingRecord>>((records, record) => {
  records[record.slug] = record;
  return records;
}, {});

function formatUsdPerMillionValue(value: number) {
  const fractionDigits = (() => {
    if (Number.isInteger(value)) {
      return {minimumFractionDigits: 0, maximumFractionDigits: 0};
    }

    if (value >= 1) {
      return {minimumFractionDigits: 2, maximumFractionDigits: 2};
    }

    if (value >= 0.01) {
      return {minimumFractionDigits: 2, maximumFractionDigits: 3};
    }

    return {minimumFractionDigits: 0, maximumFractionDigits: 6};
  })();

  return value.toLocaleString('en-US', fractionDigits);
}

function formatUsdPerMillion(value: number) {
  return `$${formatUsdPerMillionValue(value)}`;
}

function formatDateForFact(input: string) {
  return new Date(`${input}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTokenPricingBadge(record: TokenPricingRecord) {
  if (record.billingModel === 'combined') {
    return `${formatUsdPerMillionValue(record.inputUsdPerMillion)} flat`;
  }

  return `${formatUsdPerMillionValue(record.inputUsdPerMillion)} / ${formatUsdPerMillionValue(record.outputUsdPerMillion)}`;
}

export function formatTokenPricingFact(record: TokenPricingRecord) {
  if (record.billingModel === 'combined') {
    return `${formatUsdPerMillion(record.inputUsdPerMillion)} / 1M tokens, flat input/output billing`;
  }

  return `${formatUsdPerMillion(record.inputUsdPerMillion)} / 1M input; ${formatUsdPerMillion(record.outputUsdPerMillion)} / 1M output`;
}

export function formatCachedTokenPricingFact(record: TokenPricingRecord) {
  if (record.cachedInputUsdPerMillion === undefined) {
    return null;
  }

  return `${formatUsdPerMillion(record.cachedInputUsdPerMillion)} / 1M cached input tokens`;
}

export function formatTokenPricingBasis(record: TokenPricingRecord) {
  const checkedDate = formatDateForFact(record.pricedAt);

  if (record.basis === 'launch-era') {
    return `Launch-era API price, announced ${checkedDate}`;
  }

  if (record.basis === 'derived') {
    return `Derived price, documented ${checkedDate}`;
  }

  if (record.basis === 'price-update') {
    return `Official API price update, effective ${checkedDate}`;
  }

  return `Current standard API price, checked ${checkedDate}`;
}

function getBlendedSampleCost(record: TokenPricingRecord) {
  return record.inputUsdPerMillion + record.outputUsdPerMillion * 0.25;
}

export function getTokenPricingTier(record: TokenPricingRecord): TokenCostTier {
  const blendedCost = getBlendedSampleCost(record);

  if (blendedCost <= 1) {
    return 'economy';
  }

  if (blendedCost <= 5) {
    return 'standard';
  }

  return 'premium';
}

function hasFact(article: ModelArticle, label: string) {
  const target = label.toLowerCase();
  return article.facts.some((fact) => fact.label.toLowerCase() === target);
}

function hasPricingFact(article: ModelArticle) {
  return article.facts.some((fact) => fact.label.toLowerCase().replace(/\s+/g, ' ') === 'api price');
}

function appendIfMissing(facts: ArticleFact[], article: ModelArticle, fact: ArticleFact) {
  if (!hasFact(article, fact.label)) {
    facts.push(fact);
  }
}

export function addTokenPricingToArticle(article: ModelArticle): ModelArticle {
  const pricing = tokenPricingBySlug[article.slug];

  if (!pricing) {
    return article;
  }

  const facts = [...article.facts];

  if (!hasPricingFact(article)) {
    facts.push({
      label: 'API price',
      value: formatTokenPricingFact(pricing),
    });
  }

  const cachedPrice = formatCachedTokenPricingFact(pricing);

  if (cachedPrice) {
    appendIfMissing(facts, article, {
      label: 'Cached input',
      value: cachedPrice,
    });
  }

  appendIfMissing(facts, article, {
    label: 'Price basis',
    value: formatTokenPricingBasis(pricing),
  });

  if (pricing.note) {
    appendIfMissing(facts, article, {
      label: 'Pricing note',
      value: pricing.note,
    });
  }

  const hasSource = article.sources.some((source) => source.url === pricing.sourceUrl);

  return {
    ...article,
    facts,
    sources: hasSource
      ? article.sources
      : [
          ...article.sources,
          {
            label: pricing.sourceLabel,
            url: pricing.sourceUrl,
          },
        ],
  };
}

function createPricingArticle(record: TokenPricingRecord): ModelArticle | null {
  const synthetic = record.syntheticArticle;

  if (!synthetic) {
    return null;
  }

  return {
    slug: record.slug,
    release: synthetic.release,
    logo: synthetic.logo,
    eyebrow: synthetic.eyebrow ?? 'API pricing marker',
    title: synthetic.title ?? `${record.modelLabel} API pricing anchor`,
    dek:
      synthetic.dek ??
      `${record.providerLabel} token pricing is normalized here to USD per 1M tokens so this timeline pin can show input and output cost next to the release.`,
    summary:
      synthetic.summary ??
      `${record.modelLabel} is included as a pricing anchor for comparing model releases by first-party API unit economics.`,
    impact:
      synthetic.impact ??
      `This price point helps explain whether ${record.modelLabel} fits high-volume, agentic, or premium frontier workloads.`,
    facts: [
      {
        label: 'Provider',
        value: record.providerLabel,
      },
      {
        label: 'Release date',
        value: formatDateForFact(synthetic.release.date),
      },
      {
        label: 'Model family',
        value: synthetic.logo.modelLabel,
      },
      {
        label: 'Primary shift',
        value: synthetic.primaryShift ?? 'API token price anchor',
      },
    ],
    sections: [
      {
        heading: 'What changed',
        body: [
          `${record.modelLabel} gives the timeline a concrete API price point for ${record.providerLabel}, normalized to USD per 1M tokens.`,
          'The badge on the timeline always shows the actual listed input and output price, while the badge color uses a blended sample cost for quick visual comparison.',
        ],
      },
      {
        heading: 'Why it mattered',
        body: [
          'Token prices shape which models can be used continuously, chained across tools, or reserved for premium reasoning steps.',
          'Putting price beside the release date makes cost compression visible as part of the model race instead of a detail hidden in provider documentation.',
        ],
      },
    ],
    sources: [
      {
        label: record.sourceLabel,
        url: record.sourceUrl,
      },
    ],
  };
}

export const syntheticPricingArticles = tokenPricingRecords
  .map(createPricingArticle)
  .filter((article): article is ModelArticle => article !== null);
