import { NextResponse } from "next/server";
import { manualReviewInputSchema } from "@/lib/ai/review-schema";
import { executeReview } from "@/lib/ai/review-service";
import { createApiErrorResponse } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = manualReviewInputSchema.parse(json);

    const response = await executeReview({
      source: "manual",
      title: input.title,
      language: input.language,
      reviewInput: input.diffText,
      repoContext: input.repoContext,
      changedFilesSummary: input.changedFiles,
      focusAreas: input.focusAreas,
      includeSuggestions: input.includeSuggestions,
      useLocalContext: input.useLocalContext
    });

    return NextResponse.json(response);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
