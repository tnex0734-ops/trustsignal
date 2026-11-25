export interface CspOptions {
  nonce?: string;
  isDevelopment?: boolean;
}

export interface SecurityHeaderEntry {
  key: string;
  value: string;
}

/**
 * Builds a strict Content-Security-Policy header compatible with Next.js App Router.
 * When a per-request cryptographic nonce is provided, inline scripts require that nonce.
 */
export function buildContentSecurityPolicy(options: CspOptions = {}): string {
  const { nonce, isDevelopment = false } = options;

  const scriptDirectives = ["'self'"];
  if (nonce) {
    scriptDirectives.push(`'nonce-${nonce}'`, "'strict-dynamic'");
  } else if (isDevelopment) {
    scriptDirectives.push("'unsafe-inline'");
  }
  if (isDevelopment) {
    scriptDirectives.push("'unsafe-eval'");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptDirectives.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  return `${directives.join("; ")};`;
}

/**
 * Baseline static security headers applied across all application routes.
 * Explicitly sets X-DNS-Prefetch-Control: off so rendered domains never trigger browser DNS lookups.
 */
export function getStaticSecurityHeaders(): SecurityHeaderEntry[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    {
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    },
  ];
}
