import type {ModelArticle} from '../types';
import {publicAssetPath} from '../publicAssets';

export const article: ModelArticle = {
  slug: 'kimi-k3',
  release: {
    companyId: 'moonshot-kimi',
    productLineId: 'kimi-models',
    name: 'Kimi K3',
    date: '2026-07-16',
  },
  logo: {
    modelLabel: 'K3',
    modelMark: 'generic',
  },
  eyebrow: '#1 on Code Arena WebDev',
  title: 'Kimi K3 opened at the top of the frontend coding field',
  dek: 'Moonshot AI launched Kimi K3 on July 16, 2026 and immediately took the preliminary #1 position on Arena\'s Code Arena WebDev Overall leaderboard, scoring 1,679 across blind human-preference battles.',
  summary: 'Kimi K3 is Moonshot AI\'s 2.8-trillion-parameter flagship for software engineering, knowledge work, and deep reasoning. Its launch result put it 48 Arena points ahead of Claude Fable 5 and 61 points ahead of GPT-5.6 Sol xHigh on the overall frontend leaderboard.',
  impact: 'The result is a landmark for the coding-model race: a Moonshot model debuted above every proprietary and open model on a large public, human-preference evaluation of real frontend work. The ranking was preliminary at launch, but its lead was larger than K3\'s reported ±17-point uncertainty interval.',
  media: {
    src: publicAssetPath('articles/kimi-k3-code-arena.png'),
    alt: 'Arena Frontend Code Arena leaderboard with Kimi K3 ranked first at 1,679, ahead of Claude Fable 5 at 1,631 and GPT-5.6 Sol xHigh at 1,618.',
    caption: 'Arena\'s July 16, 2026 Code Arena WebDev Overall leaderboard placed Kimi K3 at preliminary #1 with a 1,679 score from 1,757 votes.',
  },
  facts: [
    {
      label: 'Provider',
      value: 'Moonshot AI',
    },
    {
      label: 'Launch date',
      value: 'July 16, 2026',
    },
    {
      label: 'Code Arena rank',
      value: '#1 overall (preliminary)',
    },
    {
      label: 'Arena score',
      value: '1,679 ±17 from 1,757 votes',
    },
    {
      label: 'Lead over #2',
      value: '+48 points vs. Claude Fable 5',
    },
    {
      label: 'Scale',
      value: '2.8 trillion parameters',
    },
    {
      label: 'Context window',
      value: '1M tokens',
    },
    {
      label: 'Developer model ID',
      value: 'kimi-k3',
    },
  ],
  sections: [
    {
      heading: 'The #1 coding result',
      body: [
        'Arena\'s Code Arena WebDev Overall board ranked Kimi K3 first on July 16 with a score of 1,679 and a preliminary confidence interval of ±17 points. Claude Fable 5 followed at 1,631, while GPT-5.6 Sol xHigh in the Codex harness scored 1,618.',
        'The board was based on 483,895 blind human-preference votes across 98 models. Kimi K3 itself had accumulated 1,757 votes when Arena published the ranking, so its placement should be treated as preliminary rather than permanent.',
      ],
    },
    {
      heading: 'What K3 is',
      body: [
        'Moonshot describes K3 as its most capable model to date: a 2.8-trillion-parameter flagship built with Kimi Delta Attention and Attention Residuals, with native visual understanding and a one-million-token context window.',
        'The API ships under the kimi-k3 model ID with thinking always enabled at launch. It supports vision input, automatic context caching, structured output, tool-choice constraints, dynamic tool loading, and long completions for software-engineering and agent workflows.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Frontend coding had become one of the clearest public battlegrounds for frontier models because Arena evaluates complete rendered applications through blind user preference rather than isolated code-completion tests.',
        'K3 did not merely lead other open or Chinese models. Its preliminary launch score placed it above the full field, including the newest Anthropic, OpenAI, Zhipu, SpaceXAI, Meta, Alibaba, and MiniMax entries on the board.',
        'Arena listed K3 as proprietary at launch. This timeline therefore treats it as a frontier LLM landmark rather than an open-weight release unless and until Moonshot publishes the weights.',
      ],
    },
  ],
  sources: [
    {
      label: 'Moonshot AI on X: Kimi K3 ranked #1 in Frontend Code Arena',
      url: 'https://x.com/Kimi_Moonshot/status/2077830229968683203',
    },
    {
      label: 'Arena: Code Arena WebDev Overall leaderboard',
      url: 'https://arena.ai/leaderboard/code',
    },
    {
      label: 'Kimi API Platform: Kimi K3 quickstart and model details',
      url: 'https://platform.kimi.ai/docs/guide/kimi-k3-quickstart',
    },
    {
      label: 'Kimi API Platform: Kimi K3 pricing',
      url: 'https://platform.kimi.ai/docs/pricing/chat-k3',
    },
  ],
};
