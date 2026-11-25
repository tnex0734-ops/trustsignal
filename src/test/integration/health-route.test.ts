import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";
import { HealthResponseSchema } from "@/lib/validation/schemas";

describe("GET /api/health", () => {
  it("returns validated service metadata with no-store cache headers", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    const json = await response.json();
    const parsed = HealthResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe("ok");
      expect(parsed.data.service).toBe("trustsignal");
      expect(parsed.data.privacy.acceptsScanInput).toBe(false);
      expect(parsed.data.privacy.fetchesSubmittedUrls).toBe(false);
    }
  });
});
