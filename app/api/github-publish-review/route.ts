import { NextResponse } from "next/server";
import { githubPublishInputSchema } from "@/lib/ai/review-schema";
import { publishPullRequestSummary } from "@/lib/github/github-review-service";
import { createApiErrorResponse } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = githubPublishInputSchema.parse(json);
    const result = await publishPullRequestSummary(input);

    return NextResponse.json(result);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
