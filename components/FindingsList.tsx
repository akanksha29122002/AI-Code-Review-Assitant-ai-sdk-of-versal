import type { Finding } from "@/lib/ai/review-schema";

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
        No concrete findings were identified. The review did not surface evidence-backed issues in the provided change set.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <article
          key={`${finding.title}-${index}`}
          className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-base font-semibold text-slate-100">{finding.title}</h4>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                finding.severity === "high"
                  ? "bg-orange-500/20 text-orange-200"
                  : finding.severity === "medium"
                    ? "bg-amber-500/20 text-amber-200"
                    : "bg-slate-700 text-slate-200"
              }`}
            >
              {finding.severity}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{finding.description}</p>
          {formatLocation(finding) ? (
            <p className="mt-3 text-xs text-slate-400">{formatLocation(finding)}</p>
          ) : null}
          {finding.impact && <p className="mt-3 text-sm text-slate-300">Impact: {finding.impact}</p>}
          {finding.recommendation && (
            <p className="mt-3 text-sm text-emerald-200">Recommendation: {finding.recommendation}</p>
          )}
        </article>
      ))}
    </div>
  );
}

function formatLocation(finding: Finding) {
  const filePath = finding.filePath?.trim();
  const lineReference = finding.lineReference?.trim();

  if (!filePath && !lineReference) {
    return "";
  }

  if (filePath && lineReference) {
    if (lineReference.startsWith(filePath)) {
      return lineReference;
    }

    return `${filePath} | ${lineReference}`;
  }

  return filePath || lineReference || "";
}
