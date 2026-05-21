import type {ModelArticle} from './types';

const articleModules = import.meta.glob<{article: ModelArticle}>('./articles/*.ts', {
  eager: true,
});

export const modelArticles: ModelArticle[] = Object.values(articleModules)
  .map((module) => module.article)
  .sort((left, right) => left.slug.localeCompare(right.slug));

export const modelArticlesBySlug = modelArticles.reduce<Record<string, ModelArticle>>((articles, entry) => {
  articles[entry.slug] = entry;
  return articles;
}, {});
