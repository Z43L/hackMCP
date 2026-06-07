/**
 * MCP Resources for HackMCP
 * Resources expose data that can be read by clients (URIs).
 */

import {
  searchHackTricks,
  getHackTricksPage,
  getCategories,
  getSnippet,
} from '../data/hacktricks-index.js';
import { vulnerabilities } from '../data/vulnerabilities.js';
import { payloads } from '../data/payloads.js';
import { wordlists } from '../data/wordlists.js';
import { methodologies } from '../data/methodologies.js';

export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export const resources: Resource[] = [
  {
    uri: 'hacktricks://categories',
    name: 'HackTricks Categories',
    description: 'List of all HackTricks categories with page counts',
    mimeType: 'application/json',
  },
  {
    uri: 'hacktricks://category/{category}',
    name: 'HackTricks Category Pages',
    description: 'List of pages in a given category (replace {category} with e.g. "pentesting-web")',
    mimeType: 'application/json',
  },
  {
    uri: 'hacktricks://page/{path}',
    name: 'HackTricks Page Content',
    description: 'Full content of a specific HackTricks page (replace {path} with the file path)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'hacktricks://cheatsheet/{topic}',
    name: 'HackTricks Cheat Sheet',
    description: 'Quick reference cheat sheet for a topic (e.g. "xss", "sqli", "ssrf", "jwt", "rce", "lfi", "csp", "cors")',
    mimeType: 'text/markdown',
  },
  {
    uri: 'hackmcp://vulnerabilities',
    name: 'Vulnerability Catalog',
    description: 'Curated catalog of web vulnerabilities with CWE, OWASP, detection and remediation',
    mimeType: 'application/json',
  },
  {
    uri: 'hackmcp://vulnerability/{id}',
    name: 'Vulnerability Detail',
    description: 'Detailed information about a specific vulnerability by id (e.g. "sqli", "xss-reflected", "ssrf")',
    mimeType: 'application/json',
  },
  {
    uri: 'hackmcp://payloads',
    name: 'Payload Library',
    description: 'Curated pentesting payloads for XSS, SQLi, SSRF, RCE, etc.',
    mimeType: 'application/json',
  },
  {
    uri: 'hackmcp://payloads/{class}',
    name: 'Payloads by Class',
    description: 'Payloads for a specific vulnerability class (xss, sqli, ssrf, lfi, cmdi, ssti, xxe, jwt, file-upload, redirect, prototype-pollution)',
    mimeType: 'application/json',
  },
  {
    uri: 'hackmcp://wordlists',
    name: 'Wordlist Catalog',
    description: 'Catalog of wordlists: directory, subdomain, parameter, fuzzing, credentials',
    mimeType: 'application/json',
  },
  {
    uri: 'hackmcp://wordlist/{id}',
    name: 'Wordlist Content',
    description: 'Content of a specific wordlist by id',
    mimeType: 'application/json',
  },
  {
    uri: 'hackmcp://methodologies',
    name: 'Pentesting Methodologies',
    description: 'Full methodologies: web pentest, bug bounty, API pentest, recon',
    mimeType: 'application/json',
  },
  {
    uri: 'hackmcp://methodology/{id}',
    name: 'Methodology Detail',
    description: 'Detailed methodology by id (web-pentest, bug-bounty, api-pentest, recon)',
    mimeType: 'application/json',
  },
];

/** Parse a resource URI and return matching content as { text, mimeType } or null */
export async function readResource(uri: string): Promise<{ text: string; mimeType: string } | null> {
  // hacktricks://categories
  if (uri === 'hacktricks://categories') {
    return {
      text: JSON.stringify(getCategories(), null, 2),
      mimeType: 'application/json',
    };
  }

  // hacktricks://category/{category}
  const catMatch = uri.match(/^hacktricks:\/\/category\/(.+)$/);
  if (catMatch) {
    const cat = catMatch[1];
    const pages = searchHackTricks('', { category: cat, limit: 1000 });
    const summary = pages.map(p => ({
      path: p.path,
      title: p.title,
      subcategory: p.subcategory,
      size: p.size,
      headings: p.headings.slice(0, 5),
    }));
    return {
      text: JSON.stringify({ category: cat, count: pages.length, pages: summary }, null, 2),
      mimeType: 'application/json',
    };
  }

  // hacktricks://page/{path}
  const pageMatch = uri.match(/^hacktricks:\/\/page\/(.+)$/);
  if (pageMatch) {
    const p = getHackTricksPage(pageMatch[1]);
    if (!p) return null;
    return {
      text: p.content,
      mimeType: 'text/markdown',
    };
  }

  // hacktricks://cheatsheet/{topic}
  const cheatMatch = uri.match(/^hacktricks:\/\/cheatsheet\/(.+)$/);
  if (cheatMatch) {
    const topic = cheatMatch[1];
    const pages = searchHackTricks(topic, { limit: 8 });
    if (pages.length === 0) {
      return { text: `# Cheat Sheet: ${topic}\n\nNo results found in HackTricks.`, mimeType: 'text/markdown' };
    }
    let out = `# Cheat Sheet: ${topic}\n\n> Aggregated from ${pages.length} HackTricks page(s). Use get_hacktricks_page for full content.\n\n`;
    for (const p of pages) {
      out += `---\n\n## ${p.title}\n**Path:** \`${p.path}\`\n\n`;
      out += getSnippet(p, topic, 100, 500) + '\n\n';
    }
    return { text: out, mimeType: 'text/markdown' };
  }

  // hackmcp://vulnerabilities
  if (uri === 'hackmcp://vulnerabilities') {
    return {
      text: JSON.stringify(vulnerabilities, null, 2),
      mimeType: 'application/json',
    };
  }

  // hackmcp://vulnerability/{id}
  const vulnMatch = uri.match(/^hackmcp:\/\/vulnerability\/(.+)$/);
  if (vulnMatch) {
    const v = vulnerabilities.find(x => x.id === vulnMatch[1]);
    if (!v) return null;
    return {
      text: JSON.stringify(v, null, 2),
      mimeType: 'application/json',
    };
  }

  // hackmcp://payloads
  if (uri === 'hackmcp://payloads') {
    return {
      text: JSON.stringify(payloads, null, 2),
      mimeType: 'application/json',
    };
  }

  // hackmcp://payloads/{class}
  const payMatch = uri.match(/^hackmcp:\/\/payloads\/(.+)$/);
  if (payMatch) {
    const cls = payMatch[1];
    const filtered = payloads.filter(p => p.vulnClass === cls);
    if (filtered.length === 0) return null;
    return {
      text: JSON.stringify(filtered, null, 2),
      mimeType: 'application/json',
    };
  }

  // hackmcp://wordlists
  if (uri === 'hackmcp://wordlists') {
    const summary = wordlists.map(w => ({
      id: w.id,
      name: w.name,
      category: w.category,
      size: w.size,
      description: w.description,
      tags: w.tags,
    }));
    return {
      text: JSON.stringify(summary, null, 2),
      mimeType: 'application/json',
    };
  }

  // hackmcp://wordlist/{id}
  const wlMatch = uri.match(/^hackmcp:\/\/wordlist\/(.+)$/);
  if (wlMatch) {
    const w = wordlists.find(x => x.id === wlMatch[1]);
    if (!w) return null;
    return {
      text: JSON.stringify(w, null, 2),
      mimeType: 'application/json',
    };
  }

  // hackmcp://methodologies
  if (uri === 'hackmcp://methodologies') {
    const summary = methodologies.map(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      description: m.description,
      phases: m.phases.length,
      tags: m.tags,
    }));
    return {
      text: JSON.stringify(summary, null, 2),
      mimeType: 'application/json',
    };
  }

  // hackmcp://methodology/{id}
  const mMatch = uri.match(/^hackmcp:\/\/methodology\/(.+)$/);
  if (mMatch) {
    const m = methodologies.find(x => x.id === mMatch[1]);
    if (!m) return null;
    return {
      text: JSON.stringify(m, null, 2),
      mimeType: 'application/json',
    };
  }

  return null;
}
