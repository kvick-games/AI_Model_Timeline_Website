import type {ArticleFact, ArticleSection, ModelArticle, ModelLogo} from './types';

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
  sections?: ArticleSection[];
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
  kimiK27CodePricing: {
    label: 'Kimi API pricing: Kimi K2.7 Code',
    url: 'https://platform.kimi.ai/docs/pricing/chat-k27-code',
  },
} as const;

function pricingArticle({
  companyId,
  date,
  logo,
  modelLabel,
  productLineId,
  releaseName,
  eyebrow,
  title,
  dek,
  summary,
  impact,
  primaryShift,
  sections,
}: {
  companyId: string;
  date: string;
  logo: ModelLogo['modelMark'];
  modelLabel: string;
  productLineId: string;
  releaseName?: string;
  eyebrow: string;
  title: string;
  dek?: string;
  summary: string;
  impact: string;
  primaryShift: string;
  sections?: ArticleSection[];
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
    eyebrow,
    title,
    dek,
    summary,
    impact,
    primaryShift,
    sections,
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
      releaseName: 'GPT-3.5',
      eyebrow: 'The $2 chat era',
      title: 'GPT-3.5 Turbo priced chat at a tenth of what GPT-3 cost',
      dek: 'The ChatGPT API arrived at a flat $0.002 per 1K tokens — 10x cheaper than OpenAI’s own davinci models — and turned conversational AI into a commodity ingredient.',
      summary:
        'When OpenAI opened the ChatGPT API, it undercut its flagship text-davinci-003 pricing by 10x with one flat rate for input and output, making conversation cheap enough to bolt onto almost any product.',
      impact:
        'That flat $2-per-million price is why 2023 filled up with chat features and wrapper startups: the marginal cost of a conversation dropped low enough to give away.',
      primaryShift: '10x undercut of davinci-era GPT-3',
      sections: [
        {
          heading: 'What changed',
          body: [
            'GPT-3.5 Turbo launched with one flat rate covering both input and output tokens — no split billing, just $0.002 per 1K tokens, a tenth of what text-davinci-003 charged.',
            'It was the first time a frontier lab priced its best conversational model below its older completion models, signaling that chat was the product OpenAI wanted the world building on.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'The price, not the model, created the application boom. Davinci-class quality had existed for months; what changed in March 2023 was that an always-on assistant feature stopped being a meaningful line item.',
            'Every later "cheap tier" — Haiku, Flash, mini — is a descendant of the bet GPT-3.5 Turbo made: volume at low margins beats scarcity at high ones.',
          ],
        },
      ],
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
      eyebrow: 'Frontier premium',
      title: 'GPT-4 set the original frontier price: $30 in, $60 out',
      dek: 'GPT-4 launched at 15–30x the price of GPT-3.5 Turbo, and developers paid it anyway — proof that a capability gap can sustain a real price gap.',
      summary:
        'GPT-4’s launch pricing established the two-tier market every provider later copied: a cheap workhorse model for volume and an expensive frontier model for the requests that justify it.',
      impact:
        'For years afterward, "cheaper than launch GPT-4" was the default way to advertise progress; this $30/$60 anchor is the reference point most cost-decline charts are drawn against.',
      primaryShift: 'Two-tier market: workhorse vs. frontier',
      sections: [
        {
          heading: 'What changed',
          body: [
            'Two weeks after pricing chat at $2 per million tokens, OpenAI asked 15–30x more for GPT-4 — and introduced split input/output billing on a flagship, with output tokens costing double input.',
            'The 8K-context launch price of $30 input and $60 output per million tokens made the cost of intelligence legible: the same prompt had two prices, and the gap between them was the price of capability.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'GPT-4 proved demand for frontier models is far less price-sensitive than anyone expected — teams routed their hardest problems to it at 15x the cost without hesitation.',
            'It also created the routing problem that still defines production LLM systems: deciding, request by request, which calls deserve the expensive model.',
          ],
        },
      ],
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
      eyebrow: 'First frontier price cut',
      title: 'GPT-4 Turbo was the first time the frontier got cheaper',
      dek: 'Eight months after GPT-4 launched, DevDay cut its input price by two-thirds while stretching context to 128K — the first hard evidence that frontier pricing decays fast.',
      summary:
        'GPT-4 Turbo dropped flagship input pricing from $30 to $10 per million tokens while expanding the context window 16x, delivering more model for a third of the price in under a year.',
      impact:
        'It taught the market that waiting a few months buys the same capability cheaper — an expectation that has shaped how teams time model commitments ever since.',
      primaryShift: '3x input price cut in eight months',
      sections: [
        {
          heading: 'What changed',
          body: [
            'At DevDay 2023, OpenAI repriced its flagship tier downward for the first time: $10 input and $30 output per million tokens, against GPT-4’s original $30 and $60.',
            'The cut came bundled with a 128K context window, so the price per useful request fell even further than the headline per-token numbers suggest.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'Before GPT-4 Turbo, it was an open question whether frontier prices would behave like luxury goods or like compute. This was the answer: they fall, and they fall quickly.',
            'The cut also squeezed early GPT-4 resellers and wrappers whose margins assumed stable pricing — the first demonstration that building on a frozen price sheet is a risk.',
          ],
        },
      ],
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
      sections: [
        {
          heading: 'What changed',
          body: [
            'GPT-4o mini replaced GPT-3.5 Turbo as OpenAI’s default cheap model at roughly a tenth of its price — 15 cents per million input tokens for a model that outperformed it across the board.',
            'It collapsed the quality gap that had defined the budget tier: for the first time, the cheap option was multimodal, instruction-reliable, and good enough for most production traffic.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'Sub-dollar pricing changed system design more than any flagship release that year — multi-call patterns like reranking, self-correction, and parallel drafting became rounding errors.',
            'It set the price band that Gemini Flash, Claude Haiku, and later mini-tier models all had to compete inside.',
          ],
        },
      ],
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
      eyebrow: 'Caching is the real price',
      title: 'GPT-5.4 sells 2026 frontier reasoning below 2023 GPT-4 Turbo rates',
      dek: 'A 2026 flagship priced under GPT-4 Turbo’s 2023 sticker — and with cached input at $0.25, the listed price isn’t even the price most agent workloads pay.',
      summary:
        'GPT-5.4’s $2.50 input rate comes in below what GPT-4 Turbo charged in late 2023, while the 10x cached-input discount quietly became the number that matters for agents replaying the same context every turn.',
      impact:
        'For agentic workloads that re-read long system prompts and tool definitions on every call, the effective cost is closer to the $0.25 cache rate than the headline — sticker prices stopped telling the whole story.',
      primaryShift: 'Cache-discounted agentic pricing',
      sections: [
        {
          heading: 'What changed',
          body: [
            'GPT-5.4 listed at $2.50 input and $15 output per million tokens — frontier reasoning priced below where OpenAI’s flagship sat in 2023, three model generations earlier.',
            'The more consequential line is cached input at $0.25: a 10x discount for re-sent context, which is most of what an agent loop actually transmits.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'By 2026, comparing models on headline token price had become misleading. Cache discounts, batch tiers, and long-context surcharges mean two models with the same sticker can differ several-fold in real cost.',
            'GPT-5.4 is a good anchor for that shift: its economics were designed around the agent loop — pay full price once for the context, then cents for every iteration over it.',
          ],
        },
      ],
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
      eyebrow: 'The curve bends back up',
      title: 'GPT-5.5 doubled GPT-5.4’s price — the cost curve isn’t a one-way slide',
      dek: 'Seven weeks after GPT-5.4, OpenAI launched its successor at exactly double the rate — a reminder that prices fall on trend but reprice upward when a model clears a bar customers will pay for.',
      summary:
        'GPT-5.5 launched at $5 input and $30 output per million tokens, twice GPT-5.4’s rate, splitting OpenAI’s top of lineup into a budget flagship and a premium one.',
      impact:
        'The doubling pushed developers toward explicit routing: send easy traffic to GPT-5.4, reserve GPT-5.5 for the steps that fail on the cheaper tier — paying per request for marginal capability.',
      primaryShift: 'Premium repricing above the prior flagship',
      sections: [
        {
          heading: 'What changed',
          body: [
            'GPT-5.5 took the slot above GPT-5.4 at exactly 2x its pricing across input, output, and cached input — a clean premium tier rather than a replacement.',
            'This timeline mostly shows prices falling; this pin is the counterexample, where capability gains were monetized as a higher rate instead of passed through as savings.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'The long-run cost decline is real, but it is a property of capability tiers, not model names: yesterday’s frontier gets cheap while the new frontier re-anchors at a premium.',
            'GPT-5.5 makes that mechanism visible — the curve falls because the expensive edge keeps moving, not because everything gets cheaper at once.',
          ],
        },
      ],
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
      releaseName: 'Claude 3',
      eyebrow: 'The $75 ceiling',
      title: 'Claude 3 Opus put a $75 ceiling on what output tokens could cost',
      dek: 'One launch, one family, a 60x price spread: Haiku at $0.25 input, Opus at $15 — the Claude 3 lineup turned model selection into an explicit cost-quality menu.',
      summary:
        'The Claude 3 launch priced three sibling models across a 60x range, and Opus’s $75-per-million output rate stood for years as the high-water mark of mainstream token pricing.',
      impact:
        'The Haiku/Sonnet/Opus menu became the template for tiered lineups industry-wide — and the $75 output ceiling became the number later flagship prices were measured down from.',
      primaryShift: '60x intra-family price spread',
      sections: [
        {
          heading: 'What changed',
          body: [
            'Instead of one model at one price, Anthropic shipped a graded family on day one: Haiku at $0.25/$1.25, Sonnet at $3/$15, and Opus at $15/$75 per million tokens.',
            'Opus matched no one — its output rate was the most expensive mainstream API token money could buy, a position it held while competitors raced downward.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'A 60x spread inside one family reframed the buying decision from "which provider" to "which tier" — and made graceful degradation (try Haiku, escalate to Opus) a standard architecture.',
            'It also marked the top of the market: nearly every flagship price since has launched below Opus’s $15/$75, making this pin the reference ceiling for the whole cost story.',
          ],
        },
      ],
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
      releaseName: 'Claude 3.7',
      eyebrow: 'Reasoning at no markup',
      title: 'Claude 3.7 Sonnet charged the same rate whether or not it was thinking',
      dek: 'Anthropic listed identical pricing for standard and extended-thinking modes — and in doing so moved the cost question from price per token to tokens per answer.',
      summary:
        'Claude 3.7 Sonnet kept the familiar $3/$15 rate but let the model spend billable thinking tokens before answering, making the bill depend on deliberation length rather than a mode surcharge.',
      impact:
        'After reasoning models, a sticker price stopped predicting a bill: the same request could cost 10x more depending on how long the model thought. Cost control became a prompt-design problem.',
      primaryShift: 'Billable reasoning tokens at base rates',
      sections: [
        {
          heading: 'What changed',
          body: [
            'Rather than pricing extended thinking as a premium mode, Anthropic billed thinking tokens as ordinary output at the ordinary rate — $15 per million, however many the model used.',
            'The price sheet stayed one line long while the actual cost of a request became variable, set by a thinking budget the developer tunes per call.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'This is the moment per-token price charts started to mislead: a "cheap" reasoning model that thinks for 20,000 tokens costs more per answer than an "expensive" model that doesn’t.',
            'Cost-per-task quietly replaced cost-per-token as the metric that matters, and every reasoning model since has inherited that accounting.',
          ],
        },
      ],
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
      releaseName: 'Claude 4',
      eyebrow: 'Same sticker, new model',
      title: 'Claude Opus 4 held the Opus price flat while the model leapt',
      dek: 'Fourteen months after Claude 3 Opus, its successor launched at the identical $15/$75 — the entire capability jump delivered as more model per dollar, not a new price.',
      summary:
        'Claude Opus 4 kept the exact rate card of Claude 3 Opus, so the generational gain in coding and agentic work arrived as a silent improvement in price-per-capability rather than a visible price cut.',
      impact:
        'It showed that cost compression doesn’t always look like a discount: sometimes the sticker holds still and the model underneath it gets dramatically better, invisible on any price chart.',
      primaryShift: 'Capability-per-dollar gain at constant price',
      sections: [
        {
          heading: 'What changed',
          body: [
            'Nothing — on the price sheet. $15 input, $75 output per million tokens, unchanged from March 2024, while Sonnet 4 likewise held at $3/$15.',
            'What changed was everything the price bought: Opus 4 was pitched at long-horizon agentic coding, work the previous Opus could not sustain at any price.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'Price-stability releases like this are why naive cost-per-token charts understate progress: the deflation happened in capability terms, not dollar terms.',
            'For buyers it set up a clean experiment — same budget, swap the model, measure the difference — which is exactly how a lot of teams justified moving agent workloads to Opus 4.',
          ],
        },
      ],
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
      releaseName: 'Claude 4.6 Sonnet',
      eyebrow: 'The constant in the lineup',
      title: 'Claude Sonnet 4.6 kept the $3/$15 price two years running',
      dek: 'From Claude 3 Sonnet in early 2024 through Sonnet 4.6 in 2026, the mid-tier rate never moved — $3 in, $15 out became something teams could budget around like infrastructure.',
      summary:
        'Sonnet 4.6 extended one of the longest-held price points in the API market: the same $3/$15 rate spanning the 3, 3.5, 3.7, 4, and 4.6 Sonnet generations.',
      impact:
        'A frozen price made every upgrade a drop-in: swap the model string, keep the cost model, get the better model. Few products iterate this fast without ever repricing.',
      primaryShift: 'Multi-generation price stability',
      sections: [
        {
          heading: 'What changed',
          body: [
            'The model, repeatedly — the price, never. Across two years of Sonnet releases, Anthropic treated $3/$15 as a fixed product promise while capability climbed underneath it.',
            'By Sonnet 4.6 the practical change was elsewhere on the rate card: cached input at $0.30 per million tokens, a 10x discount for the repeated context that dominates agent traffic.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'Stable pricing is a strategy, not an accident: it converts model upgrades from procurement decisions into config changes, which keeps customers from re-evaluating competitors at each release.',
            'On this timeline, the Sonnet line is the control group — the pin where the dollars hold still, so everything that changed must be measured in capability.',
          ],
        },
      ],
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
      releaseName: 'Claude 4.7 Opus',
      eyebrow: 'Flagship price collapse',
      title: 'Claude Opus 4.7 cut the flagship tier to a third of its old price',
      dek: 'Opus pricing fell from $15/$75 to $5/$25 — the top of Anthropic’s lineup landed closer to where Sonnet had always been than to where Opus started.',
      summary:
        'Claude Opus 4.7 carries a rate card at one-third of the $15/$75 that defined the Opus tier since 2024, collapsing the gap between Anthropic’s flagship and its workhorse.',
      impact:
        'A 3x cut at the top tier moved workloads back up-market: tasks that had been routed to Sonnet purely on cost could suddenly justify the flagship, simplifying routing logic across many stacks.',
      primaryShift: '3x flagship price cut',
      sections: [
        {
          heading: 'What changed',
          body: [
            'The Opus tier, priced at $15/$75 per million tokens through two generations, dropped to $5/$25 — with cached input at $0.50, putting cached flagship calls below Sonnet’s uncached input rate.',
            'The premium for "best available" shrank from 5x the mid-tier to well under 2x, the narrowest flagship gap Anthropic had ever offered.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'When the flagship premium gets this thin, the calculus of model routing inverts: the engineering cost of maintaining a cheap-model fallback can exceed what the fallback saves.',
            'It also confirms the pattern this timeline tracks at the top end — the $75 output token didn’t get discounted, it got obsoleted by successors launching at lower anchors.',
          ],
        },
      ],
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
      releaseName: 'Gemini 1.5',
      eyebrow: 'The price war opens',
      title: 'Gemini 1.5 Flash got most of a price cut before its first birthday',
      dek: 'Google’s August 2024 update dropped Flash to 7.5 cents per million input tokens — an aggressive mid-cycle cut on a model that was already the cheap option.',
      summary:
        'Months after launch, Gemini 1.5 Flash was repriced to $0.075 input and $0.30 output per million tokens, a cut Google made without shipping a new model — pure price competition.',
      impact:
        'At single-digit cents per million tokens, whole categories of work — classify every log line, summarize every document, caption every image — stopped being cost decisions at all.',
      primaryShift: 'Mid-cycle cut to single-digit cents',
      sections: [
        {
          heading: 'What changed',
          body: [
            'Most price drops on this timeline arrive attached to a new model. This one didn’t: Google cut Flash’s existing price by the better part of 80% in an ordinary developer-blog update.',
            'The new rate applied to prompts under 128K tokens, pairing near-free pricing with a context window that no similarly priced model could match.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'This was Google playing its structural card — its own TPUs and its own datacenters — to compete on a dimension where rivals paying market rates for compute struggle to follow.',
            'The bottom of the market is where price elasticity actually lives: cuts at the cents level create new workload categories, while cuts at the flagship level mostly shift existing ones.',
          ],
        },
      ],
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
      releaseName: 'Gemini 2.0',
      eyebrow: 'Priced, then retired',
      title: 'Gemini 2.0 Flash is the reminder that API prices come with end dates',
      dek: 'One simple rate covered text, image, and video input — and within a year and a half, Google had scheduled the model’s shutdown for June 2026, price list and all.',
      summary:
        'Gemini 2.0 Flash unified multimodal input under a single $0.10/$0.40 rate, then became this timeline’s clearest example of the other side of cheap tokens: short model lifespans.',
      impact:
        'Its scheduled shutdown shows what the cost charts hide — tokens get cheaper partly because providers retire old models, and a price you build on can simply stop existing.',
      primaryShift: 'Unified multimodal rate, then deprecation',
      sections: [
        {
          heading: 'What changed',
          body: [
            'Pricing got simpler: text, image, and video input all billed at one rate, $0.10 per million tokens, ending the per-modality price matrix that had made multimodal cost estimates a spreadsheet exercise.',
            'Then the lifecycle reasserted itself — Google marked Gemini 2.0 Flash for shutdown on June 1, 2026, giving the model roughly sixteen months from launch to retirement.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'Falling prices and forced migrations are the same mechanism viewed from different sides: the provider clears old serving capacity, and you reverify your entire workload on the successor.',
            'For anyone budgeting LLM costs over multi-year horizons, this pin is the caveat — the curve trends down, but no individual point on it is guaranteed to keep existing.',
          ],
        },
      ],
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
      releaseName: 'Gemini 3.1 Pro (Preview)',
      eyebrow: 'Undercutting the frontier',
      title: 'Gemini 3.1 Pro listed a frontier model below everyone else’s flagship',
      dek: 'At $2 in and $12 out, Google priced its top preview under OpenAI’s and Anthropic’s flagship rates — treating frontier pricing as a competitive weapon rather than a premium.',
      summary:
        'Gemini 3.1 Pro Preview undercut the contemporaneous flagship rates from OpenAI and Anthropic, continuing Google’s pattern of competing at the top of the market on price rather than prestige.',
      impact:
        'When the cheapest flagship is also a credible one, rivals lose the room to charge for the frontier label itself — every dollar of price gap has to be justified by measurable capability.',
      primaryShift: 'Frontier capability at sub-flagship pricing',
      sections: [
        {
          heading: 'What changed',
          body: [
            'Google’s top-of-lineup preview listed at $2 input and $12 output per million tokens for prompts up to 200K — under GPT-5.4’s $2.50/$15 and well under Opus-tier rates at the time.',
            'The price applied to a preview label, a pattern of its own: aggressive introductory rates that establish the comparison point before general availability locks in expectations.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'Three providers pricing flagships within a 2x band — where a 15x band stood in 2023 — is the strongest single signal that frontier inference had become a contested commodity.',
            'For developers, the convergence shifted differentiation to everything around the token price: caching behavior, context limits, tool reliability, and rate ceilings.',
          ],
        },
      ],
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
      eyebrow: 'The floor of the market',
      title: 'Gemini 3.1 Flash-Lite shows where the bottom of the market sits in 2026',
      dek: 'The cheapest tier of the Gemini 3.1 family prices cached input at 2.5 cents per million tokens — a rate card built for workloads measured in billions of tokens.',
      summary:
        'Flash-Lite anchors the low end of the 2026 market at $0.25 input and $1.50 output per million tokens, with cached input cheap enough to treat repeated context as effectively free.',
      impact:
        'The floor price of the market decides which always-on use cases exist at all; at this rate, running a model over everything is an architecture choice, not a budget line.',
      primaryShift: 'High-volume floor pricing',
      sections: [
        {
          heading: 'What changed',
          body: [
            'The notable move at the floor is what the cheap tier now includes: Flash-Lite bills text, image, and video input at the same low rate, capabilities that were flagship-only two years earlier.',
            'Compare it against this timeline’s own history — at $0.25 input, the cheapest 2026 Gemini costs an eighth of what GPT-3.5 Turbo charged in 2023 while doing far more.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'Floor-tier models quietly handle most production token volume — routing, extraction, moderation, summarization — so this price sets the operating cost of the AI features users never see.',
            'The floor rising slightly in capability while falling in price each generation is the truest version of the cost story: not flagship discounts, but the cheap tier absorbing yesterday’s frontier.',
          ],
        },
      ],
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
    slug: 'kimi-k2-7-code',
    basis: 'current',
    billingModel: 'input-output',
    inputUsdPerMillion: 0.95,
    outputUsdPerMillion: 4,
    cachedInputUsdPerMillion: 0.19,
    pricedAt: '2026-06-12',
    providerLabel: 'Moonshot AI',
    modelLabel: 'Kimi K2.7 Code',
    sourceLabel: sources.kimiK27CodePricing.label,
    sourceUrl: sources.kimiK27CodePricing.url,
    note: 'Official Kimi API price for Kimi K2.7 Code; taxes, promotions, and nonstandard billing modes may differ.',
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
      releaseName: 'Grok 4.1',
      eyebrow: 'Late entrant, low price',
      title: 'Grok 4.1 Fast was xAI buying its way into the API market',
      dek: 'A late entrant can’t win on trust or ecosystem, so xAI led with 20-cent input tokens — using price, not benchmarks, as the wedge into developer workloads.',
      summary:
        'Grok 4.1 Fast launched at $0.20 input and $0.50 output per million tokens, undercutting the established cheap tiers from a provider with everything to prove and nothing to cannibalize.',
      impact:
        'Challenger pricing is what keeps incumbents cutting: every cheap-and-credible entrant resets the definition of "too expensive" one tier up the market.',
      primaryShift: 'Challenger price wedge',
      sections: [
        {
          heading: 'What changed',
          body: [
            'xAI’s first seriously developer-priced API tier arrived at rates that made it among the cheapest credible agentic models available — with cached input at $0.05 per million tokens.',
            'The "Fast" branding marks a positioning choice: rather than chase the flagship benchmark race, the priced API product targeted the high-volume tool-calling traffic where unit cost decides everything.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'A new entrant has no installed base to protect, so it can price at or below cost in a way incumbents serving billions of daily tokens cannot easily match.',
            'Whether or not Grok won those workloads, its price points showed up in everyone else’s pricing meetings — visible in the cheaper tiers shipped across the market through 2026.',
          ],
        },
      ],
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
      eyebrow: 'The 2x output ratio',
      title: 'Grok 4.20’s odd ratio: output at only twice the input price',
      dek: 'Most providers charge 4–6x more for output than input; Grok 4.20’s narrow 2x spread makes it unusually cheap for verbose work like code generation and long-form drafting.',
      summary:
        'Grok 4.20 listed at $1.25 input and $2.50 output per million tokens — a 2:1 output-to-input ratio in a market where 5:1 and 6:1 are the norm.',
      impact:
        'The input/output ratio is the under-read line on every price sheet: for output-heavy workloads, it matters more than the headline input price that comparison charts usually rank by.',
      primaryShift: 'Narrow input/output spread',
      sections: [
        {
          heading: 'What changed',
          body: [
            'Where GPT-5.4 charged 6x more for output than input and Claude’s tiers charged 5x, Grok 4.20 charged just 2x — a structurally different bet on how its tokens would be consumed.',
            'For a workload that emits as many tokens as it ingests, that ratio makes Grok 4.20 cheaper than models with lower advertised input prices.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'Output ratios encode what providers think their models are for: high ratios favor read-heavy retrieval and analysis, low ratios favor generation — drafts, code, transcripts.',
            'It is a reminder that "price per million tokens" was never one number, and ranking models by input price alone misprices half the workloads in production.',
          ],
        },
      ],
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
      releaseName: 'Grok 4.3 (Beta)',
      eyebrow: 'Upgrade at zero delta',
      title: 'Grok 4.3 shipped a generation jump with no price change at all',
      dek: 'Grok 4.3 took over Grok 4.20’s exact rate card — $1.25 in, $2.50 out, $0.20 cached — making the upgrade free for anyone already calling the API.',
      summary:
        'Two months after Grok 4.20, its successor arrived at identical pricing across every line of the rate card, delivering the generational improvement as pure capability-per-dollar.',
      impact:
        'Same-price successors are how most cost compression actually reaches an invoice now: the bill stays flat while the model behind the endpoint quietly gets better.',
      primaryShift: 'Same-price generational upgrade',
      sections: [
        {
          heading: 'What changed',
          body: [
            'The model version — and nothing else. Input, output, and cached-input rates all carried over from Grok 4.20 unchanged, including the unusually narrow 2x output ratio.',
            'The beta label did the pricing work a discount usually does: an invitation to try the new generation with zero switching cost and zero budget conversation.',
          ],
        },
        {
          heading: 'Why it mattered',
          body: [
            'By 2026 the dramatic launch-day price cut had become rare; the dominant pattern was this one, where prices hold and improvement compounds silently inside an existing line item.',
            'It closes this timeline’s xAI arc cleanly: enter with a price wedge, hold the unusual ratio, then compete on cadence — shipping better models faster at the same price.',
          ],
        },
      ],
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
    sections: synthetic.sections ?? [
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
