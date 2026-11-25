import {
  CATALOG_VERSION,
  GuidesResponseSchema,
  type GuidesResponse,
} from "@/lib/validation/schemas";

export interface SafetyGuideData {
  id: string;
  title: string;
  threatCategory: string;
  summary: string;
  warningSigns: string[];
  safeActions: string[];
}

export const SAFETY_GUIDES: readonly SafetyGuideData[] = [
  {
    id: "recognize-phishing",
    title: "How to spot phishing attempts",
    threatCategory: "Phishing & social engineering",
    summary:
      "Phishing messages impersonate trusted organizations and create panic or excitement so you click before checking.",
    warningSigns: [
      "Artificial deadlines such as 'account blocked in 2 hours' or 'final warning'.",
      "Generic greetings paired with urgent requests to verify identity or reset access.",
      "Sender email or phone number does not match the organization's known channel.",
    ],
    safeActions: [
      "Pause before tapping any link or attachment.",
      "Open a new browser tab or official app independently instead of replying.",
      "Verify notices through a phone number from the back of your bank card or official portal.",
    ],
  },
  {
    id: "verify-websites-independently",
    title: "Verify websites independently (and why HTTPS is not proof)",
    threatCategory: "Unsafe & lookalike links",
    summary:
      "The padlock icon (HTTPS) only means data between your browser and that server is encrypted—anyone can obtain a free certificate for a phishing site.",
    warningSigns: [
      "Subtle misspellings, numbers replacing letters (like paypa1), or extra words (brand-verify-login).",
      "URLs containing credentials before @, raw IP addresses, or shortened links in unexpected messages.",
      "Many nested subdomains pushing the true domain off narrow mobile screens.",
    ],
    safeActions: [
      "Read the domain directly before the first single forward slash (/).",
      "Use saved bookmarks or type official addresses manually for banking and email.",
      "Remember that no link checker can confirm whether a real website has been compromised.",
    ],
  },
  {
    id: "protect-otps-and-pins",
    title: "Protect OTPs, PINs, and recovery codes",
    threatCategory: "Credential & financial theft",
    summary:
      "One-time passcodes (OTPs), UPI PINs, and account recovery codes are keys to your accounts and money—legitimate staff never ask you to share them.",
    warningSigns: [
      "A caller or message asks for your OTP to 'cancel' a charge or 'complete verification'.",
      "Someone claims you must enter a UPI PIN or approve a payment request to receive a refund.",
      "Instructions to install AnyDesk, TeamViewer, or an .apk file for 'support'.",
    ],
    safeActions: [
      "Never read out, forward, or enter an OTP when contacted unexpectedly.",
      "You never need to enter a PIN or pay a fee to receive a legitimate refund or prize.",
      "Decline all screen-sharing or APK download requests from unsolicited contacts.",
    ],
  },
  {
    id: "create-strong-passphrases",
    title: "Create stronger, unique passphrases",
    threatCategory: "Weak & reused passwords",
    summary:
      "Short passwords and predictable substitutions (like Password123!) are guessed quickly; long unique passphrases resist offline guessing far better.",
    warningSigns: [
      "Reusing the same password across email, shopping, college, and banking accounts.",
      "Relying on keyboard walks (qwerty), birth years, or single dictionary words with '1!' added.",
      "Keeping important accounts without multi-factor authentication (MFA).",
    ],
    safeActions: [
      "Combine four or more unrelated words into a 16+ character passphrase, or use a password manager.",
      "Use a separate, unique password for email and financial accounts.",
      "Turn on app-based or hardware-key MFA wherever available.",
    ],
  },
  {
    id: "report-suspicious-messages",
    title: "Report suspicious links and scam messages",
    threatCategory: "Community awareness & prevention",
    summary:
      "Reporting phishing SMS, emails, and scam accounts helps providers block repeat campaigns before others fall for them.",
    warningSigns: [
      "Repeat spam texts pretending to be courier deliveries, KYC desks, or tax refunds.",
      "Unverified chat accounts soliciting personal IDs, gift cards, or crypto transfers.",
    ],
    safeActions: [
      "Use your email or messaging app's built-in 'Report spam / phishing' action.",
      "Forward suspicious phishing details to your organization's official security desk if targeted at work or school.",
      "Report financial or cyber fraud promptly via official national cybercrime portals or your bank's fraud line.",
    ],
  },
  {
    id: "respond-after-clicking",
    title: "What to do if you already clicked or shared information",
    threatCategory: "Incident response",
    summary:
      "Acting calmly within the first few minutes limits harm—focus on locking down accounts and contacting verified channels.",
    warningSigns: [
      "You typed a password, OTP, or card number after tapping a link.",
      "You installed an unknown file/APK or granted remote screen control.",
    ],
    safeActions: [
      "If you installed a remote-access app or unknown APK, disconnect the device from Wi-Fi/mobile data and uninstall the app.",
      "Using a clean device or official app, change the affected password (and any account where it was reused) immediately.",
      "Revoke active sessions in account settings and enable multi-factor authentication.",
      "Call your bank or payment provider using the official number on your card or statement if money or card details were exposed.",
    ],
  },
];

export const EMERGENCY_RESPONSE_STEPS: readonly string[] = [
  "Stop replying and close the suspicious tab or chat immediately.",
  "If you shared a password, change it right away from the genuine app or typed official URL—and update any other account using that same password.",
  "If you installed an APK or remote-access tool (like AnyDesk or TeamViewer), turn off Wi-Fi/mobile data, uninstall it, and scan your device.",
  "If you shared card details, UPI authorization, or banking access, call your bank immediately using the official number on the back of your card.",
  "Enable multi-factor authentication (MFA) and check recent sign-in activity / active sessions.",
];

export function buildGuidesPayload(): GuidesResponse {
  return GuidesResponseSchema.parse({
    version: CATALOG_VERSION,
    guides: SAFETY_GUIDES.map((guide) => ({ ...guide })),
    emergencySteps: [...EMERGENCY_RESPONSE_STEPS],
    disclaimer:
      "TrustSignal provides general defensive security education and first-pass heuristic checks; it does not replace emergency services, legal advice, or professional incident response.",
  });
}
