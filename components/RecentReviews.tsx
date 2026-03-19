import type { ReviewRecord } from "@/components/types";
import { formatDateTime } from "@/lib/utils/format";

export function RecentReviews({ reviews }: { reviews: ReviewRecord[] }) {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-title">History</p>
          <h3 className="mt-2 text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Recent Reviews
          </h3>
        </div>
        <span className="text-xs text-slate-400">Latest 10 records</span>
      </div>

      <div className="mt-5 space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">No reviews stored yet.</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-100">{review.title}</h4>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] uppercase text-slate-300">
                  {review.source}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] uppercase text-slate-300">
                  {review.overallRisk}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{review.summary}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>{review.findingsCount} findings</span>
                <span>{review.missingTestsCount} test gaps</span>
                <span>{formatDateTime(review.createdAt)}</span>
                {review.repository ? <span>{review.repository}</span> : null}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
