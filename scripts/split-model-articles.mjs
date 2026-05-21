import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const articlesModuleUrl = new URL('../src/data/modelArticles.ts', import.meta.url).href;
const {modelArticles} = await import(articlesModuleUrl);

const outDir = path.join(root, 'src/data/articles');
fs.mkdirSync(outDir, {recursive: true});

const importLines = [];
const arrayLines = [];

for (const article of modelArticles) {
  const filePath = path.join(outDir, `${article.slug}.ts`);
  const body = JSON.stringify(article, null, 2);
  const fileContent = `import type {ModelArticle} from '../types';\n\nexport const article: ModelArticle = ${body};\n`;
  fs.writeFileSync(filePath, fileContent, 'utf8');

  const varName = article.slug.replace(/[^a-zA-Z0-9_]/g, '_');
  importLines.push(`import {article as article_${varName}} from './articles/${article.slug}';`);
  arrayLines.push(`  article_${varName},`);
}

const indexContent = [
  "import type {ModelArticle} from './types';",
  ...importLines,
  '',
  'export const modelArticles: ModelArticle[] = [',
  ...arrayLines,
  '];',
  '',
  'export const modelArticlesBySlug = modelArticles.reduce<Record<string, ModelArticle>>((articles, entry) => {',
  '  articles[entry.slug] = entry;',
  '  return articles;',
  '}, {});',
  '',
].join('\n');

fs.writeFileSync(path.join(root, 'src/data/modelArticles.ts'), indexContent, 'utf8');
console.log(`Wrote ${modelArticles.length} article files.`);
