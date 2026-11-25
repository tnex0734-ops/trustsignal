"use client";

import { ZxcvbnFactory, type MatchExtended, type Score } from "@zxcvbn-ts/core";
import { adjacencyGraphs, dictionary as commonDictionary } from "@zxcvbn-ts/language-common";
import { dictionary as enDictionary, translations as enTranslations } from "@zxcvbn-ts/language-en";
import { MAX_PASSWORD_LENGTH } from "@/lib/analysis/constants";
import { hasNonAsciiCharacters } from "@/lib/analysis/normalize-text";
import type { PasswordAssessment, PasswordStrengthTier, RiskLevel } from "@/lib/analysis/types";

let cachedEvaluator: ZxcvbnFactory | null = null;

function getPasswordEvaluator(): ZxcvbnFactory {
  if (cachedEvaluator) {
    return cachedEvaluator;
  }

  cachedEvaluator = new ZxcvbnFactory({
    translations: enTranslations,
    graphs: adjacencyGraphs,
    dictionary: {
      ...commonDictionary,
      ...enDictionary,
    },
    maxLength: MAX_PASSWORD_LENGTH,
  });

  return cachedEvaluator;
}

const PASSWORD_LIMITATIONS: readonly string[] = [
  "Password strength is estimated completely offline inside your browser—nothing is transmitted, logged, or saved.",
  "This local check analyzes length and predictable patterns only. It does NOT check whether your password has appeared in a past data breach or been reused on another site.",
  "Always use a unique password per account and enable multi-factor authentication (MFA) where supported.",
];

function mapScoreToTierAndRisk(score: Score): {
  tier: PasswordStrengthTier;
  riskLevel: RiskLevel;
  summary: string;
} {
  switch (score) {
    case 0:
      return {
        tier: "very-weak",
        riskLevel: "high-risk",
        summary:
          "Very weak against automated guessing. Short or highly predictable passwords can often be guessed almost immediately.",
      };
    case 1:
      return {
        tier: "weak",
        riskLevel: "high-risk",
        summary:
          "Weak local resistance. Common words, keyboard patterns, or repeated characters make this easier to guess.",
      };
    case 2:
      return {
        tier: "fair",
        riskLevel: "needs-attention",
        summary:
          "Fair resistance, though predictable segments remain. Adding length and unrelated words would make it much harder to guess.",
      };
    case 3:
      return {
        tier: "strong",
        riskLevel: "low-signal",
        summary:
          "Good local resistance to guessing. Keep it unique to this single account and pair it with multi-factor authentication.",
      };
    case 4:
      return {
        tier: "very-strong",
        riskLevel: "low-signal",
        summary:
          "Strong local resistance to offline guessing. Make sure it is never reused across different services.",
      };
  }
}

const KEYBOARD_WALK_ROWS = [
  "1234567890",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1qaz2wsx3edc4rfv",
  "0okm9ijn8uhb7ygv",
] as const;

function hasKeyboardWalk(password: string): boolean {
  const lower = password.toLowerCase();
  for (const row of KEYBOARD_WALK_ROWS) {
    const reversed = row.split("").reverse().join("");
    for (let i = 0; i <= row.length - 4; i += 1) {
      const slice = row.slice(i, i + 4);
      const revSlice = reversed.slice(i, i + 4);
      if (lower.includes(slice) || lower.includes(revSlice)) {
        return true;
      }
    }
  }
  return false;
}

function summarizeMatchedPatterns(
  sequence: readonly MatchExtended[],
  characterCount: number,
  includesUnicode: boolean,
  password: string,
): string[] {
  const patterns: string[] = [];
  const seen = new Set<string>();

  const add = (label: string) => {
    if (!seen.has(label)) {
      seen.add(label);
      patterns.push(label);
    }
  };

  if (characterCount < 12) {
    add(`Short length (${characterCount} characters; aim for 14–16+)`);
  } else if (characterCount >= 16) {
    add(`Long passphrase length (${characterCount} characters)`);
  }

  if (includesUnicode) {
    add("Includes Unicode / multi-script characters");
  }

  if (hasKeyboardWalk(password)) {
    add("Keyboard row or spatial pattern");
  }

  for (const match of sequence) {
    switch (match.pattern) {
      case "spatial":
        add("Keyboard row or spatial pattern");
        break;
      case "repeat":
        add("Repeated characters or repeated segment");
        break;
      case "sequence":
        add("Sequential letters or numbers (such as abc or 123)");
        break;
      case "dictionary":
      case "wordSequence":
        add("Common password or dictionary word pattern");
        break;
      case "date":
        add("Date or year pattern");
        break;
      default:
        break;
    }
  }

  return patterns;
}

/**
 * Browser-only password assessment wrapper.
 * Never returns, logs, stores, or transmits the raw password string.
 */
export function assessPasswordLocally(password: string): PasswordAssessment {
  if (typeof password !== "string" || password.length === 0) {
    return {
      status: "empty",
      detectedPatterns: [],
      summary: "Type or paste a sample password to estimate its local resistance to guessing.",
      suggestions: [
        "Aim for a unique passphrase of four or more unrelated words (16+ characters).",
        "Avoid typing a real sensitive password on any shared screen or demo.",
      ],
      limitations: [...PASSWORD_LIMITATIONS],
    };
  }

  const codePointCount = Array.from(password).length;
  if (codePointCount > MAX_PASSWORD_LENGTH) {
    return {
      status: "too-long",
      detectedPatterns: [`Exceeds ${MAX_PASSWORD_LENGTH}-character evaluation cap`],
      summary: `Passphrases over ${MAX_PASSWORD_LENGTH} characters are capped to keep local browser evaluation responsive.`,
      suggestions: [
        "Long unique passphrases are great—keep passwords under 256 characters when checking locally.",
      ],
      limitations: [...PASSWORD_LIMITATIONS],
    };
  }

  const evaluator = getPasswordEvaluator();
  const result = evaluator.check(password);
  const { tier, riskLevel, summary } = mapScoreToTierAndRisk(result.score);
  const includesUnicode = hasNonAsciiCharacters(password);
  const detectedPatterns = summarizeMatchedPatterns(
    result.sequence,
    codePointCount,
    includesUnicode,
    password,
  );

  const suggestions: string[] = [];
  if (result.feedback.warning) {
    suggestions.push(result.feedback.warning);
  }
  for (const tip of result.feedback.suggestions) {
    if (!suggestions.includes(tip)) {
      suggestions.push(tip);
    }
  }

  if (codePointCount < 14) {
    const lengthTip = "Increase length to at least 14–16 characters using unrelated words.";
    if (!suggestions.includes(lengthTip)) {
      suggestions.push(lengthTip);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Use a password manager so every account keeps a separate, unique password.",
      "Pair strong passwords with app-based or hardware multi-factor authentication (MFA).",
    );
  }

  return {
    status: "assessed",
    tier,
    riskLevel,
    score: result.score,
    characterCount: codePointCount,
    detectedPatterns,
    summary,
    suggestions,
    limitations: [...PASSWORD_LIMITATIONS],
  };
}
