/**
 * Pre-Flight Push Protection & Secret Scanner.
 * Ported from secure_transfer (secret_scanner.py).
 * Protects users from leaking API keys, cloud tokens, database URIs,
 * and high-entropy credentials into public web pages, forms, or AI chats.
 */

export interface SecretFinding {
  ruleName: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  matchedSnippet: string;
}

export const shannonEntropy = (data: string): number => {
  if (!data) return 0;
  const len = data.length;
  const freq: Record<string, number> = {};
  for (const c of data) {
    freq[c] = (freq[c] || 0) + 1;
  }
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
};

const SECRET_RULES: { rule: string; desc: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'; regex: RegExp }[] = [
  {
    rule: 'AWS_ACCESS_KEY_ID',
    desc: 'AWS Access Key ID',
    severity: 'CRITICAL',
    regex: /\b((?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16})\b/g,
  },
  {
    rule: 'GOOGLE_API_KEY',
    desc: 'Google Cloud / Gemini API Key',
    severity: 'CRITICAL',
    regex: /\b(AIza[0-9A-Za-z\-_]{35})\b/g,
  },
  {
    rule: 'GITHUB_PAT',
    desc: 'GitHub Personal Access Token',
    severity: 'CRITICAL',
    regex: /\b(gh[pousr]_[A-Za-z0-9_]{36,255}|github_pat_[A-Za-z0-9_]{50,})\b/g,
  },
  {
    rule: 'STRIPE_SECRET_KEY',
    desc: 'Stripe Secret or Restricted Key',
    severity: 'CRITICAL',
    regex: /\b((?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{24,})\b/g,
  },
  {
    rule: 'SLACK_TOKEN',
    desc: 'Slack Bot or User Token',
    severity: 'HIGH',
    regex: /\b(xox[baprs]-[0-9a-zA-Z]{10,48})\b/g,
  },
  {
    rule: 'PRIVATE_KEY',
    desc: 'Cryptographic Private Key (RSA / EC / OpenSSH)',
    severity: 'CRITICAL',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  },
  {
    rule: 'DATABASE_CONN_URI',
    desc: 'Database Connection String with Password',
    severity: 'HIGH',
    regex: /\b(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@[^\s]+\b/g,
  },
];

export const scanForSecrets = (text: string): SecretFinding[] => {
  if (!text || text.length < 10) return [];
  const findings: SecretFinding[] = [];

  // 1. Regex rule scanning
  for (const item of SECRET_RULES) {
    const matches = text.match(item.regex);
    if (matches) {
      for (const m of matches) {
        // Redact snippet for safe display
        const visible = m.length > 8 ? `${m.slice(0, 4)}...${m.slice(-4)}` : '****';
        findings.push({
          ruleName: item.rule,
          description: item.desc,
          severity: item.severity,
          matchedSnippet: visible,
        });
      }
    }
  }

  // 2. Shannon Entropy analysis for suspicious high-entropy tokens
  const words = text.split(/[\s,;:'"()]+/);
  for (const word of words) {
    if (word.length >= 28 && !word.includes('/') && !word.includes('.')) {
      const entropy = shannonEntropy(word);
      if (entropy > 4.6) {
        const alreadyFound = findings.some(f => f.matchedSnippet.includes(word.slice(0, 4)));
        if (!alreadyFound) {
          findings.push({
            ruleName: 'HIGH_ENTROPY_CREDENTIAL',
            description: `High-Entropy Secret Token (Entropy: ${entropy.toFixed(2)})`,
            severity: 'HIGH',
            matchedSnippet: `${word.slice(0, 4)}...${word.slice(-4)}`,
          });
        }
      }
    }
  }

  return findings;
};
