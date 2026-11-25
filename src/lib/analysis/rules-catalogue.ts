import type { RuleDefinition } from "./types";

export const RULE_CATALOGUE: readonly RuleDefinition[] = [
  {
    id: "LINK_USERINFO_CREDENTIALS",
    category: "link",
    title: "Username or credentials embedded before @ in link",
    severity: "critical",
    weight: 45,
    summary: "Detects URLs using an @ symbol in the authority section before the real domain.",
    whyItMatters:
      "Attackers place a familiar brand name before @ (for example, https://bank.example@other-site.example) to disguise the real destination host after @.",
    recommendation:
      "Do not click this link. Visit the organization by typing its official address yourself.",
  },
  {
    id: "LINK_IP_ADDRESS_HOST",
    category: "link",
    title: "Direct IP address instead of a domain name",
    severity: "critical",
    weight: 45,
    summary: "Detects IPv4, IPv6, decimal, hex, or octal numeric IP hosts.",
    whyItMatters:
      "Legitimate consumer services and banks rarely direct users to sign in via raw IP addresses. Attackers use IP hosts to evade domain-name inspection or point to disposable servers.",
    recommendation:
      "Avoid entering passwords or payment information at raw IP links. Use the official app or bookmarked website.",
  },
  {
    id: "LINK_BRAND_LOOKALIKE",
    category: "link",
    title: "Possible lookalike or brand-impersonation domain",
    severity: "critical",
    weight: 45,
    summary:
      "Flags hostnames containing well-known brand names or lookalike spellings when the domain is not the brand's official root.",
    whyItMatters:
      "Phishing links frequently mimic trusted brands using extra words (like brand-verify.example), subdomains, or lookalike numbers and letters.",
    recommendation:
      "Close the link and open the service independently through your saved bookmark or official mobile app.",
  },
  {
    id: "LINK_OBFUSCATED_CHARACTERS",
    category: "link",
    title: "Hidden formatting or bidirectional override characters",
    severity: "critical",
    weight: 45,
    summary: "Detects invisible zero-width or bidirectional text-direction override characters.",
    whyItMatters:
      "Attackers occasionally insert hidden Unicode control characters to reverse displayed characters or hide deceptive text.",
    recommendation:
      "Treat links containing hidden formatting characters as untrusted and verify the destination manually.",
  },
  {
    id: "LINK_EXECUTABLE_DOWNLOAD",
    category: "link",
    title: "Link points directly to an installer or executable file",
    severity: "critical",
    weight: 45,
    summary: "Detects direct paths ending in .apk, .exe, .scr, .msi, .bat, or .vbs.",
    whyItMatters:
      "Scam messages frequently push malicious Android APKs or desktop installers outside official app stores to steal OTPs or control devices.",
    recommendation:
      "Do not download or install apps from links sent in chats or SMS. Use only your device's official app store.",
  },
  {
    id: "LINK_PUNYCODE_IDN",
    category: "link",
    title: "Internationalized (Punycode) or mixed-script domain",
    severity: "warning",
    weight: 30,
    summary: "Detects xn-- Punycode domain labels or mixed-script Unicode hostnames.",
    whyItMatters:
      "While many legitimate international domains use Unicode safely, attackers can substitute visually identical letters from different alphabets (homograph attacks).",
    recommendation:
      "Inspect the Punycode domain carefully and open the service via a trusted bookmark instead of clicking.",
  },
  {
    id: "LINK_URL_SHORTENER",
    category: "link",
    title: "Known link-shortening service hides the real destination",
    severity: "warning",
    weight: 30,
    summary: "Matches hostnames against well-known URL shorteners.",
    whyItMatters:
      "Shortened links hide the actual destination domain until clicked. TrustSignal never follows redirects for your safety.",
    recommendation:
      "Do not follow unexpected shortened links for banking, deliveries, or account alerts. Check directly inside your official account.",
  },
  {
    id: "LINK_INSECURE_HTTP",
    category: "link",
    title: "Unencrypted HTTP connection",
    severity: "warning",
    weight: 25,
    summary: "Flags links using http:// instead of https://.",
    whyItMatters:
      "Traffic over plain HTTP is not encrypted in transit. Note that HTTPS alone only encrypts transit and does not guarantee a site is trustworthy.",
    recommendation:
      "Never enter passwords, OTPs, or payment details on an unencrypted http:// page.",
  },
  {
    id: "LINK_EXCESSIVE_SUBDOMAINS",
    category: "link",
    title: "Deeply nested subdomain structure",
    severity: "warning",
    weight: 20,
    summary: "Flags links with four or more domain labels before the path.",
    whyItMatters:
      "Extra subdomains push the true registrable domain off narrow mobile address bars, making an attacker's domain appear to belong to a trusted service.",
    recommendation:
      "Read the domain right before the first single slash (/) to verify who actually controls the website.",
  },
  {
    id: "LINK_SUSPICIOUS_HOST_PATTERN",
    category: "link",
    title: "Deceptive domain wording, unusual port, or high-risk host structure",
    severity: "warning",
    weight: 20,
    summary:
      "Detects account/verification lure keywords in subdomains, excessive hyphens, long hostnames, non-standard ports, or high-abuse TLDs combined with lure wording.",
    whyItMatters:
      "Disposable scam domains often combine security words (like secure-verify-login) with non-standard ports or freshly registered domains.",
    recommendation:
      "Verify the organization independently before trusting login or verification links.",
  },
  {
    id: "LINK_DECEPTIVE_PATH_QUERY",
    category: "link",
    title: "Sensitive verification, reward, or open-redirect pattern in link path",
    severity: "warning",
    weight: 20,
    summary:
      "Detects open-redirect URL parameters (such as ?redirect=http) or urgent KYC/OTP/prize lure paths.",
    whyItMatters:
      "Phishing campaigns frequently embed redirect chains or urgent verification paths to lead users onto credential-harvesting pages.",
    recommendation:
      "Navigate to account verification or reward pages directly from the official site rather than following deep parameters.",
  },
  {
    id: "LINK_AUTH_PATH_NOTICE",
    category: "link",
    title: "Link leads to a login or account path",
    severity: "info",
    weight: 5,
    summary: "Informational notice when a normal link path references sign-in or account pages.",
    whyItMatters:
      "Even ordinary login links deserve a moment to confirm the address bar domain before entering credentials.",
    recommendation:
      "Confirm the exact domain name and use a password manager or bookmark when signing in.",
  },
  {
    id: "LINK_ASSUMED_SCHEME",
    category: "link",
    title: "Missing http:// or https:// prefix",
    severity: "info",
    weight: 5,
    summary: "Informational note when a domain-like input omitted its protocol scheme.",
    whyItMatters:
      "Without the original protocol prefix, it is not visible whether the sender used encrypted HTTPS or plain HTTP.",
    recommendation:
      "Check the full URL carefully without opening it directly if the source is unfamiliar.",
  },
  {
    id: "MSG_OTP_CREDENTIAL_REQUEST",
    category: "message",
    title: "Requests a one-time passcode (OTP), PIN, or password",
    severity: "critical",
    weight: 50,
    summary:
      "Detects language asking you to share, send, reply with, or verify an OTP, PIN, CVV, password, or recovery code.",
    whyItMatters:
      "Legitimate banks, couriers, and support staff never ask you to read back or enter your OTP or password to cancel a transaction or verify identity.",
    recommendation:
      "Stop immediately and never share OTPs, PINs, passwords, or recovery codes with anyone.",
  },
  {
    id: "MSG_REMOTE_ACCESS_REQUEST",
    category: "message",
    title: "Asks to install a remote-access or screen-sharing app",
    severity: "critical",
    weight: 50,
    summary:
      "Detects prompts to use AnyDesk, TeamViewer, QuickSupport, RustDesk, or share remote control codes.",
    whyItMatters:
      "Scammers use remote-access tools to view OTP notifications on your screen and initiate bank or UPI transfers directly from your device.",
    recommendation:
      "Never install remote-access apps or share screen codes on request from unsolicited callers or messages.",
  },
  {
    id: "MSG_APK_SIDELOAD_REQUEST",
    category: "message",
    title: "Urges installing an APK or app outside official stores",
    severity: "critical",
    weight: 50,
    summary: "Detects requests to download .apk files or enable installation from unknown sources.",
    whyItMatters:
      "Sideloaded APK files often contain spyware that reads SMS OTPs and banking credentials without authorization.",
    recommendation: "Do not download or install APK files sent over messaging apps or SMS.",
  },
  {
    id: "MSG_URGENT_PAYMENT_DEMAND",
    category: "message",
    title: "Pressures for immediate payment, gift cards, crypto, or UPI approval",
    severity: "warning",
    weight: 35,
    summary:
      "Detects gift-card demands, crypto transfers, customs/penalty fee requests, or entering a UPI PIN to receive money.",
    whyItMatters:
      "Legitimate refunds never require you to pay a fee or enter a UPI PIN, and genuine government or utility notices do not demand gift cards or crypto.",
    recommendation:
      "Pause all payment. Verify any bill or delivery charge independently via the official portal.",
  },
  {
    id: "MSG_SENSITIVE_PII_REQUEST",
    category: "message",
    title: "Requests sensitive personal or financial information",
    severity: "warning",
    weight: 30,
    summary:
      "Detects requests for card numbers, CVV, bank details, Aadhaar, PAN, SSN, or passport information.",
    whyItMatters:
      "Sharing identity numbers or card details over chat, SMS, or unfamiliar forms enables identity theft and unauthorized charges.",
    recommendation: "Never reply with sensitive IDs or financial details to unsolicited messages.",
  },
  {
    id: "MSG_ACCOUNT_SUSPENSION_THREAT",
    category: "message",
    title: "Threatens account suspension, KYC block, or legal action",
    severity: "warning",
    weight: 25,
    summary:
      "Detects pressure tactics claiming an account, SIM, card, or KYC status will be blocked or penalized.",
    whyItMatters:
      "Fear of sudden account loss pushes people to click or comply before verifying with the real institution.",
    recommendation:
      "Open the official app or call the number printed on the back of your bank card instead of reacting to the message.",
  },
  {
    id: "MSG_FAKE_REWARD_PRIZE",
    category: "message",
    title: "Unsolicited prize, lottery, refund, or giveaway claim",
    severity: "warning",
    weight: 25,
    summary:
      "Detects claims of unexpected cash prizes, lottery wins, or rewards requiring urgent confirmation.",
    whyItMatters:
      "Unexpected prize claims are frequently used to lure people into paying processing fees or entering credentials.",
    recommendation:
      "Be skeptical of unexpected rewards; never pay fees or enter personal details to claim a surprise prize.",
  },
  {
    id: "MSG_IMPERSONATION_PRESSURE",
    category: "message",
    title: "Claims authority or official support with secrecy or fear pressure",
    severity: "warning",
    weight: 20,
    summary:
      "Detects claimed bank security, courier/customs, tax/police authority, or executive urgency paired with compliance pressure.",
    whyItMatters:
      "Scammers impersonate trusted institutions and insist on secrecy or speed so victims do not double-check with family or official support.",
    recommendation:
      "Verify the person's identity through an independent, official phone number or portal.",
  },
  {
    id: "MSG_OBFUSCATED_TEXT",
    category: "message",
    title: "Invisible formatting or text-direction characters detected",
    severity: "warning",
    weight: 25,
    summary:
      "Detects hidden zero-width spaces or bidirectional override characters inside message text.",
    whyItMatters:
      "Hidden Unicode characters can disguise scam phrases or reverse displayed filenames and links.",
    recommendation:
      "Treat artificially obfuscated messages with extra caution and verify independently.",
  },
  {
    id: "MSG_EMBEDDED_RISKY_LINK",
    category: "message",
    title: "Message contains one or more links with risk signals",
    severity: "warning",
    weight: 25,
    summary:
      "Extracts links inside the message locally and inspects them with the URL analyzer without opening them.",
    whyItMatters:
      "Phishing messages often pair urgent text with deceptive, shortened, or unsafe URLs.",
    recommendation: "Do not tap the embedded link. Check the official app or website directly.",
  },
  {
    id: "MSG_EMBEDDED_LINK_INFO",
    category: "message",
    title: "Message contains an embedded link",
    severity: "info",
    weight: 5,
    summary:
      "Notes that a link appears in the message without structural warnings on the link itself.",
    whyItMatters: "Even structurally normal links can point to newly created or compromised sites.",
    recommendation:
      "If the message was unexpected, open the organization's website manually instead of tapping the link.",
  },
  {
    id: "MSG_URGENCY_PRESSURE",
    category: "message",
    title: "Urgent time pressure wording",
    severity: "info",
    weight: 10,
    summary:
      "Detects deadline or urgency wording (alone, urgency is informational and does not mark a message high risk).",
    whyItMatters:
      "Urgency appears in genuine reminders too, but scammers combine urgency with credential, link, or payment demands to rush decisions.",
    recommendation: "Take a brief pause to verify the context before acting on urgent requests.",
  },
  {
    id: "PWD_LOCAL_Z_ESTIMATOR",
    category: "password",
    title: "Local offline password strength & pattern estimation",
    severity: "info",
    weight: 0,
    summary:
      "Runs entirely inside the browser via @zxcvbn-ts to identify short length, keyboard walks, repeats, and dictionary patterns.",
    whyItMatters:
      "Predictable patterns and short passwords can be guessed rapidly by automated tools, while long unique passphrases resist offline guessing.",
    recommendation:
      "Use a unique passphrase of four or more unrelated words (16+ characters) per account and enable multi-factor authentication.",
  },
];

const RULE_BY_ID = new Map<string, RuleDefinition>(RULE_CATALOGUE.map((rule) => [rule.id, rule]));

export function getRuleDefinition(id: string): RuleDefinition {
  const found = RULE_BY_ID.get(id);
  if (!found) {
    throw new Error(`Unknown TrustSignal rule id: ${id}`);
  }
  return found;
}
