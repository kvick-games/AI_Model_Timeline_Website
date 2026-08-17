import type {ModelArticle} from '../types';

export const article: ModelArticle = {
  slug: 'cursor-origin',
  release: {
    companyId: 'cursor',
    productLineId: 'cursor-origin',
    name: 'Origin',
    date: '2026-08-17',
  },
  logo: {
    modelLabel: 'Origin',
    modelMark: 'cursor',
  },
  eyebrow: 'Agent-era code hosting',
  title: 'Origin brought code hosting inside Cursor',
  dek: 'Cursor launched Origin on August 17, 2026 as a code-hosting platform designed to work closely with the Cursor development environment.',
  summary: 'Origin is Cursor’s git forge for the agentic era. At launch, Cursor emphasized a fast, approachable hosting experience, deep product integration, and a path for getting started by syncing existing repositories from GitHub.',
  impact: 'The launch expanded Cursor from an editor and coding-agent platform into the repository-hosting layer, bringing more of the path from agent-written code to shared source control under one product stack.',
  facts: [
    {
      label: 'Provider',
      value: 'Cursor',
    },
    {
      label: 'Product category',
      value: 'Code hosting and git forge',
    },
    {
      label: 'Launch status',
      value: 'Live',
    },
    {
      label: 'Migration path',
      value: 'Sync repositories from GitHub',
    },
    {
      label: 'Product connection',
      value: 'Deep Cursor integration',
    },
  ],
  sections: [
    {
      heading: 'What launched',
      body: [
        'Cursor announced that Origin was live and described it as a fast, easy-to-use code-hosting platform integrated directly with Cursor.',
        'The launch flow included syncing repositories from GitHub, giving existing projects a direct route into the new hosting service.',
      ],
    },
    {
      heading: 'Why it mattered',
      body: [
        'Origin moved Cursor beyond the environment where agents write code and into the infrastructure where repositories are stored and shared.',
        'That vertical expansion made code hosting part of Cursor’s agent workflow instead of leaving repository management entirely to a separate platform.',
      ],
    },
  ],
  sources: [
    {
      label: 'Cursor: Origin is now live',
      url: 'https://x.com/cursor_ai/status/2089399057659596847',
    },
    {
      label: 'Cursor: Origin',
      url: 'https://cursor.com/origin',
    },
  ],
};
