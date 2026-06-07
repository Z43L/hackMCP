/**
 * MCP Prompts for HackMCP
 * Prompts are reusable message templates that users can invoke.
 */

export interface PromptDefinition {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export const promptDefinitions: PromptDefinition[] = [
  {
    name: 'analyze_vulnerability',
    description: 'Generate a structured analysis of a vulnerability finding (impact, root cause, remediation, PoC suggestions).',
    arguments: [
      { name: 'vuln_type', description: 'Type of vulnerability (e.g. "SSRF", "Stored XSS", "IDOR")', required: true },
      { name: 'context', description: 'The vulnerable code/endpoint/HTTP request context', required: true },
      { name: 'target', description: 'Optional: target application/tech stack for context', required: false },
    ],
  },
  {
    name: 'bug_bounty_report',
    description: 'Draft a complete bug bounty report from a finding. Use H1/Bugcrowd/Intigriti/Immunefi style.',
    arguments: [
      { name: 'vuln_type', description: 'Type of vulnerability', required: true },
      { name: 'steps_to_reproduce', description: 'Step-by-step repro', required: true },
      { name: 'impact', description: 'Demonstrated impact', required: true },
      { name: 'platform', description: 'Target platform: hackerone, bugcrowd, intigriti, immunefi', required: false },
    ],
  },
  {
    name: 'pentest_plan',
    description: 'Generate a phased pentest plan for a target. Combines recon, vuln discovery, and exploitation.',
    arguments: [
      { name: 'target', description: 'Target description (e.g. "https://example.com", "API at api.example.com", "Mobile app com.example.app")', required: true },
      { name: 'scope', description: 'Scope and rules of engagement', required: false },
      { name: 'duration', description: 'Available testing time (e.g. "5 days", "2 weeks")', required: false },
    ],
  },
  {
    name: 'payload_crafter',
    description: 'Generate targeted payloads for a specific injection point, drawing from the HackMCP and HackTricks knowledge base.',
    arguments: [
      { name: 'vuln_class', description: 'Vulnerability class (xss, sqli, ssrf, lfi, cmdi, ssti, xxe, etc.)', required: true },
      { name: 'context', description: 'Where the input is reflected/used (html-body, html-attribute, javascript-block, sql-string, etc.)', required: true },
      { name: 'filters', description: 'Known filters/blocks (e.g. "quotes blocked", "no spaces", "WAF: Cloudflare")', required: false },
      { name: 'target', description: 'Tech stack (e.g. "PHP/Jinja2/MySQL/AWS")', required: false },
    ],
  },
  {
    name: 'hunt_ideas',
    description: 'Generate hunt ideas for a bug bounty target - what to look for, where to look, and which tool to use.',
    arguments: [
      { name: 'target', description: 'Target program/asset', required: true },
      { name: 'tech_stack', description: 'Known tech stack', required: false },
    ],
  },
  {
    name: 'triage_finding',
    description: 'Triage a finding to determine if it is valid, its severity, and which program it belongs to.',
    arguments: [
      { name: 'finding', description: 'The finding to triage', required: true },
    ],
  },
  {
    name: 'review_code_for_vulns',
    description: 'Review a code snippet for security vulnerabilities, referencing OWASP/CWE and HackTricks.',
    arguments: [
      { name: 'language', description: 'Programming language', required: true },
      { name: 'code', description: 'The code to review', required: true },
    ],
  },
  {
    name: 'chain_exploit',
    description: 'Brainstorm chained exploits to escalate a low-severity finding to critical impact.',
    arguments: [
      { name: 'findings', description: 'List of findings to chain (comma-separated)', required: true },
    ],
  },
];

// ============ Prompt Generators ============

export function getPromptMessages(name: string, args: any): Array<{ role: 'user' | 'assistant'; content: { type: 'text'; text: string } }> | null {
  const a = args || {};
  switch (name) {
    case 'analyze_vulnerability': {
      const vuln = a.vuln_type || 'unknown';
      const ctx = a.context || 'no context provided';
      const target = a.target || 'unspecified target';
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are a senior application security engineer. Analyze the following vulnerability in depth.

**Vulnerability Type:** ${vuln}
**Target:** ${target}

**Context / Code / Request:**
\`\`\`
${ctx}
\`\`\`

Produce a structured analysis with these sections:
1. **Vulnerability Class & Root Cause** - What underlying defect causes this? Reference CWE and OWASP Top 10.
2. **Exploitation Path** - How would an attacker actually weaponize this? What HTTP requests/sequences?
3. **Impact** - What's the worst-case realistic impact? Use the formula: attacker capability → asset affected → business consequence.
4. **Proof of Concept** - Concrete code/payload/request demonstrating the issue. Use the HackMCP tools (search_hacktricks, get_payload) to pull proven payloads.
5. **Remediation** - Code-level fix, defense in depth, framework config.
6. **Detection** - How would a defender find this? What logs/IDS rules?
7. **Severity (CVSS 3.1)** - Provide a vector string and base score with justification.

Use HackTricks references (search_hacktricks, get_hacktricks_page) for exploitation techniques. Be specific, not generic. No "could potentially" — be definitive.`,
          },
        },
      ];
    }

    case 'bug_bounty_report': {
      const vuln = a.vuln_type || 'unknown';
      const steps = a.steps_to_reproduce || 'not provided';
      const impact = a.impact || 'unspecified';
      const platform = a.platform || 'hackerone';
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Draft a complete bug bounty report for ${platform}.

**Vulnerability:** ${vuln}
**Steps to Reproduce:** ${steps}
**Impact:** ${impact}

Follow this structure (${platform} style):
1. **Title** - Action in Component leads to Impact (e.g. "Reflected XSS in /search allows session hijacking")
2. **Severity** - Justified (CVSS 3.1 vector + base score)
3. **Description** - Root cause, affected component, attacker model
4. **Steps to Reproduce** - Numbered, copy-paste ready, with HTTP requests
5. **Impact** - What attacker can do, who is affected, business risk
6. **Remediation** - Specific code/config changes
7. **References** - CWE, OWASP, HackTricks pages

Pull real payloads from get_payload and exploitation techniques from search_hacktricks. Use screenshots placeholders where useful.

Tone: professional, factual, impact-first. No marketing fluff, no "could potentially". State what the attacker CAN do, not what they MIGHT do.`,
          },
        },
      ];
    }

    case 'pentest_plan': {
      const target = a.target || 'unspecified target';
      const scope = a.scope || 'standard web pentest scope';
      const duration = a.duration || '5 days';
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Generate a phased pentest plan.

**Target:** ${target}
**Scope:** ${scope}
**Duration:** ${duration}

Produce a day-by-day plan that includes:
1. **Recon** - subfinder/amass, httpx, wayback, JS analysis, tech fingerprinting
2. **Mapping** - functional map, auth flows, sensitive endpoints
3. **Vulnerability Discovery** - ordered by class: IDOR, XSS, SQLi, SSRF, RCE, business logic
4. **Exploitation** - chain findings, prove impact, build PoCs
5. **Reporting** - executive summary, per-finding detail, remediation

For each day, list:
- Specific tools to run (with one-liners where possible)
- Endpoints/areas to focus on
- Expected output / artifacts to capture
- Decision points (when to pivot vs deep-dive)

Reference the get_methodology tool for the web-pentest, bug-bounty, api-pentest, and recon methodologies. Use search_hacktricks for deep dives on specific vuln classes.`,
          },
        },
      ];
    }

    case 'payload_crafter': {
      const cls = a.vuln_class || 'xss';
      const ctx = a.context || 'unspecified';
      const filters = a.filters || 'none specified';
      const target = a.target || 'unspecified';
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Craft targeted payloads for a ${cls} injection.

**Context:** ${ctx}
**Known filters / WAF:** ${filters}
**Target stack:** ${target}

Deliver:
1. **Detection payload** - simplest payload that proves the injection point is vulnerable
2. **Exploitation payload** - working PoC that demonstrates impact
3. **WAF/filter bypass** - variants that defeat common filters (use get_bypass tool)
4. **Polyglot / universal payload** - if applicable
5. **Escalation ideas** - what can the attacker do once the vuln is confirmed

Pull from the curated library using get_payload (vuln_class="${cls}"), and use search_hacktricks for the latest bypass techniques. Test multiple variants because each filter implementation is different.`,
          },
        },
      ];
    }

    case 'hunt_ideas': {
      const target = a.target || 'unspecified target';
      const tech = a.tech_stack || 'unspecified';
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Generate bug bounty hunt ideas for:

**Target:** ${target}
**Tech stack:** ${tech}

Suggest 10 high-probability hunting strategies, each with:
- **Hypothesis** - what might be broken
- **Where to look** - specific endpoints/areas
- **How to test** - tool + technique
- **Why it might work** - common dev mistake it exploits
- **Estimated severity** if found

Bias toward the bug classes that pay the most: IDOR/authz, business logic, race conditions, SSRF, account takeover.

Use get_methodology(id="bug-bounty") for the full hunter playbook, and search_hacktricks for the specific vulnerability classes.`,
          },
        },
      ];
    }

    case 'triage_finding': {
      const finding = a.finding || 'no finding provided';
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Triage the following security finding to determine if it's valid, its severity, and how to communicate it.

**Finding:**
${finding}

Evaluate:
1. **Is it actually a vulnerability?** (vs intended behavior, self-XSS, requires unlikely user action, behind a feature, etc.)
2. **Is it exploitable in the real world?** (working PoC, real attacker model, not theoretical)
3. **Severity (CVSS 3.1)** - with full vector and justification. Don't over-rate XSS that requires self-victimization, don't under-rate auth bypass.
4. **Which vulnerability class** - map to CWE and OWASP Top 10.
5. **Suggested next steps** - PoC improvements, chain with other findings, or close as N/A.

Be brutally honest. If it's not a real bug, say so. If it's over-rated by the reporter, downgrade. If it's underrated, upgrade. Use search_hacktricks and get_vulnerability to validate.`,
          },
        },
      ];
    }

    case 'review_code_for_vulns': {
      const lang = a.language || 'unknown';
      const code = a.code || 'no code provided';
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Security review the following ${lang} code.

\`\`\`${lang}
${code}
\`\`\`

For each issue found, report:
1. **Line / location**
2. **Vulnerability class** (with CWE + OWASP)
3. **Why it's vulnerable** - the actual code defect
4. **How to exploit** - real attack scenario
5. **Fix** - secure replacement code

Cover: injection (SQLi, command, template, LDAP), XSS, SSRF, LFI/RFI, IDOR, auth/authz, deserialization, race conditions, SSRF, SSRF, SSRF, crypto misuse, hardcoded secrets, insecure randomness, path traversal, XXE, prototype pollution, business logic flaws.

Use search_hacktricks to pull in HackTricks references for each class you identify. Be specific. No boilerplate.`,
          },
        },
      ];
    }

    case 'chain_exploit': {
      const findings = a.findings || 'no findings provided';
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Brainstorm chained exploits to escalate the following findings to critical impact.

**Findings:**
${findings}

For each chain, output:
1. **Chain name** - catchy name
2. **Combined findings used** (e.g. "open redirect + OAuth client_id leak")
3. **Attack narrative** - step by step, who is the victim, what attacker does
4. **Why it escalates** - how does the combination change severity?
5. **Working PoC sketch** - HTTP requests or code
6. **Final impact** - what the attacker achieves (RCE, full account takeover, mass PII, AWS takeover, etc.)

Goal: take a collection of low/medium findings and combine them into 1-3 critical-severity chains. This is what gets max payouts. Be creative. Reference search_hacktricks for any specific exploitation step.`,
          },
        },
      ];
    }

    default:
      return null;
  }
}
