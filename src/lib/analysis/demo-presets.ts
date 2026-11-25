export interface DemoLinkPreset {
  id: string;
  label: string;
  url: string;
}

export interface DemoMessagePreset {
  id: string;
  label: string;
  text: string;
}

export interface DemoPasswordPreset {
  id: string;
  label: string;
  /** Synthetic demonstration string only. Never use on real accounts. */
  sample: string;
}

export const DEMO_LINK_PRESETS: readonly DemoLinkPreset[] = [
  {
    id: "benign-https",
    label: "Benign example: standard HTTPS page",
    url: "https://www.example.com/articles/online-safety-guide",
  },
  {
    id: "suspicious-shortener",
    label: "Suspicious example: shortened link",
    url: "https://bit.ly/3xDemoLink",
  },
  {
    id: "suspicious-userinfo",
    label: "High-risk example: embedded credentials before @",
    url: "https://paypal.com@login-check.example.com/verify-account",
  },
  {
    id: "invalid-javascript-scheme",
    label: "Unsafe scheme example: javascript:",
    url: "javascript:alert(1)",
  },
];

export const DEMO_MESSAGE_PRESETS: readonly DemoMessagePreset[] = [
  {
    id: "benign-urgent-deadline",
    label: "Benign control: urgent reminder without scam demand",
    text: "Urgent: Today's team lab meeting has moved to Room 204 at 3:00 PM. Please bring your printed notes.",
  },
  {
    id: "suspicious-otp-kyc-link",
    label: "High-risk example: account suspension + OTP + raw IP link",
    text: "URGENT: Your bank KYC is suspended today. Share your 6-digit OTP immediately and confirm at http://192.0.2.45/kyc-login or your card will be blocked.",
  },
  {
    id: "suspicious-remote-access",
    label: "High-risk example: IT/support remote access request",
    text: "This is the bank fraud desk. Please keep this confidential, install AnyDesk QuickSupport, and share the 9-digit support code so we can stop an unauthorized charge.",
  },
];

export const DEMO_PASSWORD_PRESETS: readonly DemoPasswordPreset[] = [
  {
    id: "keyboard-walk",
    label: "Test sample: keyboard sequence",
    sample: "qwertyuiop123",
  },
  {
    id: "strong-passphrase",
    label: "Test sample: long random passphrase",
    sample: "cobalt-lantern-bicycle-meadow-84",
  },
];
