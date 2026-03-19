import type { ReviewResult } from "@/lib/ai/review-schema";

export type RetrievedContextItem = {
  filePath: string;
  score: number;
  excerpt: string;
};

export type ReviewResponse = {
  result: ReviewResult;
  retrievedContext: RetrievedContextItem[];
  fallbackReason?: string;
  publishResult?: {
    id: number;
    htmlUrl: string;
  } | null;
  publishError?: string;
};

export type ReviewRecord = {
  id: string;
  source: string;
  title: string;
  repository: string | null;
  pullRequestNumber: number | null;
  overallRisk: string;
  findingsCount: number;
  missingTestsCount: number;
  summary: string;
  rawInput: string;
  resultJson: string;
  createdAt: string;
};
