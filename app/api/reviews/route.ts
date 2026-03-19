import { NextResponse } from "next/server";
import { listRecentReviews } from "@/lib/ai/review-service";
import { createApiErrorResponse } from "@/lib/utils/http";

export async function GET() {
  try {
    const reviews = await listRecentReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
