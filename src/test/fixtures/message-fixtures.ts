export interface MessageFixture {
  id: string;
  label: string;
  category: "benign" | "suspicious";
  text: string;
  expectedRisk: "low-signal" | "needs-attention" | "high-risk";
  expectedIndicators: string[];
  description: string;
}

/**
 * Synthetic SMS/email/chat fixtures covering phishing indicators and benign false-positive controls.
 */
export const MESSAGE_FIXTURES: readonly MessageFixture[] = [
  {
    id: "benign-delivery-notice",
    label: "Benign example: normal campus/delivery update",
    category: "benign",
    text: "Hi Maya, your library textbook pickup #4821 is ready at the campus desk until 5:30 PM today.",
    expectedRisk: "low-signal",
    expectedIndicators: [],
    description: "Normal everyday notification with zero scam signals.",
  },
  {
    id: "benign-urgent-deadline",
    label: "Benign control: urgent reminder without scam demand",
    category: "benign",
    text: "Urgent: Today's team lab meeting has moved to Room 204 at 3:00 PM. Please bring your printed notes.",
    expectedRisk: "low-signal",
    expectedIndicators: ["MSG_URGENCY_PRESSURE"],
    description: "Contains 'urgent' alone—must stay low-signal rather than false-alarming.",
  },
  {
    id: "benign-bank-otp-warning",
    label: "Benign control: bank OTP security notice",
    category: "benign",
    text: "Your one-time verification code is 482910. Never share this OTP with anyone, including bank employees.",
    expectedRisk: "low-signal",
    expectedIndicators: [],
    description: "Legitimate OTP notification instructing the user NOT to share the code.",
  },
  {
    id: "suspicious-otp-kyc-link",
    label: "High-risk example: account suspension + OTP + raw IP link",
    category: "suspicious",
    text: "URGENT: Your bank KYC is suspended today. Share your 6-digit OTP immediately and confirm at http://192.0.2.45/kyc-login or your card will be blocked.",
    expectedRisk: "high-risk",
    expectedIndicators: [
      "MSG_OTP_CREDENTIAL_REQUEST",
      "MSG_EMBEDDED_RISKY_LINK",
      "MSG_ACCOUNT_SUSPENSION_THREAT",
      "MSG_URGENCY_PRESSURE",
    ],
    description: "Multi-signal phishing SMS with OTP demand, threat, and raw IP link.",
  },
  {
    id: "suspicious-remote-access",
    label: "High-risk example: IT/support remote access request",
    category: "suspicious",
    text: "This is the bank fraud desk. Please keep this confidential, install AnyDesk QuickSupport, and share the 9-digit support code so we can stop an unauthorized charge.",
    expectedRisk: "high-risk",
    expectedIndicators: ["MSG_REMOTE_ACCESS_REQUEST", "MSG_IMPERSONATION_PRESSURE"],
    description: "Classic remote-access screen-takeover social engineering script.",
  },
  {
    id: "suspicious-prize-apk",
    label: "High-risk example: fake prize + gift card + APK link",
    category: "suspicious",
    text: "Congratulations! You have won a cash reward. Send an Apple gift card fee and install claim-bonus.apk via https://bit.ly/3xDemoPrize within 2 hours.",
    expectedRisk: "high-risk",
    expectedIndicators: [
      "MSG_APK_SIDELOAD_REQUEST",
      "MSG_URGENT_PAYMENT_DEMAND",
      "MSG_FAKE_REWARD_PRIZE",
      "MSG_EMBEDDED_RISKY_LINK",
      "MSG_URGENCY_PRESSURE",
    ],
    description: "Reward scam demanding gift card payment and APK sideloading.",
  },
];

export const UI_MESSAGE_DEMO_PRESETS = MESSAGE_FIXTURES.filter((item) =>
  ["benign-urgent-deadline", "suspicious-otp-kyc-link", "suspicious-remote-access"].includes(
    item.id,
  ),
);
