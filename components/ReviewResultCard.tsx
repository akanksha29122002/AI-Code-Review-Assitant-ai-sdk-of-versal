import ReactMarkdown from "react-markdown";
import type { ReviewResponse } from "@/components/types";
import { FindingsList } from "@/components/FindingsList";

export function ReviewResultCard({ review }: { review: ReviewResponse | null }) {
  if (!review) {
    return (
      <div className="glass-panel rounded-3xl p-8">
        <p className="section-title">Review Output</p>
        <h3 className="mt-3 text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Awaiting input
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Run a manual or GitHub review to see a structured summary, risk assessment, findings, missing
          tests, raw output, and any retrieved repository context.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-6 rounded-3xl p-8">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="section-title">Review Output</p>
          <h3 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Structured Review Result
          </h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
          Engine: {review.result.engine}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
            review.result.overallRisk === "high"
              ? "bg-orange-500/20 text-orange-200"
              : review.result.overallRisk === "medium"
                ? "bg-amber-500/20 text-amber-200"
                : "bg-emerald-500/20 text-emerald-200"
          }`}
        >
          Risk: {review.result.overallRisk}
        </span>
      </div>

      {review.fallbackReason && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          Fallback mode was used because the external provider was unavailable: {review.fallbackReason}
        </div>
      )}

      {review.publishResult && (
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100">
          Review published to GitHub: {review.publishResult.htmlUrl}
        </div>
      )}

      {review.publishError && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-100">
          Review was generated, but publishing failed: {review.publishError}
        </div>
      )}

      <section className="space-y-3">
        <p className="section-title">Summary</p>
        <div className="prose prose-invert max-w-none text-sm leading-7 prose-p:text-slate-200">
          <ReactMarkdown>{review.result.summary}</ReactMarkdown>
        </div>
      </section>

      <section className="space-y-3">
        <p className="section-title">Findings</p>
        <FindingsList findings={review.result.findings} />
      </section>

      <section className="space-y-3">
        <p className="section-title">Missing Tests</p>
        <div className="space-y-2">
          {review.result.missingTests.length === 0 ? (
            <p className="text-sm text-slate-400">No explicit test gaps were called out.</p>
          ) : (
            review.result.missingTests.map((test, index) => (
              <div key={`${test}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
                {test}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <p className="section-title">Retrieved Repository Context</p>
        <div className="space-y-3">
          {review.retrievedContext.length === 0 ? (
            <p className="text-sm text-slate-400">No local repository context was retrieved for this review.</p>
          ) : (
            review.retrievedContext.map((context) => (
              <div key={context.filePath} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm font-medium text-slate-100">{context.filePath}</p>
                <p className="mt-1 text-xs text-slate-400">Relevance score: {context.score}</p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-300">
                  {context.excerpt.slice(0, 800)}
                </pre>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <p className="section-title">Raw Structured Output</p>
        <pre className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-xs leading-6 text-slate-300">
          {JSON.stringify(review.result, null, 2)}
        </pre>
      </section>
    </div>
  );
}
