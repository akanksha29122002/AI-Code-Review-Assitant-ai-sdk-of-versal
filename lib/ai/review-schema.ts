import { z } from "zod";

export const riskSchema = z.enum(["low", "medium", "high"]);

export const findingSchema = z.object({
  title: z.string().min(1),
  severity: riskSchema,
  filePath: z.string().min(1).optional(),
  lineReference: z.string().min(1).optional(),
  description: z.string().min(1),
  impact: z.string().min(1).optional(),
  recommendation: z.string().min(1).optional()
});

export const reviewResultSchema = z.object({
  summary: z.string().min(1),
  overallRisk: riskSchema,
  findings: z.array(findingSchema),
  missingTests: z.array(z.string().min(1)),
  engine: z.string().min(1)
});

export type ReviewResult = z.infer<typeof reviewResultSchema>;
export type Finding = z.infer<typeof findingSchema>;

export const manualReviewInputSchema = z.object({
  title: z.string().min(1).default("Manual Review"),
  repoContext: z.string().optional().default(""),
  changedFiles: z.string().optional().default(""),
  diffText: z.string().min(1),
  language: z.string().min(1),
  focusAreas: z.array(z.string()).default([]),
  includeSuggestions: z.boolean().default(true),
  useLocalContext: z.boolean().default(true)
});

export const githubReviewInputSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  prNumber: z.coerce.number().int().positive(),
  publishReview: z.boolean().default(false),
  focusAreas: z.array(z.string()).default([]),
  includeSuggestions: z.boolean().default(true),
  useLocalContext: z.boolean().default(true),
  language: z.string().default("mixed")
});

export const githubPublishInputSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  prNumber: z.coerce.number().int().positive(),
  body: z.string().min(1)
});
