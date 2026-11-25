import { analyzeLink } from "@/lib/analysis/link-rules";
import type { AnalysisResponse } from "@/lib/analysis/types";

/**
 * Local-first service boundary for Link Safety Check.
 * Runs synchronously inside the browser with zero network requests.
 */
export function runLinkCheck(rawUrl: string): AnalysisResponse {
  return analyzeLink(rawUrl);
}
