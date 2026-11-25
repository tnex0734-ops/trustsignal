import { handleGuidesRequest } from "@/app/api/guides/route";

/**
 * GET /api/guidance
 * Alias route returning the exact same public safety guidance payload as /api/guides.
 */
export async function GET() {
  return handleGuidesRequest();
}
