import { NextResponse } from "next/server";
import { getPersistenceStatus } from "@/lib/ai/review-service";

export async function GET() {
  const googleConfigured = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const preferredProvider = process.env.AI_PROVIDER || (googleConfigured ? "google" : "openai");
  const persistence = await getPersistenceStatus();

  return NextResponse.json({
    ok: true,
    providerConfigured: googleConfigured || openaiConfigured,
    provider: preferredProvider,
    modelName:
      preferredProvider === "google"
        ? process.env.GOOGLE_MODEL || "gemini-2.5-flash"
        : process.env.OPENAI_MODEL || "gpt-4.1-mini",
    googleConfigured,
    openaiConfigured,
    persistence,
    githubConfigured: Boolean(process.env.GITHUB_TOKEN),
    publishEnabled: process.env.ENABLE_GITHUB_PUBLISH === "true",
    timestamp: new Date().toISOString()
  });
}
