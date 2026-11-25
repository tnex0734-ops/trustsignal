import { z } from "zod";

export const APP_VERSION = "1.0.0" as const;
export const CATALOG_VERSION = "2026.11.1" as const;

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("trustsignal"),
  version: z.string(),
  mode: z.literal("local-first-analysis"),
  timestamp: z.string().datetime(),
  privacy: z.object({
    acceptsScanInput: z.literal(false),
    persistsUserData: z.literal(false),
    fetchesSubmittedUrls: z.literal(false),
  }),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const RuleCategorySchema = z.enum(["link", "message", "password"]);
export const RuleSeveritySchema = z.enum(["info", "warning", "critical"]);

export const RuleCatalogEntrySchema = z.object({
  id: z.string(),
  category: RuleCategorySchema,
  title: z.string(),
  severity: RuleSeveritySchema,
  weight: z.number().int().min(0).max(100),
  summary: z.string(),
  whyItMatters: z.string(),
  recommendation: z.string(),
});

export const RulesResponseSchema = z.object({
  version: z.string(),
  ruleCount: z.number().int().nonnegative(),
  limitations: z.array(z.string()),
  rules: z.array(RuleCatalogEntrySchema),
});

export type RulesResponse = z.infer<typeof RulesResponseSchema>;

export const SafetyGuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  threatCategory: z.string(),
  summary: z.string(),
  warningSigns: z.array(z.string()),
  safeActions: z.array(z.string()),
});

export const GuidesResponseSchema = z.object({
  version: z.string(),
  guides: z.array(SafetyGuideSchema),
  emergencySteps: z.array(z.string()),
  disclaimer: z.string(),
});

export type GuidesResponse = z.infer<typeof GuidesResponseSchema>;
