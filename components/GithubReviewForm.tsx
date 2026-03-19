"use client";

type GithubReviewFormProps = {
  owner: string;
  setOwner: (value: string) => void;
  repo: string;
  setRepo: (value: string) => void;
  prNumber: string;
  setPrNumber: (value: string) => void;
  publishReview: boolean;
  setPublishReview: (value: boolean) => void;
  loading: boolean;
  publishAvailable: boolean;
  onSubmit: () => void;
};

export function GithubReviewForm(props: GithubReviewFormProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Owner">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none"
            value={props.owner}
            onChange={(event) => props.setOwner(event.target.value)}
            placeholder="vercel"
          />
        </Field>
        <Field label="Repository">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none"
            value={props.repo}
            onChange={(event) => props.setRepo(event.target.value)}
            placeholder="ai"
          />
        </Field>
        <Field label="Pull request number">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none"
            value={props.prNumber}
            onChange={(event) => props.setPrNumber(event.target.value)}
            placeholder="123"
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-100">Publish review back to GitHub</p>
            <p className="mt-1 text-xs text-slate-400">
              Defaults to preview mode. Publishing stays off unless token and env settings allow it.
            </p>
          </div>
          <button
            type="button"
            disabled={!props.publishAvailable}
            className={`relative h-7 w-12 rounded-full transition ${
              props.publishReview && props.publishAvailable ? "bg-emerald-500" : "bg-slate-700"
            } ${!props.publishAvailable ? "opacity-40" : ""}`}
            onClick={() => props.setPublishReview(!props.publishReview)}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                props.publishReview && props.publishAvailable ? "left-6" : "left-1"
              }`}
            />
          </button>
        </label>
      </div>

      <button
        type="button"
        onClick={props.onSubmit}
        disabled={props.loading}
        className="rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.loading ? "Reviewing PR..." : "Review GitHub pull request"}
      </button>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{props.label}</span>
      {props.children}
    </label>
  );
}
