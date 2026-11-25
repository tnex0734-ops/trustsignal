import { describe, expect, it } from "vitest";
import { aggregateAnalysisRisk } from "@/lib/analysis/risk";
import type { Indicator } from "@/lib/analysis/types";

const makeDummyIndicator = (
  id: string,
  severity: Indicator["severity"],
  weight: number,
): Indicator => ({
  id,
  title: id,
  severity,
  weight,
  explanation: "Test explanation",
  recommendation: `Action for ${id}`,
});

describe("aggregateAnalysisRisk", () => {
  it("calibrates low-signal, needs-attention, and high-risk boundaries", () => {
    const low = aggregateAnalysisRisk("link", [makeDummyIndicator("INFO_1", "info", 10)]);
    expect(low.riskLevel).toBe("low-signal");
    expect(low.heuristicScore).toBe(10);

    const attention = aggregateAnalysisRisk("link", [makeDummyIndicator("WARN_1", "warning", 25)]);
    expect(attention.riskLevel).toBe("needs-attention");

    const combinedHigh = aggregateAnalysisRisk("message", [
      makeDummyIndicator("WARN_1", "warning", 25),
      makeDummyIndicator("WARN_2", "warning", 25),
    ]);
    expect(combinedHigh.riskLevel).toBe("high-risk");
    expect(combinedHigh.heuristicScore).toBe(50);

    const criticalHigh = aggregateAnalysisRisk("message", [
      makeDummyIndicator("CRIT_1", "critical", 40),
    ]);
    expect(criticalHigh.riskLevel).toBe("high-risk");
    expect(criticalHigh.heuristicScore).toBe(55);
  });

  it("deduplicates identical indicators and caps heuristic score at 100", () => {
    const res = aggregateAnalysisRisk("link", [
      makeDummyIndicator("DUP", "warning", 20),
      makeDummyIndicator("DUP", "warning", 30),
      makeDummyIndicator("CRIT_A", "critical", 50),
      makeDummyIndicator("CRIT_B", "critical", 50),
    ]);
    expect(res.indicators.filter((i) => i.id === "DUP")).toHaveLength(1);
    expect(res.indicators[0]?.severity).toBe("critical");
    expect(res.heuristicScore).toBe(100);
  });
});
