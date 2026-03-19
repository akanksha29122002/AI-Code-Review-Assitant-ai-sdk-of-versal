"use client";

import { useEffect, useState } from "react";
import { GithubReviewForm } from "@/components/GithubReviewForm";
import { ManualReviewForm } from "@/components/ManualReviewForm";
import { RecentReviews } from "@/components/RecentReviews";
import { ReviewResultCard } from "@/components/ReviewResultCard";
import { SidebarControls } from "@/components/SidebarControls";
import type { ReviewRecord, ReviewResponse } from "@/components/types";

type Tab = "manual" | "github";

type HealthResponse = {
  providerConfigured: boolean;
  provider?: string;
  modelName?: string;
  googleConfigured?: boolean;
  openaiConfigured?: boolean;
  githubConfigured: boolean;
  publishEnabled: boolean;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [language, setLanguage] = useState("typescript");
  const [focusAreasText, setFocusAreasText] = useState("correctness, regressions, security");
  const [includeSuggestions, setIncludeSuggestions] = useState(true);
  const [useLocalContext, setUseLocalContext] = useState(true);
  const [manualTitle, setManualTitle] = useState("Manual Review");
  const [manualDiff, setManualDiff] = useState("");
  const [changedFiles, setChangedFiles] = useState("");
  const [repoContext, setRepoContext] = useState("");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [publishReview, setPublishReview] = useState(false);
  const [reviewResponse, setReviewResponse] = useState<ReviewResponse | null>(null);
  const [recentReviews, setRecentReviews] = useState<ReviewRecord[]>([]);
  const [health, setHealth] = useState<HealthResponse>({
    providerConfigured: false,
    provider: "google",
    modelName: "gpt-4.1-mini",
    googleConfigured: false,
    openaiConfigured: false,
    githubConfigured: false,
    publishEnabled: false
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void refreshMeta();
  }, []);

  async function refreshMeta() {
    try {
      const [healthResponse, reviewsResponse] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/reviews")
      ]);

      if (healthResponse.ok) {
        const healthJson = (await healthResponse.json()) as HealthResponse;
        setHealth(healthJson);
      }

      if (reviewsResponse.ok) {
        const reviewsJson = (await reviewsResponse.json()) as { reviews: ReviewRecord[] };
        setRecentReviews(reviewsJson.reviews);
      }
    } catch {
      // Silent hydration-friendly failure.
    }
  }

  function getFocusAreas() {
    return focusAreasText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function submitManualReview() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/manual-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: manualTitle,
          diffText: manualDiff,
          changedFiles,
          repoContext,
          language,
          focusAreas: getFocusAreas(),
          includeSuggestions,
          useLocalContext
        })
      });

      const json = (await response.json()) as ReviewResponse & { error?: string };

      if (!response.ok) {
        throw new Error(json.error || "Manual review failed.");
      }

      setReviewResponse(json);
      await refreshMeta();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Manual review failed.");
    } finally {
      setLoading(false);
    }
  }

  async function submitGithubReview() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/github-pr-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          owner,
          repo,
          prNumber: Number(prNumber),
          publishReview,
          language,
          focusAreas: getFocusAreas(),
          includeSuggestions,
          useLocalContext
        })
      });

      const json = (await response.json()) as ReviewResponse & { error?: string };

      if (!response.ok) {
        throw new Error(json.error || "GitHub PR review failed.");
      }

      setReviewResponse(json);
      await refreshMeta();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "GitHub PR review failed.");
    } finally {
      setLoading(false);
    }
  }

  const modelStatus = health.providerConfigured
    ? `Connected to ${health.provider || "configured"} (${health.modelName || "configured"})`
    : "Fallback-only mode until GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY is configured";
  const githubStatus = health.githubConfigured
    ? health.publishEnabled
      ? "GitHub token detected and publish mode enabled"
      : "GitHub token detected, preview mode only"
    : "No GitHub token configured";

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/10">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <p className="section-title">AI-Powered Code Review Assistant</p>
              <h1
                className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Production-style review workflows for pasted diffs and GitHub pull requests.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Use the Vercel AI SDK for structured reviews, augment with local repository retrieval,
                save history to Postgres, and keep the experience resilient with a deterministic fallback
                reviewer when the provider is unavailable.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Review modes" value="2" subtext="Manual + GitHub PR" />
              <MetricCard
                label="Structured output"
                value="Zod"
                subtext="Summary, risk, findings, tests"
              />
              <MetricCard label="Storage" value="Postgres" subtext="Prisma-backed history" />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <SidebarControls
            language={language}
            setLanguage={setLanguage}
            focusAreasText={focusAreasText}
            setFocusAreasText={setFocusAreasText}
            includeSuggestions={includeSuggestions}
            setIncludeSuggestions={setIncludeSuggestions}
            useLocalContext={useLocalContext}
            setUseLocalContext={setUseLocalContext}
            modelStatus={modelStatus}
            githubStatus={githubStatus}
          />

          <div className="space-y-6">
            <section className="glass-panel rounded-3xl p-6">
              <div className="flex flex-wrap gap-3">
                <TabButton
                  active={activeTab === "manual"}
                  label="Manual Review"
                  onClick={() => setActiveTab("manual")}
                />
                <TabButton
                  active={activeTab === "github"}
                  label="GitHub PR Review"
                  onClick={() => setActiveTab("github")}
                />
              </div>

              <div className="mt-6">
                {activeTab === "manual" ? (
                  <ManualReviewForm
                    language={language}
                    title={manualTitle}
                    setTitle={setManualTitle}
                    diffText={manualDiff}
                    setDiffText={setManualDiff}
                    changedFiles={changedFiles}
                    setChangedFiles={setChangedFiles}
                    repoContext={repoContext}
                    setRepoContext={setRepoContext}
                    onSubmit={submitManualReview}
                    loading={loading}
                  />
                ) : (
                  <GithubReviewForm
                    owner={owner}
                    setOwner={setOwner}
                    repo={repo}
                    setRepo={setRepo}
                    prNumber={prNumber}
                    setPrNumber={setPrNumber}
                    publishReview={publishReview}
                    setPublishReview={setPublishReview}
                    loading={loading}
                    publishAvailable={health.githubConfigured && health.publishEnabled}
                    onSubmit={submitGithubReview}
                  />
                )}
              </div>

              {errorMessage && (
                <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-100">
                  {errorMessage}
                </div>
              )}
            </section>

            <ReviewResultCard review={reviewResponse} />
            <RecentReviews reviews={recentReviews} />
          </div>
        </div>
      </div>
    </main>
  );
}

function TabButton(props: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
        props.active
          ? "bg-white text-slate-950"
          : "border border-white/10 bg-slate-950/60 text-slate-300"
      }`}
    >
      {props.label}
    </button>
  );
}

function MetricCard(props: { label: string; value: string; subtext: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="section-title">{props.label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-100">{props.value}</p>
      <p className="mt-2 text-sm text-slate-400">{props.subtext}</p>
    </div>
  );
}
