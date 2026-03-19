import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/db/prisma";
import { type ReviewResult, reviewResultSchema } from "@/lib/ai/review-schema";
import { buildReviewPrompt, REVIEW_SYSTEM_PROMPT } from "@/lib/ai/review-prompts";
import { runFallbackReviewer } from "@/lib/ai/fallback-reviewer";
import {
  formatRetrievedContext,
  retrieveRepositoryContext,
  type RetrievedContext
} from "@/lib/repository/repository-context";
import { getErrorMessage } from "@/lib/utils/errors";

type ExecuteReviewParams = {
  source: "manual" | "github";
  title: string;
  language: string;
  reviewInput: string;
  repository?: string;
  pullRequestNumber?: number;
  repoContext?: string;
  changedFilesSummary?: string;
  focusAreas: string[];
  includeSuggestions: boolean;
  useLocalContext: boolean;
};

type ExecuteReviewResult = {
  result: ReviewResult;
  retrievedContext: RetrievedContext[];
  fallbackReason?: string;
};

const DEFAULT_MAX_DIFF_CHARS = 30_000;

export async function executeReview(params: ExecuteReviewParams): Promise<ExecuteReviewResult> {
  const maxDiffChars = Number(process.env.REVIEW_MAX_DIFF_CHARS || DEFAULT_MAX_DIFF_CHARS);
  const truncatedInput = params.reviewInput.slice(0, maxDiffChars);

  const retrievedContext = params.useLocalContext
    ? await retrieveRepositoryContext({
        query: `${params.title}\n${params.changedFilesSummary || ""}\n${truncatedInput}`
      })
    : [];

  const repositoryContext = [params.repoContext, formatRetrievedContext(retrievedContext)]
    .filter(Boolean)
    .join("\n\n");

  try {
    const result = await runModelReview({
      ...params,
      reviewInput: truncatedInput,
      repositoryContext
    });

    await saveReview({
      source: params.source,
      title: params.title,
      repository: params.repository,
      pullRequestNumber: params.pullRequestNumber,
      rawInput: truncatedInput,
      result
    });

    return { result, retrievedContext };
  } catch (error) {
    const fallbackReason = getErrorMessage(error);
    const result = runFallbackReviewer({
      input: truncatedInput,
      language: params.language,
      includeSuggestions: params.includeSuggestions,
      source: params.source
    });

    await saveReview({
      source: params.source,
      title: params.title,
      repository: params.repository,
      pullRequestNumber: params.pullRequestNumber,
      rawInput: truncatedInput,
      result
    });

    return {
      result,
      retrievedContext,
      fallbackReason
    };
  }
}

async function runModelReview(params: ExecuteReviewParams & { repositoryContext: string }) {
  const selectedProvider = resolveProvider();
  const modelConfig = getModelConfig(selectedProvider);
  const response = await generateObject({
    model: modelConfig.model,
    schema: reviewResultSchema,
    mode: "json",
    system: REVIEW_SYSTEM_PROMPT,
    prompt: buildReviewPrompt({
      reviewInput: params.reviewInput,
      language: params.language,
      focusAreas: params.focusAreas,
      includeSuggestions: params.includeSuggestions,
      repositoryContext: params.repositoryContext,
      changedFilesSummary: params.changedFilesSummary,
      source: params.source
    })
  });

  return reviewResultSchema.parse({
    ...response.object,
    engine: `${modelConfig.provider}:${modelConfig.modelName}`
  });
}

function resolveProvider() {
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase() || "google";
  const googleConfigured = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);

  if (preferredProvider === "google" && googleConfigured) {
    return "google" as const;
  }

  if (preferredProvider === "openai" && openaiConfigured) {
    return "openai" as const;
  }

  if (googleConfigured) {
    return "google" as const;
  }

  if (openaiConfigured) {
    return "openai" as const;
  }

  throw new Error(
    "No external AI provider key is configured. Set GOOGLE_GENERATIVE_AI_API_KEY for Gemini or OPENAI_API_KEY for OpenAI."
  );
}

function getModelConfig(provider: "google" | "openai") {
  if (provider === "google") {
    const modelName = process.env.GOOGLE_MODEL || "gemini-2.5-flash";
    return {
      provider,
      modelName,
      model: google(modelName)
    };
  }

  const modelName = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  return {
    provider,
    modelName,
    model: openai(modelName)
  };
}

async function saveReview(params: {
  source: "manual" | "github";
  title: string;
  repository?: string;
  pullRequestNumber?: number;
  rawInput: string;
  result: ReviewResult;
}) {
  await prisma.review.create({
    data: {
      source: params.source,
      title: params.title,
      repository: params.repository,
      pullRequestNumber: params.pullRequestNumber,
      overallRisk: params.result.overallRisk,
      findingsCount: params.result.findings.length,
      missingTestsCount: params.result.missingTests.length,
      summary: params.result.summary,
      rawInput: params.rawInput,
      resultJson: JSON.stringify(params.result)
    }
  });
}

export async function listRecentReviews(limit = 10) {
  return prisma.review.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc"
    }
  });
}
