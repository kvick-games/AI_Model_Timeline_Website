import type {ModelArticle} from './types';
import {addTokenPricingToArticle, syntheticPricingArticles} from './tokenPricing';

const articleModules = import.meta.glob<{article: ModelArticle}>('./articles/*.ts', {
  eager: true,
});

const importedArticles = Object.values(articleModules).map((module) => module.article);
const importedArticleSlugs = new Set(importedArticles.map((article) => article.slug));

export const modelArticles: ModelArticle[] = [
  ...importedArticles,
  ...syntheticPricingArticles.filter((article) => !importedArticleSlugs.has(article.slug)),
]
  .map(addTokenPricingToArticle)
  .sort((left, right) => left.slug.localeCompare(right.slug));

export const modelArticlesBySlug = modelArticles.reduce<Record<string, ModelArticle>>((articles, entry) => {
  articles[entry.slug] = entry;
  return articles;
}, {});
