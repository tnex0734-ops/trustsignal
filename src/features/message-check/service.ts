import { analyzeMessage } from "@/lib/analysis/message-rules";
import type { AnalysisResponse } from "@/lib/analysis/types";

/**
 * Local-first service boundary for Scam & Phishing Message Detector.
 * Processes pasted text entirely in memory inside the browser.
 */
export function runMessageCheck(rawMessage: string): AnalysisResponse {
  return analyzeMessage(rawMessage);
}
