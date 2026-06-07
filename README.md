# 🛡️ HackMCP

**MCP knowledge base for pentesting and bug bounty hunting, Context7-style.**

HackMCP exposes a curated offensive-security knowledge base through the [Model Context Protocol](https://modelcontextprotocol.io/), so any MCP-compatible client (Claude Desktop, Cursor, Zed, etc.) can search vulnerabilities, fetch payloads, browse wordlists, and read full HackTricks guides without leaving the editor.

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

## 📚 Knowledge base sources
- **[HackTricks](https://github.com/HackTricks-wiki/hacktricks)** — 981 pages indexed (web, network, mobile, cloud, AD, privesc, reversing, AI, ...)
- **Curated catalog** — 24 web vulnerabilities (CWE/OWASP-mapped), 80+ payloads, 10 wordlists, 4 full methodologies
- **No network calls at runtime** — HackTricks is cloned once, indexed in-memory, then served from disk

## 🚀 Installation

### 1. Clone & build
```bash
git clone https://github.com/HackTricks-wiki/hacktricks.git   # into ./hacktricks
npm install
npm run build
```

The `hacktricks/` directory must sit next to `src/`, or you can set `HACKTRICKS_PATH` to point at it.

### 2. Add to your MCP client

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "hackmcp": {
      "command": "node",
      "args": ["/absolute/path/to/hackmcp/dist/index.js"]
    }
  }
}
```

**Cursor / Zed / any stdio MCP client** — same config.

## 🧪 Example usage

Once installed, ask your assistant things like:

- *"Search HackTricks for SSRF bypass techniques for AWS metadata."*
- *"Get me an XSS polyglot that works inside an unquoted attribute."*
- *"Show me the full content of pentesting-web/xss-cross-site-scripting/README.md"*
- *"Generate a 5-day pentest plan for https://example.com with these endpoints..."*
- *"Help me write a HackerOne report for the reflected XSS I found in /search."*

## ⚖️ Disclaimer

This tool is for **defensive security work, authorized penetration tests, and bug bounty programs with explicit scope**. The maintainers are not responsible for any misuse. Always get written authorization before testing systems you don't own.
