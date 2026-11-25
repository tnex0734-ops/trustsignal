export interface PasswordTestFixture {
  id: string;
  label: string;
  /** Synthetic test-only value. Never use real personal passwords. */
  sample: string;
  expectedMaxScore?: 0 | 1 | 2 | 3 | 4;
  expectedMinScore?: 0 | 1 | 2 | 3 | 4;
  description: string;
}

/**
 * Synthetic password samples for automated tests and local demonstrations only.
 * Never reuse any sample password on a real account.
 */
export const PASSWORD_FIXTURES: readonly PasswordTestFixture[] = [
  {
    id: "short-common",
    label: "Test sample: short common pattern",
    sample: "pass123",
    expectedMaxScore: 1,
    description: "Very short dictionary word plus simple digits.",
  },
  {
    id: "keyboard-walk",
    label: "Test sample: keyboard sequence",
    sample: "qwertyuiop123",
    expectedMaxScore: 1,
    description: "Predictable QWERTY keyboard row sequence.",
  },
  {
    id: "repeated-chars",
    label: "Test sample: repeated character run",
    sample: "aaaaaaaaaaaa",
    expectedMaxScore: 1,
    description: "Long string made of a single repeated character.",
  },
  {
    id: "strong-passphrase",
    label: "Test sample: long random passphrase",
    sample: "cobalt-lantern-bicycle-meadow-84",
    expectedMinScore: 3,
    description: "Multi-word unique passphrase with high entropy.",
  },
  {
    id: "unicode-passphrase",
    label: "Test sample: Unicode passphrase",
    sample: "Canyon☕River⛰️Lantern92!",
    expectedMinScore: 3,
    description: "Unicode / emoji multi-word passphrase.",
  },
];

export const UI_PASSWORD_DEMO_PRESETS = PASSWORD_FIXTURES.filter((item) =>
  ["keyboard-walk", "strong-passphrase"].includes(item.id),
);
