/**
 * Knowledge base: Common web vulnerabilities
 * Each entry contains type, description, detection patterns, severity, and references
 */

export interface Vulnerability {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cwe?: string;
  owasp?: string;
  description: string;
  detection: string[];
  impact: string;
  remediation: string;
  references: string[];
  tags: string[];
}

export const vulnerabilities: Vulnerability[] = [
  {
    id: 'sqli',
    name: 'SQL Injection',
    category: 'injection',
    severity: 'critical',
    cwe: 'CWE-89',
    owasp: 'A03:2021',
    description: 'SQL injection occurs when untrusted data is concatenated into SQL queries, allowing attackers to manipulate the query logic.',
    detection: [
      'Single quote (\') in input fields causes database error',
      'Boolean-based: OR 1=1, AND 1=2',
      'Time-based: SLEEP(5), WAITFOR DELAY',
      'Union-based: UNION SELECT ...',
      'Error-based: EXTRACTVALUE, UPDATEXML',
    ],
    impact: 'Full database compromise, authentication bypass, data exfiltration, RCE in some DBs',
    remediation: 'Use parameterized queries / prepared statements. Use ORMs. Input validation as secondary defense.',
    references: [
      'https://owasp.org/www-community/attacks/SQL_Injection',
      'https://portswigger.net/web-security/sql-injection',
      'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
    ],
    tags: ['sqli', 'sql', 'injection', 'database', 'mysql', 'postgresql', 'mssql'],
  },
  {
    id: 'xss-reflected',
    name: 'Reflected XSS',
    category: 'xss',
    severity: 'high',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    description: 'Attacker payload is reflected off the web server in the response. Requires victim to click a malicious link.',
    detection: [
      'Input reflected in HTML without encoding',
      'Test: <script>alert(1)</script>',
      'Event handlers: <img src=x onerror=alert(1)>',
      'SVG: <svg onload=alert(1)>',
    ],
    impact: 'Session hijacking, credential theft, defacement, phishing, malware delivery',
    remediation: 'Context-aware output encoding. Use frameworks that auto-escape (React, Vue). CSP headers.',
    references: [
      'https://owasp.org/www-community/attacks/xss/',
      'https://portswigger.net/web-security/cross-site-scripting',
    ],
    tags: ['xss', 'reflected', 'javascript', 'html'],
  },
  {
    id: 'xss-stored',
    name: 'Stored XSS (Persistent)',
    category: 'xss',
    severity: 'critical',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    description: 'Malicious payload is stored on the server (DB, file system) and served to all users who view the affected page.',
    detection: [
      'Submit payload in forms, comments, profiles, file uploads',
      'Check if payload renders when other users view the content',
      'Common in: user profiles, comments, product reviews, support tickets',
    ],
    impact: 'Mass account compromise, worm-like propagation, admin account takeover',
    remediation: 'Sanitize input on storage AND output. Use allowlist HTML sanitizers (DOMPurify).',
    references: [
      'https://owasp.org/www-community/attacks/xss/',
      'https://portswigger.net/web-security/cross-site-scripting/stored',
    ],
    tags: ['xss', 'stored', 'persistent', 'javascript'],
  },
  {
    id: 'ssrf',
    name: 'Server-Side Request Forgery (SSRF)',
    category: 'ssrf',
    severity: 'high',
    cwe: 'CWE-918',
    owasp: 'A10:2021',
    description: 'Server fetches a remote resource based on user-supplied URL, allowing access to internal services.',
    detection: [
      'Test URL parameters that fetch resources: ?url=, ?img=, ?proxy=',
      'Internal IPs: 127.0.0.1, 169.254.169.254 (cloud metadata), 10.0.0.0/8, 192.168.0.0/16',
      'Bypass filters: @, #, 0x7f000001, decimal IP, IPv6, DNS rebinding',
      'Schemes: file://, gopher://, dict://, ftp://',
    ],
    impact: 'Internal port scanning, cloud metadata theft (AWS keys), RCE via internal services, file read',
    remediation: 'Allowlist of domains/IPs. Disable HTTP redirects. Network segmentation. Block private IP ranges.',
    references: [
      'https://owasp.org/www-community/attacks/Server_Side_Request_Forgery',
      'https://portswigger.net/web-security/ssrf',
      'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html',
    ],
    tags: ['ssrf', 'request', 'internal', 'aws', 'cloud', 'metadata'],
  },
  {
    id: 'idor',
    name: 'Insecure Direct Object Reference (IDOR)',
    category: 'access-control',
    severity: 'high',
    cwe: 'CWE-639',
    owasp: 'A01:2021',
    description: 'Application exposes internal object IDs (DB keys, file paths) without proper authorization checks.',
    detection: [
      'Change numeric IDs in URLs: /api/user/123 -> /api/user/124',
      'UUIDs may also be guessable or leaked in other endpoints',
      'Test with two accounts: Account A tries to access Account B resources',
      'Check API endpoints, mobile API calls',
    ],
    impact: 'Unauthorized access to other users data, mass data enumeration, account takeover',
    remediation: 'Use indirect reference maps. Always check authorization server-side, not just authentication.',
    references: [
      'https://portswigger.net/web-security/access-control/idor',
      'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
    ],
    tags: ['idor', 'access-control', 'authorization', 'broken-access-control'],
  },
  {
    id: 'rce',
    name: 'Remote Code Execution (RCE)',
    category: 'injection',
    severity: 'critical',
    cwe: 'CWE-78',
    owasp: 'A03:2021',
    description: 'Attacker can execute arbitrary commands/code on the server.',
    detection: [
      'Command injection: ; | && $() backticks',
      'Test inputs: ;id, |id, $(id), `id`',
      'Time-based: ;sleep 5, |ping -c 5 127.0.0.1',
      'Deserialization: Java, PHP, Python, .NET',
      'File upload leading to webshell',
      'SSTI: {{7*7}}, ${7*7}, <%= 7*7 %>',
    ],
    impact: 'Full server compromise, lateral movement, data theft, ransomware',
    remediation: 'Never pass user input to exec/system(). Use safe APIs. Sandbox untrusted code.',
    references: [
      'https://owasp.org/www-community/attacks/Command_Injection',
      'https://portswigger.net/web-security/os-command-injection',
    ],
    tags: ['rce', 'command-injection', 'deserialization', 'ssti'],
  },
  {
    id: 'lfi',
    name: 'Local File Inclusion (LFI)',
    category: 'file-inclusion',
    severity: 'high',
    cwe: 'CWE-22',
    owasp: 'A01:2021',
    description: 'Attacker can include local files on the server through vulnerable file path parameters.',
    detection: [
      'Path traversal: ../../etc/passwd',
      'Null byte: ../../etc/passwd%00 (older PHP)',
      'PHP wrappers: php://filter/convert.base64-encode/resource=index.php',
      'Log poisoning: inject into access.log, then include it',
      '/proc/self/environ for env vars',
    ],
    impact: 'Source code disclosure, credentials, RCE via log poisoning or wrappers',
    remediation: 'Allowlist of files. Avoid user-controlled paths. Use chroot/sandbox.',
    references: [
      'https://portswigger.net/web-security/file-path-traversal',
      'https://owasp.org/www-community/attacks/Path_Traversal',
    ],
    tags: ['lfi', 'path-traversal', 'file-inclusion', 'rfi'],
  },
  {
    id: 'auth-bypass',
    name: 'Authentication Bypass',
    category: 'authentication',
    severity: 'critical',
    cwe: 'CWE-287',
    owasp: 'A07:2021',
    description: 'Attacker can bypass authentication mechanisms to gain unauthorized access.',
    detection: [
      'SQLi in login: admin\' --',
      'Force browsing: /admin/, /dashboard/',
      'JWT manipulation: none algorithm, weak secret',
      'Default credentials: admin/admin',
      'Password reset token predictability',
      'OAuth flow manipulation',
    ],
    impact: 'Full account takeover, admin access, data breach',
    remediation: 'Strong auth libraries. MFA. Rate limiting. Secure session management.',
    references: [
      'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
    ],
    tags: ['auth-bypass', 'authentication', 'jwt', 'oauth', 'login'],
  },
  {
    id: 'xxe',
    name: 'XML External Entity (XXE)',
    category: 'injection',
    severity: 'high',
    cwe: 'CWE-611',
    owasp: 'A05:2021',
    description: 'XML parser processes external entities defined in user-supplied XML, leading to file read or SSRF.',
    detection: [
      'Submit XML payload with <!ENTITY xxe SYSTEM "file:///etc/passwd">',
      'Check if file content is reflected',
      'Test in: SOAP, REST XML APIs, SVG uploads, docx/xlsx parsing',
    ],
    impact: 'File disclosure, SSRF, DoS (billion laughs), RCE in some cases',
    remediation: 'Disable external entity processing in XML parsers. Use JSON instead of XML where possible.',
    references: [
      'https://portswigger.net/web-security/xxe',
      'https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html',
    ],
    tags: ['xxe', 'xml', 'injection', 'file-read', 'ssrf'],
  },
  {
    id: 'ssti',
    name: 'Server-Side Template Injection (SSTI)',
    category: 'injection',
    severity: 'critical',
    cwe: 'CWE-1336',
    owasp: 'A03:2021',
    description: 'User input is embedded in a server-side template and rendered, allowing code execution.',
    detection: [
      'Jinja2/Twig: {{7*7}}, {{config}}',
      'Freemarker: ${7*7}, <#assign a="freemarker.template.utility.Execute"?new()>',
      'ERB: <%= 7*7 %>',
      'Smarty: {php}system(\'id\'){/php}',
      'Velocity: #set($x=7*7)$x',
    ],
    impact: 'Full RCE, file read, credential theft',
    remediation: 'Never allow user input in templates. Use logic-less templates (Mustache). Sandbox if needed.',
    references: [
      'https://portswigger.net/research/server-side-template-injection',
    ],
    tags: ['ssti', 'template', 'rce', 'jinja2', 'twig', 'freemarker'],
  },
  {
    id: 'csrf',
    name: 'Cross-Site Request Forgery (CSRF)',
    category: 'csrf',
    severity: 'medium',
    cwe: 'CWE-352',
    owasp: 'A01:2021',
    description: 'Attacker tricks authenticated user into submitting a state-changing request to a web app.',
    detection: [
      'Check for CSRF token in forms',
      'Check SameSite cookie attribute',
      'Test if Referer/Origin header is validated',
      'Try removing CSRF token, see if request succeeds',
    ],
    impact: 'Unauthorized actions performed on behalf of user (transfer funds, change password, etc.)',
    remediation: 'Anti-CSRF tokens (synchronizer pattern). SameSite=Strict cookies. Check Origin/Referer.',
    references: [
      'https://portswigger.net/web-security/csrf',
      'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
    ],
    tags: ['csrf', 'request-forgery', 'session'],
  },
  {
    id: 'open-redirect',
    name: 'Open Redirect',
    category: 'redirect',
    severity: 'low',
    cwe: 'CWE-601',
    description: 'Application redirects to a URL specified by user input without validation.',
    detection: [
      'Test redirect parameters: ?url=, ?next=, ?redirect=, ?return=',
      'Try: //evil.com, /\\evil.com, https://evil.com',
      'Test in login flows (post-auth redirect)',
    ],
    impact: 'Phishing, OAuth token theft, reputation damage',
    remediation: 'Allowlist of redirect URLs. Avoid user-controlled redirects. Use indirect references.',
    references: [
      'https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html',
    ],
    tags: ['redirect', 'open-redirect', 'phishing', 'oauth'],
  },
  {
    id: 'subdomain-takeover',
    name: 'Subdomain Takeover',
    category: 'infrastructure',
    severity: 'high',
    description: 'A subdomain points to an unclaimed third-party service (GitHub Pages, AWS S3, Heroku, etc.) allowing attacker to claim it.',
    detection: [
      'Subdomain enumeration: subfinder, amass, assetfinder',
      'Check DNS records: CNAME, NS',
      'Fingerprint service: HTTP headers, error pages, SSL cert',
      'Common services: GitHub Pages, AWS S3, Heroku, Azure, Pantheon, Tumblr, WordPress.com',
    ],
    impact: 'Cookie theft (if scoped to subdomain), phishing, reputation damage, session hijacking',
    remediation: 'Remove dangling DNS records. Monitor subdomains continuously.',
    references: [
      'https://github.com/EdOverflow/can-i-take-over-xyz',
    ],
    tags: ['subdomain-takeover', 'dns', 'infrastructure', 'recon'],
  },
  {
    id: 'cors-misconfig',
    name: 'CORS Misconfiguration',
    category: 'misconfig',
    severity: 'medium',
    cwe: 'CWE-942',
    description: 'Access-Control-Allow-Origin header is set to * or reflects arbitrary origin with credentials.',
    detection: [
      'Send Origin: https://evil.com header',
      'Check if Access-Control-Allow-Origin reflects it',
      'Check Access-Control-Allow-Credentials: true',
      'Test with XSS on a subdomain if reflection is possible',
    ],
    impact: 'Cross-origin data theft, especially when combined with null origin or XSS',
    remediation: 'Allowlist specific origins. Never reflect Origin header with credentials enabled.',
    references: [
      'https://portswigger.net/web-security/cors',
    ],
    tags: ['cors', 'misconfig', 'cross-origin', 'cors-bypass'],
  },
  {
    id: 'race-condition',
    name: 'Race Condition (TOCTOU)',
    category: 'logic',
    severity: 'high',
    cwe: 'CWE-362',
    description: 'Application checks a condition, then acts on it, but the state changes between check and use.',
    detection: [
      'Limit bypasses: send 100 simultaneous requests to redeem a coupon',
      'Double-spend: transfer funds twice at same time',
      'Vote/like multiple times',
      'Use Turbo Intruder or custom parallel requests',
    ],
    impact: 'Financial loss, abuse of limited resources, double-spending',
    remediation: 'Use atomic operations. Database transactions with proper isolation. Locks (mutex/semaphore).',
    references: [
      'https://portswigger.net/research/smashing-the-state-machine',
      'https://owasp.org/www-community/vulnerabilities/TOCTOU_Race_Condition',
    ],
    tags: ['race-condition', 'toctou', 'logic', 'concurrency'],
  },
  {
    id: 'prototype-pollution',
    name: 'Prototype Pollution',
    category: 'injection',
    severity: 'high',
    cwe: 'CWE-1321',
    description: 'Attacker can modify Object.prototype through unsafe recursive merge, leading to DoS, XSS, or RCE.',
    detection: [
      'Send JSON: {"__proto__": {"isAdmin": true}}',
      'Check if polluting constructor.prototype',
      'Test in: lodash merge, jQuery extend, Node.js merge',
    ],
    impact: 'XSS (via polluted DOM), authentication bypass, RCE in some frameworks',
    remediation: 'Use Object.create(null). Avoid recursive merge on untrusted input. Use Map.',
    references: [
      'https://portswigger.net/web-security/prototype-pollution',
    ],
    tags: ['prototype-pollution', 'javascript', 'nodejs', 'merge'],
  },
  {
    id: 'jwt-attack',
    name: 'JWT Attack',
    category: 'authentication',
    severity: 'critical',
    cwe: 'CWE-347',
    description: 'JSON Web Token implementation flaws allow authentication bypass.',
    detection: [
      'None algorithm: change alg to "none", remove signature',
      'Algorithm confusion: RS256 to HS256, use public key as secret',
      'Weak secret: crack HS256 with jwt_tool, hashcat',
      'kid injection: kid="../../dev/null" or SQLi in kid',
      'jku/x5u header pointing to attacker key',
    ],
    impact: 'Authentication bypass, account takeover, privilege escalation',
    remediation: 'Validate algorithm. Use strong secrets. Verify all JWT claims. Use well-maintained libraries.',
    references: [
      'https://portswigger.net/web-security/jwt',
      'https://github.com/ticarpi/jwt_tool',
    ],
    tags: ['jwt', 'authentication', 'token', 'bypass'],
  },
  {
    id: 'graphql',
    name: 'GraphQL Misconfiguration',
    category: 'misconfig',
    severity: 'high',
    description: 'GraphQL endpoints expose excessive data, lack rate limiting, or allow introspection in production.',
    detection: [
      'Introspection query: {__schema{types{name}}}',
      'Check for batching attacks',
      'Test deep queries for DoS',
      'Look for hidden fields: isAdmin, password, internalId',
      'IDOR via GraphQL IDs',
    ],
    impact: 'Data disclosure, DoS, authentication bypass',
    remediation: 'Disable introspection in production. Implement query depth/complexity limits. Field-level authz.',
    references: [
      'https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html',
    ],
    tags: ['graphql', 'api', 'misconfig', 'introspection'],
  },
  {
    id: 'cache-poisoning',
    name: 'Web Cache Poisoning',
    category: 'cache',
    severity: 'high',
    cwe: 'CWE-444',
    description: 'Attacker manipulates cache to serve malicious content to other users via unkeyed inputs.',
    detection: [
      'Find unkeyed headers: X-Forwarded-Host, X-Original-URL, X-Host',
      'Test query strings not in cache key',
      'Use Param Miner to fuzz',
      'Look for reflected content in cache',
    ],
    impact: 'XSS to all users, account takeover, defacement',
    remediation: 'Include all security-relevant inputs in cache key. Validate host headers. Strip unkeyed inputs.',
    references: [
      'https://portswigger.net/research/practical-web-cache-poisoning',
    ],
    tags: ['cache-poisoning', 'cache', 'headers', 'xss'],
  },
  {
    id: 'http-smuggling',
    name: 'HTTP Request Smuggling',
    category: 'http',
    severity: 'high',
    cwe: 'CWE-444',
    description: 'Disagreement between front-end and back-end on request boundaries allows smuggling hidden requests.',
    detection: [
      'CL.TE: front-end uses Content-Length, back-end uses Transfer-Encoding',
      'TE.CL: opposite',
      'H2.CL: downgraded CL in HTTP/2',
      'Use HTTP Request Smuggler Burp extension',
    ],
    impact: 'Session hijacking, cache poisoning, request routing bypass, RCE',
    remediation: 'Normalize requests. Reject ambiguous requests. Use HTTP/2 end-to-end.',
    references: [
      'https://portswigger.net/web-security/request-smuggling',
    ],
    tags: ['smuggling', 'http', 'cl-te', 'te-cl', 'h2'],
  },
  {
    id: 'mass-assignment',
    name: 'Mass Assignment',
    category: 'misconfig',
    severity: 'high',
    cwe: 'CWE-915',
    description: 'Framework auto-binds user input to model fields, allowing modification of sensitive fields like isAdmin.',
    detection: [
      'Add extra fields to JSON body: {"isAdmin":true,"role":"admin"}',
      'Check if framework (Rails, Laravel, Spring) auto-binds',
      'Look for hidden fields in API responses and add them to requests',
    ],
    impact: 'Privilege escalation, authentication bypass, data tampering',
    remediation: 'Allowlist of bindable fields. Use DTOs. Disable mass assignment for sensitive models.',
    references: [
      'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html',
    ],
    tags: ['mass-assignment', 'api', 'rails', 'laravel', 'privilege-escalation'],
  },
  {
    id: 'file-upload',
    name: 'Unsafe File Upload',
    category: 'file-upload',
    severity: 'high',
    cwe: 'CWE-434',
    description: 'File upload allows executable files (webshells, scripts) leading to RCE.',
    detection: [
      'Upload .php, .jsp, .aspx with image MIME',
      'Double extension: shell.php.jpg',
      'Null byte (old IIS): shell.php%00.jpg',
      '.htaccess upload for Apache',
      'Polyglot files (valid image + PHP)',
      'SVG with embedded JS (XSS)',
    ],
    impact: 'Remote code execution, XSS, defacement, malware hosting',
    remediation: 'Allowlist of extensions. Store outside webroot. Rename files. Validate content type. No execution on upload dir.',
    references: [
      'https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload',
    ],
    tags: ['file-upload', 'rce', 'webshell', 'bypass'],
  },
  {
    id: 'ssrf-aws',
    name: 'SSRF - AWS Metadata Exploitation',
    category: 'ssrf',
    severity: 'critical',
    description: 'SSRF that can reach the AWS instance metadata service at 169.254.169.254 to steal IAM credentials.',
    detection: [
      'Request: http://169.254.169.254/latest/meta-data/',
      'IAM creds: /latest/meta-data/iam/security-credentials/<role-name>',
      'User data: /latest/user-data',
      'IMDSv2 required token first',
    ],
    impact: 'AWS account compromise, access to S3, EC2, RDS, etc.',
    remediation: 'IMDSv2 (mandatory). Block metadata IP via firewall. SSRF protections.',
    references: [
      'https://aws.amazon.com/blogs/security/defense-in-depth-open-firewalls-reverse-proxies-ssrf-vulnerabilities-ec2-instance-metadata-service/',
    ],
    tags: ['ssrf', 'aws', 'metadata', 'cloud', 'iam'],
  },
];

export function searchVulnerabilities(query: string): Vulnerability[] {
  const q = query.toLowerCase();
  return vulnerabilities.filter(v => {
    return (
      v.name.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.tags.some(t => t.toLowerCase().includes(q)) ||
      (v.cwe && v.cwe.toLowerCase().includes(q)) ||
      (v.owasp && v.owasp.toLowerCase().includes(q))
    );
  });
}

export function getVulnerabilityById(id: string): Vulnerability | undefined {
  return vulnerabilities.find(v => v.id === id);
}
