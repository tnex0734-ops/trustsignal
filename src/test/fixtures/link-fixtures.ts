export interface LinkFixture {
  id: string;
  label: string;
  category: "benign" | "suspicious" | "invalid";
  url: string;
  expectedStatus: "analyzed" | "invalid";
  expectedRisk?: "low-signal" | "needs-attention" | "high-risk";
  expectedIndicators?: string[];
  description: string;
}

/**
 * Synthetic link fixtures using reserved example domains and non-routable test IPs.
 * Never add active malicious domains or real user data.
 */
export const LINK_FIXTURES: readonly LinkFixture[] = [
  {
    id: "benign-https",
    label: "Benign example: standard HTTPS page",
    category: "benign",
    url: "https://www.example.com/articles/online-safety-guide",
    expectedStatus: "analyzed",
    expectedRisk: "low-signal",
    expectedIndicators: [],
    description: "Ordinary HTTPS domain with clean path and zero warning rules.",
  },
  {
    id: "benign-official-login",
    label: "Benign example: official brand sign-in domain",
    category: "benign",
    url: "https://accounts.google.com/signin",
    expectedStatus: "analyzed",
    expectedRisk: "low-signal",
    expectedIndicators: ["LINK_AUTH_PATH_NOTICE"],
    description:
      "Official Google subdomain with login path—should not trigger brand impersonation.",
  },
  {
    id: "suspicious-shortener",
    label: "Suspicious example: shortened link",
    category: "suspicious",
    url: "https://bit.ly/3xDemoLink",
    expectedStatus: "analyzed",
    expectedRisk: "needs-attention",
    expectedIndicators: ["LINK_URL_SHORTENER"],
    description: "Shortener hides final destination without visiting the URL.",
  },
  {
    id: "suspicious-insecure-http",
    label: "Suspicious example: unencrypted HTTP",
    category: "suspicious",
    url: "http://portal.example.org/billing",
    expectedStatus: "analyzed",
    expectedRisk: "needs-attention",
    expectedIndicators: ["LINK_INSECURE_HTTP"],
    description: "Unencrypted HTTP connection.",
  },
  {
    id: "suspicious-userinfo",
    label: "High-risk example: embedded credentials before @",
    category: "suspicious",
    url: "https://paypal.com@login-check.example.com/verify-account",
    expectedStatus: "analyzed",
    expectedRisk: "high-risk",
    expectedIndicators: [
      "LINK_USERINFO_CREDENTIALS",
      "LINK_BRAND_LOOKALIKE",
      "LINK_DECEPTIVE_PATH_QUERY",
    ],
    description: "Uses @ user-info authority spoofing combined with brand lookalike.",
  },
  {
    id: "suspicious-ip-login",
    label: "High-risk example: raw IPv4 address + HTTP",
    category: "suspicious",
    url: "http://192.0.2.45/kyc-update",
    expectedStatus: "analyzed",
    expectedRisk: "high-risk",
    expectedIndicators: ["LINK_IP_ADDRESS_HOST", "LINK_INSECURE_HTTP", "LINK_DECEPTIVE_PATH_QUERY"],
    description: "Uses RFC 5737 TEST-NET-1 IP literal instead of a domain name.",
  },
  {
    id: "suspicious-punycode-lookalike",
    label: "High-risk example: Punycode lookalike",
    category: "suspicious",
    url: "https://xn--pypal-4ve.example.com/otp",
    expectedStatus: "analyzed",
    expectedRisk: "high-risk",
    expectedIndicators: ["LINK_PUNYCODE_IDN", "LINK_BRAND_LOOKALIKE", "LINK_DECEPTIVE_PATH_QUERY"],
    description:
      "Valid Punycode encoding of Cyrillic homograph (pаypal) combined with OTP lure path.",
  },
  {
    id: "suspicious-apk-redirect",
    label: "High-risk example: direct APK download + redirect",
    category: "suspicious",
    url: "https://files.example.net/update-reward.apk?redirect=https://evil.example.org",
    expectedStatus: "analyzed",
    expectedRisk: "high-risk",
    expectedIndicators: ["LINK_EXECUTABLE_DOWNLOAD", "LINK_DECEPTIVE_PATH_QUERY"],
    description: "Direct APK installer download paired with open-redirect query parameter.",
  },
  {
    id: "invalid-javascript-scheme",
    label: "Unsafe scheme example: javascript:",
    category: "invalid",
    url: "javascript:alert(1)",
    expectedStatus: "invalid",
    description: "Blocked active script scheme; never opened or executed.",
  },
];
