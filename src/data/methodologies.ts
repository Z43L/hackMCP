/**
 * Knowledge base: Pentesting methodologies and checklists
 */

export interface Methodology {
  id: string;
  name: string;
  type: 'web' | 'api' | 'mobile' | 'cloud' | 'recon' | 'reporting';
  description: string;
  phases: Phase[];
  references: string[];
  tags: string[];
}

export interface Phase {
  name: string;
  description: string;
  tasks: string[];
  tools?: string[];
  duration?: string;
}

export const methodologies: Methodology[] = [
  {
    id: 'web-pentest',
    name: 'Web Application Penetration Testing Methodology',
    type: 'web',
    description: 'Comprehensive methodology for black-box and grey-box web application testing. Combines OWASP WSTG, PTES and bug bounty best practices.',
    references: [
      'https://owasp.org/www-project-web-security-testing-guide/',
      'http://www.pentest-standard.org/',
    ],
    tags: ['web', 'pentest', 'methodology', 'wstg', 'ptes'],
    phases: [
      {
        name: '1. Reconnaissance',
        description: 'Map the attack surface, discover assets and gather information about the target.',
        tasks: [
          'Identify in-scope domains and subdomains (subfinder, amass, assetfinder)',
          'Discover subdomains via certificate transparency (crt.sh)',
          'Wayback Machine: gather historical URLs (waybackurls, gau)',
          'Identify tech stack (Wappalyzer, BuiltWith, HTTP headers)',
          'Spider/crawl the application (Burp, ZAP, katana)',
          'Discover JavaScript files and extract endpoints (LinkFinder, SecretFinder)',
          'Identify APIs, GraphQL, WebSockets',
          'Google dorking, GitHub dorking, Shodan, Censys',
        ],
        tools: ['subfinder', 'amass', 'assetfinder', 'httpx', 'katana', 'waybackurls', 'gau'],
        duration: '1-3 days',
      },
      {
        name: '2. Mapping / Enumeration',
        description: 'Map functionality, user roles, and data flows.',
        tasks: [
          'Identify all features and endpoints (authenticated + unauthenticated)',
          'Map user roles: admin, regular user, anonymous',
          'Identify sensitive functionality: file upload, payments, password reset',
          'Note parameters and their expected types',
          'Identify all cookies, headers, tokens',
          'Map the data flow for critical functions',
          'Look for hidden parameters (Param Miner)',
          'Test for default credentials',
        ],
        duration: '1-2 days',
      },
      {
        name: '3. Vulnerability Discovery',
        description: 'Run active tests for each vulnerability class. Always use Burp as the central proxy.',
        tasks: [
          'Test for IDOR/BOLA on every endpoint with 2 accounts',
          'Test for SQLi (sqlmap, manual) on every parameter',
          'Test for XSS reflected, stored, DOM-based (manual + dalfox)',
          'Test for SSRF on URL-fetching parameters (manual + SSRFmap)',
          'Test for authentication bypass (force browse, JWT, OAuth)',
          'Test for authorization flaws (vertical + horizontal privilege escalation)',
          'Test for file upload (webshells, content-type bypass, double ext)',
          'Test for XXE on all XML parsers',
          'Test for SSTI in any user-controlled template input',
          'Test for race conditions (Turbo Intruder, parallel requests)',
          'Test for SSRF, CORS, CSP bypass, open redirect',
          'Test business logic: payment, coupon, refund, invite flows',
          'Test for info disclosure: source comments, .git, debug pages, stack traces',
          'Test for prototype pollution (Node.js apps)',
          'Test for HTTP request smuggling (CL.TE, TE.CL)',
          'Test for cache poisoning (Param Miner)',
        ],
        tools: ['Burp Suite Pro', 'sqlmap', 'dalfox', 'SSRFmap', 'Turbo Intruder', 'Param Miner'],
        duration: '3-7 days',
      },
      {
        name: '4. Exploitation',
        description: 'Chain findings, escalate impact, prove business risk.',
        tasks: [
          'Chain XSS + CSRF for account takeover',
          'Chain SSRF + cloud metadata for AWS creds',
          'Chain IDOR + file download for mass PII leak',
          'Demonstrate real-world impact (RCE, data theft, privilege escalation)',
          'Document each step with screenshots/HTTP requests',
          'Build a working PoC',
        ],
        duration: '2-3 days',
      },
      {
        name: '5. Reporting',
        description: 'Document findings clearly with reproduction steps, impact, and remediation.',
        tasks: [
          'Write a clean executive summary',
          'Detail each finding: title, severity (CVSS), description, impact, PoC, remediation',
          'Include screenshots and HTTP request/response examples',
          'Provide remediation guidance with code examples',
          'Write narrative for chained findings',
          'Include timeline of testing',
          'Appendices: scope, methodology, tools used',
        ],
        tools: ['Dradis', 'Serpico', 'Burp Report', 'custom Markdown'],
        duration: '1-2 days',
      },
    ],
  },
  {
    id: 'bug-bounty',
    name: 'Bug Bounty Hunting Methodology',
    type: 'web',
    description: 'Hunter-focused methodology for public bug bounty programs. Emphasizes asset discovery and signal-to-noise ratio.',
    references: [
      'https://github.com/jhaddix/tbhm',
      'https://www.bugbountyhunter.com/',
    ],
    tags: ['bugbounty', 'hunting', 'methodology'],
    phases: [
      {
        name: '1. Asset Discovery (Wider Scope)',
        description: 'Cast a wide net. Most bugs are in forgotten subdomains, not the main app.',
        tasks: [
          'Enumerate ALL subdomains: subfinder, amass, assetfinder, Chaos',
          'Resolve live hosts: httpx with tech detection',
          'Get every URL from Wayback, Common Crawl, OTX, gau',
          'Crawl each host deeply (katana, gospider)',
          'Extract endpoints from JavaScript',
          'Identify and probe all *.target.com subdomains',
          'Test mobile app APIs (jadx for Android, frida for iOS)',
          'Check acquisitions and sister companies',
        ],
        tools: ['subfinder', 'amass', 'httpx', 'katana', 'gau', 'waybackurls', 'Chaos'],
        duration: '1-2 days per program',
      },
      {
        name: '2. Quick Wins (Recon-Driven)',
        description: 'Go for low-hanging fruit that yields quick payouts and warms up the program.',
        tasks: [
          'Test for exposed .git, .env, .DS_Store, .vscode, .idea',
          'Test for subdomain takeover (can-i-take-over-xyz)',
          'Test S3 buckets, Azure blobs, GCP storage',
          'Test for exposed Jenkins, Grafana, Kibana, Consul',
          'Test for default credentials on every login form',
          'Test for sensitive data in JS files (API keys, AWS keys, S3 buckets)',
          'Check for open redirect + OAuth token theft',
          'Check for IDOR in password reset, email change',
        ],
        tools: ['nuclei', 's3scanner', 'subjack', 'nuclei-templates'],
        duration: '1-2 days',
      },
      {
        name: '3. Authentication & Authorization Deep Dive',
        description: 'Most bug bounty payouts are authz bugs. Spend time here.',
        tasks: [
          'Set up 2-3 test accounts at different privilege levels',
          'Test every endpoint for IDOR with 2 accounts (403 vs 200?)',
          'Test vertical privilege escalation (low user → admin actions)',
          'Test OAuth flow: open redirect, scope escalation, account takeover',
          'Test password reset: token predictability, host header poisoning',
          'Test JWT: none alg, weak secret, kid injection, jku injection',
          'Test session management: fixation, hijacking, logout invalidation',
          'Test MFA bypass (if present): response manipulation, direct API access',
          'Test re-authentication: step-up auth bypass',
        ],
        tools: ['Burp Suite', 'Autorize', 'AuthMatrix', 'jwt_tool'],
        duration: '3-5 days',
      },
      {
        name: '4. Business Logic',
        description: 'Logic bugs pay the most. They require understanding the app.',
        tasks: [
          'Map every business-critical flow: payments, signup, upgrade, refund, coupon',
          'Test for negative quantities, negative prices, currency confusion',
          'Test race conditions on: payment, coupon, withdraw, vote, follow',
          'Test for state machine violations (e.g., skip verification)',
          'Test for parameter pollution: ?id=1&id=2',
          'Test for HTTP method tampering: GET → POST/PUT/DELETE',
          'Test for type juggling in JSON: true/True/1, null in numerics',
        ],
        duration: '2-4 days',
      },
      {
        name: '5. Injection Attacks',
        description: 'XSS, SQLi, SSRF, RCE - the classics.',
        tasks: [
          'XSS in every input: search, comments, profile fields, file names',
          'Stored XSS in admin-only views = high severity',
          'SQLi on login, search, ID parameters (sqlmap + manual)',
          'SSRF on URL inputs, webhooks, image fetchers',
          'SSTI on email templates, PDF generators, username',
          'XXE on any XML input, SVG, docx, xlsx',
          'File upload bypass leading to RCE',
          'Test command injection on ping/traceroute/convert features',
        ],
        duration: '2-3 days',
      },
      {
        name: '6. Report & Submit',
        description: 'A bug only counts when it is reported well.',
        tasks: [
          'Title: <Action> in <Component> leads to <Impact>',
          'Impact first - what can attacker do?',
          'Reproduction: step-by-step, copy-paste',
          'Include HTTP request/response',
          'CVSS 3.1 score (justify)',
          'Remediation: code fix if possible',
          'Submit to the right program (scope, severity)',
          'Be patient and professional with triage',
        ],
      },
    ],
  },
  {
    id: 'api-pentest',
    name: 'API Penetration Testing Methodology',
    type: 'api',
    description: 'OWASP API Security Top 10 based methodology. Covers REST, GraphQL, gRPC, SOAP.',
    references: [
      'https://owasp.org/API-Security/editions/2023/en/0x11-t10/',
      'https://github.com/OWASP/API-Security',
    ],
    tags: ['api', 'rest', 'graphql', 'pentest'],
    phases: [
      {
        name: '1. API Discovery',
        description: 'Find all API endpoints and their schemas.',
        tasks: [
          'Read API documentation (Swagger/OpenAPI, GraphQL introspection)',
          'Spider the web app, identify XHR/fetch calls',
          'Mobile app traffic analysis (mitmproxy, Burp Mobile Assistant)',
          'Decompile mobile apps (jadx, frida) to find endpoints',
          'Run Kiterunner for hidden API endpoints',
          'Check GraphQL introspection (always in dev, often in prod)',
        ],
        tools: ['Kiterunner', 'Burp', 'mitmproxy', 'jadx'],
      },
      {
        name: '2. Authentication Testing (API1, API2)',
        description: 'Test authentication and token management.',
        tasks: [
          'Test JWT: none, weak secret, alg confusion, kid injection',
          'Test API keys: predictability, leakage in JS/mobile',
          'Test OAuth: scope escalation, redirect_uri, code interception',
          'Test for credentials in URL params (logged in proxies)',
          'Test rate limiting on login (brute force)',
          'Test refresh token rotation/revocation',
        ],
      },
      {
        name: '3. Authorization Testing (BOLA, BFLA - API1)',
        description: 'Most critical API class. Test every endpoint.',
        tasks: [
          'Set up 2 users at same + different privilege levels',
          'Test every endpoint with another user\'s ID/token (BOLA)',
          'Test admin endpoints as regular user (BFLA)',
          'Test for hidden admin endpoints via parameter fuzzing',
          'Use Autorize or AuthMatrix to scale testing',
        ],
        tools: ['Autorize', 'AuthMatrix'],
      },
      {
        name: '4. Resource Consumption (API4)',
        description: 'DoS, rate limiting, resource exhaustion.',
        tasks: [
          'Test for rate limiting on every endpoint',
          'Test for expensive operations (search, export, batch)',
          'Test GraphQL batching/aliasing for DoS',
          'Test file upload size limits',
          'Test for zip bomb, billion laughs',
        ],
      },
      {
        name: '5. Function-Level Tests',
        description: 'Test all other API categories.',
        tasks: [
          'Mass assignment (API6): add isAdmin, role, balance',
          'Security misconfig (API8): CORS, headers, error messages',
          'Improper inventory (API9): test non-current API versions',
          'Unsafe consumption (API10): third-party API interactions',
        ],
      },
    ],
  },
  {
    id: 'recon',
    name: 'Recon Methodology',
    type: 'recon',
    description: 'Deep recon methodology for bug bounty - asset discovery and attack surface mapping.',
    references: [
      'https://github.com/jhaddix/tbhm',
      'https://reconftw.readthedocs.io/',
    ],
    tags: ['recon', 'osint', 'subdomain', 'enumeration'],
    phases: [
      {
        name: '1. Asset Discovery',
        description: 'Find every internet-facing asset belonging to the target.',
        tasks: [
          'Subdomain enum: subfinder, amass (passive + active), assetfinder',
          'DNS resolution: dnsx, massdns',
          'Live host detection: httpx with tech detection, status code, title',
          'Permutation scan: with shuffledns + wordlist',
          'Recursive subdomain discovery on each new subdomain',
          'TLD expansion: company.*, company-product.*',
        ],
        tools: ['subfinder', 'amass', 'assetfinder', 'dnsx', 'httpx', 'shuffledns'],
      },
      {
        name: '2. URL Collection',
        description: 'Gather every URL ever seen for every host.',
        tasks: [
          'Wayback Machine (waybackurls)',
          'Common Crawl (gau, cc.py)',
          'OTX, VirusTotal',
          'AlienVault OTX',
          'Active crawl: katana, gospider, hakrawler',
          'URL pattern: /*, /api/*, /v1/*, /admin/*',
        ],
        tools: ['waybackurls', 'gau', 'katana', 'gospider'],
      },
      {
        name: '3. Content Discovery',
        description: 'Find hidden files, directories, parameters.',
        tasks: [
          'Directory fuzzing: ffuf, gobuster, dirsearch',
          'File extension fuzz: .php, .json, .bak, .old, .swp',
          'Parameter fuzzing: arjun, paramspider, Param Miner',
          'Virtual host fuzzing: ffuf vhost mode',
          'API endpoint discovery: Kiterunner',
          'S3 bucket discovery: s3scanner, bucket-stream',
        ],
        tools: ['ffuf', 'gobuster', 'arjun', 'kiterunner'],
      },
      {
        name: '4. JavaScript Analysis',
        description: 'Mine JS files for endpoints, secrets, logic.',
        tasks: [
          'Download all JS files (gau + filter)',
          'Extract endpoints: LinkFinder, LinkFinder2, JSParser',
          'Find secrets: SecretFinder, nuclei with exposure templates',
          'Look for AWS keys, API keys, tokens in JS',
          'Check for source maps (.js.map) for full source',
          'Deobfuscate obfuscated JS',
        ],
        tools: ['LinkFinder', 'SecretFinder', 'nuclei'],
      },
      {
        name: '5. Tech Stack & Fingerprinting',
        description: 'Know what you\'re attacking.',
        tasks: [
          'Wappalyzer, Whatweb, httpx -tech-detect',
          'Check response headers (Server, X-Powered-By)',
          'Cookie names (JSESSIONID, PHPSESSID, etc.)',
          'Look for known CVEs in identified versions',
          'Check shodan, censys for the IP',
        ],
      },
    ],
  },
];

export function getMethodologyById(id: string): Methodology | undefined {
  return methodologies.find(m => m.id === id);
}

export function getMethodologiesByType(type: string): Methodology[] {
  return methodologies.filter(m => m.type === type);
}

export function searchMethodologies(query: string): Methodology[] {
  const q = query.toLowerCase();
  return methodologies.filter(m => {
    return (
      m.name.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q)) ||
      m.phases.some(p => p.name.toLowerCase().includes(q) || p.tasks.some(t => t.toLowerCase().includes(q)))
    );
  });
}
