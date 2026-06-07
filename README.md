# 🛡️ HackMCP

**MCP knowledge base for pentesting and bug bounty hunting, Context7-style.**

HackMCP exposes a curated offensive-security knowledge base through the [Model Context Protocol](https://modelcontextprotocol.io/). It can be consumed by any MCP-compatible client (Claude Desktop, Cursor, Zed, etc.) over **stdio** (local) or **HTTP/SSE** (remote, deployable to Vercel/Fly/Railway).

> All exploits and payloads are for **authorized security testing only** (your own apps, bug bounty programs with explicit scope, or lab/CTF environments).

## ✨ Features

### 🔧 Tools (8)
| Tool | What it does |
|---|---|
| `search_hacktricks` | Full-text + heading search across **981 indexed HackTricks pages** |
| `get_hacktricks_page` | Fetch the full content of any HackTricks guide by path |
| `list_hacktricks_categories` | Browse the 14 top-level HackTricks categories |
| `search_vulnerabilities` | Search the curated vuln catalog (CWE, OWASP, detection, remediation) |
| `get_payload` | Pull proven payloads (XSS, SQLi, SSRF, SSTI, RCE, LFI, XXE, JWT, ...) |
| `get_wordlist` | Directory / subdomain / parameter / fuzzing / credentials wordlists |
| `get_methodology` | Phased pentest & bug bounty methodologies |
| `get_bypass` | WAF / filter bypass techniques + relevant HackTricks pages |

### 📦 Resources (12)
Browse the knowledge base as URIs:
- `hacktricks://categories`, `hacktricks://category/{cat}`, `hacktricks://page/{path}`, `hacktricks://cheatsheet/{topic}`
- `hackmcp://vulnerabilities`, `hackmcp://vulnerability/{id}`
- `hackmcp://payloads`, `hackmcp://payloads/{class}`
- `hackmcp://wordlists`, `hackmcp://wordlist/{id}`
- `hackmcp://methodologies`, `hackmcp://methodology/{id}`

### 💬 Prompts (8)
Reusable templates that pull in the right tool calls automatically:
`analyze_vulnerability`, `bug_bounty_report`, `pentest_plan`, `payload_crafter`, `hunt_ideas`, `triage_finding`, `review_code_for_vulns`, `chain_exploit`

### 🌐 Two transport modes
| Mode | Use case | How |
|---|---|---|
| **stdio** (default) | Local editor integration (Claude Desktop, Cursor, Zed) | `node dist/index.js` |
| **HTTP** (Streamable HTTP) | Remote/hosted deployment (Vercel, Fly, Railway) | `TRANSPORT=http node dist/index.js` |

## 📚 Knowledge base
- **[HackTricks](https://github.com/HackTricks-wiki/hacktricks)** — 981 pages indexed (web, network, mobile, cloud, AD, privesc, reversing, AI, ...)
- **Curated catalog** — 24 web vulnerabilities (CWE/OWASP-mapped), 80+ payloads, 10 wordlists, 4 full methodologies
- **No network calls at runtime** — HackTricks is cloned once, indexed in-memory, then served from disk

## 🚀 Installation

### 1. Clone & build
```bash
git clone https://github.com/Z43L/hackMCP.git
cd hackMCP

# HackTricks should already be bundled (see /hacktricks/src)
# If not, clone it:
# git clone --depth 1 https://github.com/HackTricks-wiki/hacktricks.git

npm install
npm run build
```

The `hacktricks/` directory must sit next to `src/`, or you can set `HACKTRICKS_PATH` to point at it.

### 2a. Stdio mode (local) — Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "hackmcp": {
      "command": "node",
      "args": ["/absolute/path/to/hackMCP/dist/index.js"]
    }
  }
}
```

Restart Claude — you get 8 tools + 12 resources + 8 prompts.

### 2b. HTTP mode (remote) — any HTTP MCP client

```bash
TRANSPORT=http PORT=3000 MCP_STATELESS=false node dist/index.js
# Server on http://localhost:3000/mcp
# Health: http://localhost:3000/health
# Info:   http://localhost:3000/info
```

## ☁️ Deploy to Vercel

The repo is pre-configured for Vercel serverless deployment:

```bash
# One-time
vercel link
# Deploy
vercel --prod
```

After deploy, the MCP endpoint is at:
```
https://<your-project>.vercel.app/mcp
```

Configure your HTTP MCP client to point there.

**Vercel-specific notes:**
- The server runs in **stateless** mode (`MCP_STATELESS=true`) for serverless compatibility
- HackTricks (~160MB) is bundled with the deployment — no external storage needed
- First request after a cold start may take 1-2s while the HackTricks index loads

### Manual Vercel setup
If you prefer the dashboard:
1. Import this repo at [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Other**
3. Build command: `npm run build`
4. Output directory: leave empty (Vercel auto-detects `api/`)
5. Memory: **3008 MB** (function setting) so HackTricks index fits

## 🧪 Example usage

Once installed, ask your assistant things like:

- *"Search HackTricks for SSRF bypass techniques for AWS metadata."*
- *"Get me an XSS polyglot that works inside an unquoted attribute."*
- *"Show me the full content of pentesting-web/xss-cross-site-scripting/README.md"*
- *"Generate a 5-day pentest plan for https://example.com with these endpoints..."*
- *"Help me write a HackerOne report for the reflected XSS I found in /search."*

## ⚙️ Environment variables

| Var | Default | Description |
|---|---|---|
| `TRANSPORT` | `stdio` | `stdio` or `http` |
| `PORT` | `3000` | HTTP port (when `TRANSPORT=http`) |
| `HOST` | `0.0.0.0` | HTTP bind address |
| `MCP_STATELESS` | `false` | `true` for serverless (Vercel) — no session state |
| `HACKTRICKS_PATH` | auto | Path to `hacktricks/src` directory |

See `.env.example` for a template.

## 📁 Project structure
```
hackMCP/
├── api/index.ts          # Vercel serverless entrypoint
├── src/
│   ├── index.ts          # Dual transport dispatcher (stdio / http)
│   ├── http-server.ts    # Express + StreamableHTTP transport
│   ├── data/             # Knowledge base (curated + HackTricks index)
│   ├── tools/            # 8 MCP tools
│   ├── resources/        # 12 MCP resources
│   └── prompts/          # 8 MCP prompts
├── hacktricks/src/       # Bundled HackTricks wiki (981 .md files)
├── vercel.json           # Vercel deployment config
└── package.json
```

## ⚖️ Disclaimer

This tool is for **defensive security work, authorized penetration tests, and bug bounty programs with explicit scope**. The maintainers are not responsible for any misuse. Always get written authorization before testing systems you don't own.
