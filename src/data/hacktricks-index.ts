/**
 * HackTricks indexer and search
 * Indexes all HackTricks markdown files for fast searching and content retrieval
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the hacktricks/src directory at module load.
 * Search order:
 *  1. HACKTRICKS_PATH env var
 *  2. <projectRoot>/hacktricks/src  (sibling directory at the project root, NOT dist root)
 *  3. <projectRoot>/../hacktricks/src
 *  4. Common workspace layouts
 */
function resolveHackTricksRoot(): string | null {
  const candidates: string[] = [];
  if (process.env.HACKTRICKS_PATH) {
    candidates.push(process.env.HACKTRICKS_PATH);
  }
  // dist/data/hacktricks-index.js -> project root is dist/..; src lives in dist/../..
  const fromModule = path.resolve(__dirname, '..', '..', '..', 'hacktricks', 'src');
  candidates.push(fromModule);
  // src/data/hacktricks-index.ts (dev) -> ../../.. gives project root, then hacktricks/src
  const fromSrc = path.resolve(__dirname, '..', '..', 'hacktricks', 'src');
  candidates.push(fromSrc);
  // One level up (if hacktricks/ is sibling of project parent)
  const fromAbove = path.resolve(__dirname, '..', '..', '..', '..', 'hacktricks', 'src');
  candidates.push(fromAbove);
  // process.cwd based
  candidates.push(path.resolve(process.cwd(), 'hacktricks', 'src'));

  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
        return c;
      }
    } catch { /* ignore */ }
  }
  return null;
}

const HACKTRICKS_ROOT: string | null = resolveHackTricksRoot();

export interface HackTricksPage {
  /** Full path relative to hacktricks/src (e.g. "pentesting-web/xss-cross-site-scripting/README.md") */
  path: string;
  /** Title extracted from first H1, or filename */
  title: string;
  /** Top-level category (e.g. "pentesting-web") */
  category: string;
  /** Subcategory (e.g. "xss-cross-site-scripting") or null */
  subcategory: string | null;
  /** Raw markdown content (mdBook directives stripped) */
  content: string;
  /** Length in chars */
  size: number;
  /** Headings extracted (h2, h3) */
  headings: string[];
  /** File size in bytes */
  bytes: number;
  /** Tags guessed from category and filename */
  tags: string[];
}

let cache: HackTricksPage[] | null = null;
let rootWarned = false;

function warnMissingRoot() {
  if (rootWarned) return;
  rootWarned = true;
  console.error(
    '[hackmcp] HackTricks source not found. Set HACKTRICKS_PATH env var or clone HackTricks into ./hacktricks/src (or ../hacktricks/src).',
  );
}

/**
 * Strip mdBook directives from markdown:
 *   {{#include file.md}}
 *   {{#ref}}file.md{{#endref}}
 *   {{#tabs}}...{{#endtabs}}
 *   {{#tab name}}...{{#endtab}}
 */
function stripMdBookDirectives(md: string): string {
  md = md.replace(/\{\{#include\s+[^}]+\}\}/g, '');
  md = md.replace(/\{\{#ref\}\}/g, '');
  md = md.replace(/\{\{\/ref\}\}/g, '');
  md = md.replace(/\{\{#endref\}\}/g, '');
  md = md.replace(/\{\{#tabs\s+[^}]*\}\}/g, '');
  md = md.replace(/\{\{#tab\s+[^}]*\}\}/g, '');
  md = md.replace(/\{\{\/tab\}\}/g, '');
  md = md.replace(/\{\{\/tabs\}\}/g, '');
  md = md.replace(/\{\{#details\s+[^}]*\}\}/g, '**');
  md = md.replace(/\{\{\/details\}\}/g, '');
  md = md.replace(/\{\{[^}]*\}\}/g, '');
  return md;
}

/** Extract the first H1 title from markdown */
function extractTitle(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+?)$/m);
  if (m) {
    return m[1].trim().replace(/[*_`]/g, '');
  }
  return fallback.replace(/\.md$/, '').replace(/-/g, ' ');
}

/** Extract H2 and H3 headings */
function extractHeadings(md: string): string[] {
  const heads: string[] = [];
  const lines = md.split('\n');
  for (const line of lines) {
    if (line.match(/^#{2,3}\s+/)) {
      heads.push(line.replace(/^#+\s+/, '').replace(/[*_`]/g, '').trim());
    }
  }
  return heads;
}

/** Walk the hacktricks tree and index every .md file */
function walkAndIndex(): HackTricksPage[] {
  const pages: HackTricksPage[] = [];
  if (!HACKTRICKS_ROOT) {
    warnMissingRoot();
    return pages;
  }

  function walk(dir: string, basePath: string = '') {
    let entries: string[];
    try {
      entries = fs.readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(full, path.join(basePath, entry));
      } else if (entry.endsWith('.md') && !entry.startsWith('.')) {
        const relPath = path.join(basePath, entry);
        const parts = basePath.split(path.sep);
        const category = parts[0] || '';
        const subcategory = parts.length > 1 ? parts[1] : null;
        let content = '';
        try {
          content = fs.readFileSync(full, 'utf-8');
        } catch {
          continue;
        }
        const stripped = stripMdBookDirectives(content);
        const title = extractTitle(stripped, entry);
        const headings = extractHeadings(stripped);
        const tags: string[] = [category];
        if (subcategory) tags.push(subcategory);
        for (const h of headings.slice(0, 10)) {
          const t = h.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
          if (t.length > 2 && t.length < 30) tags.push(t);
        }
        pages.push({
          path: relPath,
          title,
          category,
          subcategory,
          content: stripped,
          size: stripped.length,
          bytes: stat.size,
          headings,
          tags,
        });
      }
    }
  }

  walk(HACKTRICKS_ROOT);
  return pages;
}

export function getIndex(): HackTricksPage[] {
  if (cache === null) {
    cache = walkAndIndex();
  }
  return cache;
}

/** Search the index by query, optional category filter */
export function searchHackTricks(query: string, options?: { category?: string; limit?: number }): HackTricksPage[] {
  const idx = getIndex();
  const q = query.toLowerCase().trim();
  const limit = options?.limit ?? 20;
  const category = options?.category?.toLowerCase();

  if (!q && !category) {
    return idx.slice(0, limit);
  }

  const scored: Array<{ page: HackTricksPage; score: number }> = [];
  for (const p of idx) {
    if (category && p.category.toLowerCase() !== category) continue;

    let score = 0;
    const titleLower = p.title.toLowerCase();
    const pathLower = p.path.toLowerCase();
    const contentLower = p.content.toLowerCase();

    if (q) {
      if (titleLower.includes(q)) score += 50;
      if (titleLower === q) score += 100;
      if (pathLower.includes(q)) score += 20;
      for (const t of p.tags) {
        if (t.toLowerCase().includes(q)) score += 10;
      }
      for (const h of p.headings) {
        if (h.toLowerCase().includes(q)) score += 8;
      }
      if (contentLower.includes(q)) {
        const occurrences = (contentLower.match(new RegExp(escapeRegex(q), 'g')) || []).length;
        score += Math.min(occurrences, 20);
      }
    }

    if (score > 0 || (!q && category)) {
      scored.push({ page: p, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.page);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Get a specific page by path */
export function getHackTricksPage(relPath: string): HackTricksPage | undefined {
  return getIndex().find(p => p.path === relPath);
}

/** List all categories */
export function getCategories(): Array<{ name: string; count: number }> {
  const idx = getIndex();
  const map = new Map<string, number>();
  for (const p of idx) {
    map.set(p.category, (map.get(p.category) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** Get a snippet from a page: first N chars starting at first match, or first N chars */
export function getSnippet(page: HackTricksPage, query: string, before: number = 200, after: number = 400): string {
  if (!query) {
    return page.content.slice(0, before + after);
  }
  const idx = page.content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return page.content.slice(0, before + after);
  }
  const start = Math.max(0, idx - before);
  const end = Math.min(page.content.length, idx + query.length + after);
  let snippet = page.content.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < page.content.length) snippet = snippet + '...';
  return snippet;
}

/** Get the resolved HackTricks root (for diagnostics) */
export function getHackTricksRoot(): string | null {
  return HACKTRICKS_ROOT;
}
