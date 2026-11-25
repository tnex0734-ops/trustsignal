export const MAX_URL_LENGTH = 2048;
export const MAX_MESSAGE_LENGTH = 8000;
export const MAX_PASSWORD_LENGTH = 256;
export const MAX_EMBEDDED_URLS = 10;
export const MAX_EVIDENCE_LENGTH = 96;

export const RISK_THRESHOLDS = {
  needsAttentionMinScore: 25,
  highRiskMinScore: 50,
  criticalFloorScore: 55,
  maxScore: 100,
} as const;

export const KNOWN_URL_SHORTENERS: ReadonlySet<string> = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rb.gy",
  "cutt.ly",
  "shorturl.at",
  "t.ly",
  "tiny.cc",
  "rebrand.ly",
  "lnkd.in",
  "s.id",
  "v.gd",
  "short.io",
  "clk.im",
  "bl.ink",
  "soo.gd",
  "urlz.fr",
]);

export const HIGH_ABUSE_TLDS: ReadonlySet<string> = new Set([
  "zip",
  "mov",
  "top",
  "xyz",
  "click",
  "gq",
  "tk",
  "ml",
  "cf",
  "work",
  "rest",
  "cfd",
  "icu",
  "loan",
  "surf",
]);

export interface BrandPatternEntry {
  brand: string;
  officialRoots: readonly string[];
  lookalikeTokens: readonly string[];
}

export const BRAND_PATTERNS: readonly BrandPatternEntry[] = [
  {
    brand: "PayPal",
    officialRoots: ["paypal.com", "paypal.me"],
    lookalikeTokens: ["paypal", "paypa1", "paypai", "peypal"],
  },
  {
    brand: "Google",
    officialRoots: [
      "google.com",
      "googleapis.com",
      "gmail.com",
      "youtube.com",
      "google.co.in",
      "google.co.uk",
    ],
    lookalikeTokens: ["google", "goog1e", "g00gle", "gmail"],
  },
  {
    brand: "Microsoft",
    officialRoots: [
      "microsoft.com",
      "live.com",
      "outlook.com",
      "office.com",
      "microsoftonline.com",
    ],
    lookalikeTokens: ["microsoft", "micros0ft", "mircosoft", "office365", "outlook"],
  },
  {
    brand: "Apple",
    officialRoots: ["apple.com", "icloud.com"],
    lookalikeTokens: ["apple", "app1e", "icloud"],
  },
  {
    brand: "Amazon",
    officialRoots: ["amazon.com", "amazon.in", "amazon.co.uk", "amazon.de", "amzn.to"],
    lookalikeTokens: ["amazon", "amaz0n", "arnazon"],
  },
  {
    brand: "Netflix",
    officialRoots: ["netflix.com"],
    lookalikeTokens: ["netflix", "netf1ix"],
  },
  {
    brand: "WhatsApp",
    officialRoots: ["whatsapp.com", "wa.me"],
    lookalikeTokens: ["whatsapp", "whatsap"],
  },
  {
    brand: "Instagram",
    officialRoots: ["instagram.com"],
    lookalikeTokens: ["instagram", "1nstagram", "lnstagram"],
  },
  {
    brand: "Facebook / Meta",
    officialRoots: ["facebook.com", "fb.com", "meta.com"],
    lookalikeTokens: ["facebook", "faceb00k"],
  },
  {
    brand: "SBI",
    officialRoots: ["sbi.co.in", "onlinesbi.sbi", "bank.sbi"],
    lookalikeTokens: ["onlinesbi", "sbikyc", "sbiupdate"],
  },
  {
    brand: "HDFC Bank",
    officialRoots: ["hdfcbank.com"],
    lookalikeTokens: ["hdfcbank", "hdfckyc"],
  },
  {
    brand: "ICICI Bank",
    officialRoots: ["icicibank.com"],
    lookalikeTokens: ["icicibank", "icicikyc"],
  },
  {
    brand: "Paytm",
    officialRoots: ["paytm.com"],
    lookalikeTokens: ["paytm"],
  },
  {
    brand: "PhonePe",
    officialRoots: ["phonepe.com"],
    lookalikeTokens: ["phonepe"],
  },
  {
    brand: "DHL",
    officialRoots: ["dhl.com"],
    lookalikeTokens: ["dhl"],
  },
  {
    brand: "FedEx",
    officialRoots: ["fedex.com"],
    lookalikeTokens: ["fedex"],
  },
  {
    brand: "UPS",
    officialRoots: ["ups.com"],
    lookalikeTokens: ["upsdelivery", "upsparcel"],
  },
  {
    brand: "USPS",
    officialRoots: ["usps.com"],
    lookalikeTokens: ["usps"],
  },
  {
    brand: "Coinbase",
    officialRoots: ["coinbase.com"],
    lookalikeTokens: ["coinbase", "co1nbase"],
  },
  {
    brand: "Binance",
    officialRoots: ["binance.com"],
    lookalikeTokens: ["binance", "b1nance"],
  },
];

export const COMMON_ANALYSIS_LIMITATIONS: readonly string[] = [
  "TrustSignal performs local text and structural checks only; it never visits, downloads, or executes submitted links.",
  "A Low signal result means no tested warning patterns matched—it does NOT prove a website, sender, or message is safe or authentic.",
  "TrustSignal does not query live threat intelligence, domain registration age, SSL/TLS certificate status, or whether a real website has been compromised.",
];
