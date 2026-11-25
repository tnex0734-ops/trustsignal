import { MAX_EVIDENCE_LENGTH } from "./constants";

export interface ObfuscationStats {
  zeroWidthCount: number;
  bidiOverrideCount: number;
}

const ZERO_WIDTH_REGEX = /[\u200B-\u200D\u2060\uFEFF]/g;
const BIDI_OVERRIDE_REGEX = /[\u202A-\u202E\u2066-\u2069\u200E\u200F]/g;

const CONFUSABLE_CHAR_MAP: ReadonlyMap<string, string> = new Map([
  ["0", "o"],
  ["1", "l"],
  ["3", "e"],
  ["4", "a"],
  ["5", "s"],
  ["7", "t"],
  // Cyrillic lookalikes
  ["\u0430", "a"], // а
  ["\u0435", "e"], // е
  ["\u0456", "i"], // і
  ["\u043E", "o"], // о
  ["\u0440", "p"], // р
  ["\u0441", "c"], // с
  ["\u0443", "y"], // у
  ["\u0445", "x"], // х
  ["\u0455", "s"], // ѕ
  ["\u0458", "j"], // ј
  // Greek lookalikes
  ["\u03B1", "a"], // α
  ["\u03BF", "o"], // ο
  ["\u03C1", "p"], // ρ
  ["\u03B5", "e"], // ε
  ["\u03B9", "i"], // ι
]);

export function inspectTextObfuscation(input: string): ObfuscationStats {
  const zeroWidthMatches = input.match(ZERO_WIDTH_REGEX);
  const bidiMatches = input.match(BIDI_OVERRIDE_REGEX);
  return {
    zeroWidthCount: zeroWidthMatches ? zeroWidthMatches.length : 0,
    bidiOverrideCount: bidiMatches ? bidiMatches.length : 0,
  };
}

export function stripInvisibleCharacters(input: string): string {
  return input.replace(ZERO_WIDTH_REGEX, "").replace(BIDI_OVERRIDE_REGEX, "");
}

export function normalizeForMatching(input: string): string {
  const stripped = stripInvisibleCharacters(input).normalize("NFKC");
  return stripped.replace(/\s+/g, " ").trim();
}

export function normalizeConfusableAscii(input: string): string {
  const lowered = input.normalize("NFKC").toLowerCase();
  let mapped = "";
  for (const ch of lowered) {
    mapped += CONFUSABLE_CHAR_MAP.get(ch) ?? ch;
  }
  return mapped.replace(/rn/g, "m").replace(/vv/g, "w");
}

export function hasNonAsciiCharacters(input: string): boolean {
  for (let i = 0; i < input.length; i += 1) {
    if (input.charCodeAt(i) > 127) {
      return true;
    }
  }
  return false;
}

export function truncateEvidence(input: string, maxLength = MAX_EVIDENCE_LENGTH): string {
  const cleaned = stripInvisibleCharacters(input).replace(/\s+/g, " ").trim();
  const codePoints = Array.from(cleaned);
  if (codePoints.length <= maxLength) {
    return cleaned;
  }
  return `${codePoints.slice(0, maxLength - 3).join("")}...`;
}

const PUNYCODE_BASE = 36;
const PUNYCODE_TMIN = 1;
const PUNYCODE_TMAX = 26;
const PUNYCODE_SKEW = 38;
const PUNYCODE_DAMP = 700;
const PUNYCODE_INITIAL_BIAS = 72;
const PUNYCODE_INITIAL_N = 128;

function decodeDigit(cp: number): number {
  if (cp >= 48 && cp <= 57) return cp - 22; // 0-9 -> 26-35
  if (cp >= 65 && cp <= 90) return cp - 65; // A-Z -> 0-25
  if (cp >= 97 && cp <= 122) return cp - 97; // a-z -> 0-25
  return PUNYCODE_BASE;
}

function adaptBias(deltaInput: number, numPoints: number, firstTime: boolean): number {
  let delta = firstTime ? Math.floor(deltaInput / PUNYCODE_DAMP) : deltaInput >> 1;
  delta += Math.floor(delta / numPoints);
  let k = 0;
  const threshold = Math.floor(((PUNYCODE_BASE - PUNYCODE_TMIN) * PUNYCODE_TMAX) / 2);
  while (delta > threshold) {
    delta = Math.floor(delta / (PUNYCODE_BASE - PUNYCODE_TMIN));
    k += PUNYCODE_BASE;
  }
  return k + Math.floor(((PUNYCODE_BASE - PUNYCODE_TMIN + 1) * delta) / (delta + PUNYCODE_SKEW));
}

/**
 * Pure RFC 3492 Punycode decoder for a single xn-- label.
 * Fails safely back to the raw label on malformed input.
 */
export function decodePunycodeLabel(label: string): string {
  if (!label.toLowerCase().startsWith("xn--")) {
    return label;
  }
  const encoded = label.slice(4);
  if (!encoded || encoded.length > 255) {
    return label;
  }

  const output: number[] = [];
  const basicEnd = encoded.lastIndexOf("-");
  let index = 0;

  if (basicEnd > 0) {
    for (let j = 0; j < basicEnd; j += 1) {
      const code = encoded.charCodeAt(j);
      if (code >= 0x80) {
        return label;
      }
      output.push(code);
    }
    index = basicEnd + 1;
  }

  let n = PUNYCODE_INITIAL_N;
  let i = 0;
  let bias = PUNYCODE_INITIAL_BIAS;

  while (index < encoded.length) {
    const oldI = i;
    let w = 1;
    let k = PUNYCODE_BASE;

    while (index < encoded.length) {
      const digit = decodeDigit(encoded.charCodeAt(index));
      index += 1;
      if (digit >= PUNYCODE_BASE) {
        return label;
      }
      i += digit * w;
      if (i > 0x10ffff * 256) {
        return label;
      }
      const t = k <= bias ? PUNYCODE_TMIN : k >= bias + PUNYCODE_TMAX ? PUNYCODE_TMAX : k - bias;
      if (digit < t) {
        break;
      }
      w *= PUNYCODE_BASE - t;
      k += PUNYCODE_BASE;
    }

    const outLen = output.length + 1;
    bias = adaptBias(i - oldI, outLen, oldI === 0);
    n += Math.floor(i / outLen);
    i %= outLen;
    if (n > 0x10ffff) {
      return label;
    }
    output.splice(i, 0, n);
    i += 1;
  }

  try {
    return String.fromCodePoint(...output);
  } catch {
    return label;
  }
}

export function decodePunycodeHostname(hostname: string): string {
  return hostname
    .split(".")
    .map((label) => decodePunycodeLabel(label))
    .join(".");
}
