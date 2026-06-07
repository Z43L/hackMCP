/**
 * MCP Tools for HackMCP
 * Each tool has a name, description, input schema, and handler.
 */

import {
  searchVulnerabilities,
  getVulnerabilityById,
  type Vulnerability,
} from '../data/vulnerabilities.js';
import {
  searchPayloads,
  getPayloadsByClass,
  getPayloadById,
  type Payload,
} from '../data/payloads.js';
import {
  searchWordlists,
  getWordlistsByCategory,
  getWordlistById,
  type Wordlist,
} from '../data/wordlists.js';
import {
  searchMethodologies,
  getMethodologyById,
  getMethodologiesByType,
  type Methodology,
} from '../data/methodologies.js';
import {
  searchHackTricks,
  getHackTricksPage,
  getCategories,
  getSnippet,
  type HackTricksPage,
} from '../data/hacktricks-index.js';

// ============ Tool Definitions ============

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: 'search_hacktricks',
    description: `Search the HackTricks knowledge base for pentesting techniques, bypass methods, and exploitation guides.

Use this for:
- Specific vulnerability exploitation (e.g. "SQL injection", "JWT bypass", "SSRF cloud")
- WAF/filter bypass techniques
- Privilege escalation (Linux, Windows, cloud)
- Tool usage guides (Burp, sqlmap, nmap, etc.)
- Methodology references

Returns ranked results with titles, paths, headings, and a content snippet.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g. "SQL injection", "JWT none algorithm", "AWS credential theft")',
        },
        category: {
          type: 'string',
          description: 'Optional category filter: pentesting-web, network-services-pentesting, linux-hardening, windows-hardening, mobile-pentesting, binary-exploitation, generic-methodologies-and-resources, macos-hardening',
        },
        limit: {
          type: 'number',
          description: 'Max number of results (default 10, max 50)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_hacktricks_page',
    description: `Get the full content of a specific HackTricks page by its path.

Use after search_hacktricks to dive deep into a specific guide. The path is relative to the source (e.g. "pentesting-web/xss-cross-site-scripting/README.md").`,
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Page path relative to hacktricks/src (e.g. "pentesting-web/xss-cross-site-scripting/README.md")',
        },
        max_chars: {
          type: 'number',
          description: 'Max characters to return (default 20000, set lower if token-budget tight)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_hacktricks_categories',
    description: 'List all available HackTricks categories with their page counts. Useful for browsing.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_vulnerabilities',
    description: `Search the curated vulnerability knowledge base (CWE/OWASP-mapped entries).

Each result includes severity, CWE, OWASP Top 10 mapping, detection patterns, impact, remediation, and references. Use this when you need structured, normalized vulnerability info.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term: vuln name, CWE (e.g. "CWE-89"), OWASP (e.g. "A03"), or tag',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_payload',
    description: `Get specific pentesting payloads (XSS, SQLi, SSRF, LFI, command injection, SSTI, XXE, JWT, file upload, prototype pollution, open redirect).

Filter by vulnerability class and/or search by tag/target/context.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional search term (e.g. "union", "blind", "time-based")',
        },
        vuln_class: {
          type: 'string',
          description: 'Filter by class: xss, sqli, ssrf, lfi, cmdi, ssti, xxe, jwt, file-upload, prototype-pollution, redirect',
        },
      },
    },
  },
  {
    name: 'get_wordlist',
    description: `Get wordlists for directory/subdomain/parameter discovery, fuzzing, file upload bypass, header injection, and common credentials.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional search term',
        },
        category: {
          type: 'string',
          description: 'Filter by category: directory, subdomain, parameter, extension, header, fuzz, username, password',
        },
      },
    },
  },
  {
    name: 'get_methodology',
    description: `Get a pentesting methodology with phases, tasks, tools, and timing.

Available methodologies:
- web-pentest: full web app pentest (WSTG + PTES)
- bug-bounty: hunter-focused methodology
- api-pentest: API security testing (OWASP API Top 10)
- recon: deep recon pipeline`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional search term',
        },
        id: {
          type: 'string',
          description: 'Get specific methodology by id (web-pentest, bug-bounty, api-pentest, recon)',
        },
      },
    },
  },
  {
    name: 'get_bypass',
    description: `Get WAF/filter bypass techniques for a specific defense.

Returns both curated bypass payloads and pointers to relevant HackTricks pages.`,
    inputSchema: {
      type: 'object',
      properties: {
        defense: {
          type: 'string',
          description: 'Defense to bypass: "ssrf-filter", "xss-waf", "sqli-waf", "upload-extension", "csp", "cors", "auth", "waf", "rate-limit"',
        },
      },
      required: ['defense'],
    },
  },
];

// ============ Tool Handlers ============

export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
};

function jsonResult(data: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function textResult(text: string): ToolResult {
  return {
    content: [{ type: 'text', text }],
  };
}

function errorResult(message: string): ToolResult {
  return {
    content: [{ type: 'text', text: `Error: ${message}` }],
  };
}

export async function handleToolCall(name: string, args: any): Promise<ToolResult> {
  try {
    switch (name) {
      case 'search_hacktricks': {
        const query = String(args?.query || '').trim();
        const category = args?.category ? String(args.category) : undefined;
        const limit = args?.limit ? Math.min(Number(args.limit), 50) : 10;
        const results = searchHackTricks(query, { category, limit });
        if (results.length === 0) {
          return textResult(
            `No results for "${query}" in HackTricks${category ? ` (category: ${category})` : ''}.\n\nTry: list_hacktricks_categories to browse, or broaden the query.`,
          );
        }
        const out = results.map((p, i) => {
          const snippet = getSnippet(p, query);
          return `### ${i + 1}. ${p.title}\n` +
            `**Path:** \`${p.path}\`\n` +
            `**Category:** ${p.category}${p.subcategory ? ` / ${p.subcategory}` : ''}\n` +
            `**Size:** ${p.size.toLocaleString()} chars\n` +
            (p.headings.length > 0 ? `**Sections:** ${p.headings.slice(0, 8).join(' | ')}${p.headings.length > 8 ? ' ...' : ''}\n` : '') +
            `\n---\n${snippet}\n`;
        }).join('\n\n');
        return textResult(`# HackTricks search: "${query}"\n\n${out}\n\nUse get_hacktricks_page with the path to read the full page.`);
      }

      case 'get_hacktricks_page': {
        const path = String(args?.path || '');
        const maxChars = args?.max_chars ? Math.min(Number(args.max_chars), 100000) : 20000;
        const page = getHackTricksPage(path);
        if (!page) {
          return errorResult(`Page not found: ${path}. Use search_hacktricks to find pages.`);
        }
        let content = page.content;
        let truncated = false;
        if (content.length > maxChars) {
          content = content.slice(0, maxChars);
          truncated = true;
        }
        const header = `# ${page.title}\n\n**Path:** \`${page.path}\`\n**Category:** ${page.category}${page.subcategory ? ` / ${page.subcategory}` : ''}\n**Full size:** ${page.size.toLocaleString()} chars\n\n---\n\n`;
        return textResult(header + content + (truncated ? `\n\n[...truncated at ${maxChars} chars. Increase max_chars to see more.]` : ''));
      }

      case 'list_hacktricks_categories': {
        const cats = getCategories();
        const total = cats.reduce((s, c) => s + c.count, 0);
        const lines = cats.map(c => `- **${c.name}**: ${c.count} pages`).join('\n');
        return textResult(`# HackTricks Categories (${total} total pages)\n\n${lines}\n\nUse search_hacktricks with a category filter to focus.`);
      }

      case 'search_vulnerabilities': {
        const query = String(args?.query || '').trim();
        const results: Vulnerability[] = query
          ? searchVulnerabilities(query)
          : require('../data/vulnerabilities.js').vulnerabilities;
        if (results.length === 0) {
          return textResult(`No vulnerabilities found for "${query}".`);
        }
        return jsonResult(results);
      }

      case 'get_payload': {
        const query = String(args?.query || '').trim();
        const vulnClass = args?.vuln_class ? String(args.vuln_class) : undefined;
        const results: Payload[] = (query || vulnClass)
          ? searchPayloads(query, vulnClass)
          : require('../data/payloads.js').payloads;
        if (results.length === 0) {
          return textResult(`No payloads found${query ? ` for "${query}"` : ''}${vulnClass ? ` in class "${vulnClass}"` : ''}.`);
        }
        return jsonResult(results);
      }

      case 'get_wordlist': {
        const query = String(args?.query || '').trim();
        const category = args?.category ? String(args.category) : undefined;
        let results: Wordlist[];
        if (category && !query) {
          results = getWordlistsByCategory(category);
        } else {
          results = searchWordlists(query);
        }
        if (results.length === 0) {
          return textResult(`No wordlists found${query ? ` for "${query}"` : ''}${category ? ` in category "${category}"` : ''}.`);
        }
        return jsonResult(results);
      }

      case 'get_methodology': {
        const query = String(args?.query || '').trim();
        const id = args?.id ? String(args.id) : undefined;
        let results: Methodology[];
        if (id) {
          const m = getMethodologyById(id);
          results = m ? [m] : [];
        } else if (query) {
          results = searchMethodologies(query);
        } else {
          results = require('../data/methodologies.js').methodologies;
        }
        if (results.length === 0) {
          return textResult(`No methodology found${id ? ` with id "${id}"` : ''}${query ? ` for "${query}"` : ''}. Available: web-pentest, bug-bounty, api-pentest, recon.`);
        }
        return jsonResult(results);
      }

      case 'get_bypass': {
        const defense = String(args?.defense || '').toLowerCase().trim();
        const map: Record<string, { queries: string[]; payloadClass?: string }> = {
          'ssrf-filter': { queries: ['SSRF bypass', 'URL filter bypass', '169.254.169.254', 'cloud metadata'], payloadClass: 'ssrf' },
          'xss-waf': { queries: ['XSS WAF bypass', 'XSS filter bypass', 'CSP bypass'], payloadClass: 'xss' },
          'sqli-waf': { queries: ['SQL injection WAF bypass', 'SQLi filter bypass'], payloadClass: 'sqli' },
          'upload-extension': { queries: ['file upload bypass', 'webshell upload', 'extension bypass'], payloadClass: 'file-upload' },
          'csp': { queries: ['Content Security Policy bypass', 'CSP bypass'], },
          'cors': { queries: ['CORS bypass', 'CORS misconfiguration'], },
          'auth': { queries: ['authentication bypass', 'JWT bypass', '2FA bypass'], payloadClass: 'jwt' },
          'waf': { queries: ['WAF bypass', 'filter evasion', 'WAF detection'], },
          'rate-limit': { queries: ['rate limit bypass', 'IP rotation', 'brute force'], },
        };
        const conf = map[defense] || { queries: [args?.defense || ''] };
        // Curated payload class
        let payloads: Payload[] = [];
        if (conf.payloadClass) {
          payloads = getPayloadsByClass(conf.payloadClass).filter(p => p.tags.some(t => t.includes('bypass') || t.includes('rce')));
        }
        // HackTricks pages
        const htPages: HackTricksPage[] = [];
        for (const q of conf.queries) {
          htPages.push(...searchHackTricks(q, { limit: 5 }));
        }
        // Dedupe
        const seen = new Set<string>();
        const deduped = htPages.filter(p => {
          if (seen.has(p.path)) return false;
          seen.add(p.path);
          return true;
        });

        const out = {
          defense,
          payload_class: conf.payloadClass,
          curated_payloads: payloads,
          hacktricks_pages: deduped.slice(0, 15).map(p => ({
            title: p.title,
            path: p.path,
            category: p.category,
            snippet: getSnippet(p, conf.queries[0] || '', 150, 300),
          })),
          recommended_tools: ['Burp Suite Pro', 'ffuf', 'wfuzz', 'nuclei', 'sqlmap'],
        };
        return jsonResult(out);
      }

      default:
        return errorResult(`Unknown tool: ${name}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return errorResult(`Tool ${name} failed: ${msg}`);
  }
}
