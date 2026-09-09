import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'gpt-image-2-5',
  release: {
    companyId: 'openai',
    productLineId: 'openai-image',
    name: 'GPT Image 2.5',
    date: '2026-09-08',
  },
  logo: {
    modelLabel: 'GPT Image 2.5',
    modelMark: 'gpt',
  },
  eyebrow: 'ChatGPT Images 2.5 / GPT-Image-2.5',
  title: 'ChatGPT Images 2.5 made GPT Image 2.5 the new OpenAI image SOTA',
  dek: 'OpenAI released ChatGPT Images 2.5 on September 8, 2026 as its state-of-the-art image model versus Images 2.0, with sharper detail, more precise multi-turn editing, and up to 50% lower latency, rolling out GA across ChatGPT, ChatGPT Work, and Codex.',
  summary:
    'ChatGPT Images 2.5 is the consumer-facing release; the API ships two tiers at the same GPT Image 2 token rates: gpt-image-2.5-flare (default / faster everyday generation, including snapshot gpt-image-2.5-flare-2026-09-08) and gpt-image-2.5-sunburst (higher-precision creative and edit workflows, including snapshot gpt-image-2.5-sunburst-2026-09-08).',
  impact:
    'This is the first GPT Image 2.5 card on the public timeline. It moves OpenAI past GPT Image 2 / Images 2.0 while keeping one card for the family, with Flare and Sunburst recorded as API tiers rather than separate timeline markers.',
  facts: [
    {label: 'Provider', value: 'OpenAI'},
    {label: 'Release date', value: 'September 8, 2026'},
    {label: 'ChatGPT product', value: 'ChatGPT Images 2.5'},
    {label: 'API model IDs', value: 'gpt-image-2.5-flare; gpt-image-2.5-sunburst'},
    {label: 'Dated snapshots', value: 'gpt-image-2.5-flare-2026-09-08; gpt-image-2.5-sunburst-2026-09-08'},
    {label: 'Positioning', value: 'SOTA vs ChatGPT Images 2.0 / GPT Image 2; up to 50% lower latency (Flare vs GPT Image 2)'},
    {label: 'Availability', value: 'GA in ChatGPT, ChatGPT Work, and Codex (desktop, mobile, web) plus API'},
    {label: 'API pricing', value: 'Matches GPT Image 2 token rates ($5/M text in; $8/M image in; $30/M image out)'},
  ],
  sections: [
    {
      heading: 'What shipped',
      body: [
        'OpenAI positions ChatGPT Images 2.5 as state-of-the-art versus Images 2.0, with sharper details, richer textures, better subject preservation, more reliable multi-turn edits, and faster generation.',
        'In the API, GPT-Image-2.5 Flare is the default everyday tier and is documented as delivering higher-quality images than GPT-Image-2 at up to 50% lower latency. GPT-Image-2.5 Sunburst targets premium visual workflows that need tighter control across edits, trading longer generation times for precision.',
      ],
    },
    {
      heading: 'Pricing and availability',
      body: [
        'Images 2.5 rolled out the same day to ChatGPT, ChatGPT Work, and Codex users across tiers on desktop, mobile, and web. Flare and Sunburst are available in the Images API (and as the Responses API image_generation tool model).',
        'OpenAI documents token rates that match GPT Image 2: $5 per million text input tokens, $8 per million image input tokens, and $30 per million image output tokens, with the same cached-input discounts. Both Flare and Sunburst share that rate card; the tier choice is quality/latency, not a different per-token price.',
      ],
    },
  ],
  sources: [
    {
      label: 'OpenAI: Introducing ChatGPT Images 2.5',
      url: 'https://openai.com/index/introducing-chatgpt-images-2-5/',
    },
    {
      label: 'OpenAI API: GPT-Image-2.5 Flare',
      url: 'https://developers.openai.com/api/docs/models/gpt-image-2.5-flare',
    },
    {
      label: 'OpenAI API: GPT-Image-2.5 Sunburst',
      url: 'https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst',
    },
    {
      label: 'Axios: Hands-on with ChatGPT Images 2.5',
      url: 'https://www.axios.com/2026/09/08/exclusive-hands-on-with-chatgpts-new-image-editor',
    },
  ],
};
