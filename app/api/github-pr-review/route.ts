import { NextResponse } from "next/server";
import { githubReviewInputSchema } from "@/lib/ai/review-schema";
import { executeReview } from "@/lib/ai/review-service";
import {
  fetchPullRequestReviewInput,
  publishPullRequestSummary
} from "@/lib/github/github-review-service";
import { getErrorMessage } from "@/lib/utils/errors";
import { createApiErrorResponse } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = githubReviewInputSchema.parse(json);

    const pullRequestData = await fetchPullRequestReviewInput(input);
    const reviewResponse = await executeReview({
      source: "github",
      title: pullRequestData.title,
      repository: pullRequestData.repository,
      pullRequestNumber: pullRequestData.pullRequestNumber,
      language: input.language,
      reviewInput: `${pullRequestData.metadata.title}\n\n${pullRequestData.metadata.body}\n\n${pullRequestData.diffText}`,
      changedFilesSummary: pullRequestData.changedFilesSummary,
      focusAreas: input.focusAreas,
      includeSuggestions: input.includeSuggestions,
      useLocalContext: input.useLocalContext
    });

    let publishResult: { id: number; htmlUrl: string } | null = null;

    if (input.publishReview) {
      const body = [
        "## AI Code Review Summary",
        "",
        `Risk: **${reviewResponse.result.overallRisk}**`,
        "",
        reviewResponse.result.summary,
        "",
        ...reviewResponse.result.findings.map(
          (finding, index) =>
            `${index + 1}. **${finding.title}** (${finding.severity}) - ${finding.description}`
        ),
        "",
        "Missing tests:",
        ...reviewResponse.result.missingTests.map((item) => `- ${item}`),
        "",
        `Engine: ${reviewResponse.result.engine}`
      ].join("\n");

      try {
        publishResult = await publishPullRequestSummary({
          owner: input.owner,
          repo: input.repo,
          prNumber: input.prNumber,
          body
        });
      } catch (publishError) {
        return NextResponse.json({
          ...reviewResponse,
          publishError: getErrorMessage(publishError)
        });
      }
    }

    return NextResponse.json({
      ...reviewResponse,
      publishResult
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
