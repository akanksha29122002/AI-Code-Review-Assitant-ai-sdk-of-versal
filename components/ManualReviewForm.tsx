"use client";

type ManualReviewFormProps = {
  title: string;
  setTitle: (value: string) => void;
  diffText: string;
  setDiffText: (value: string) => void;
  changedFiles: string;
  setChangedFiles: (value: string) => void;
  repoContext: string;
  setRepoContext: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function ManualReviewForm(props: ManualReviewFormProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Review title">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none"
            placeholder="Auth middleware patch review"
            value={props.title}
            onChange={(event) => props.setTitle(event.target.value)}
          />
        </Field>
        <Field label="Changed files summary">
          <textarea
            className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none"
            placeholder="src/auth.ts, src/session.ts, tests/auth.test.ts"
            value={props.changedFiles}
            onChange={(event) => props.setChangedFiles(event.target.value)}
          />
        </Field>
      </div>

      <Field label="Repository context">
        <textarea
          className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none"
          placeholder="Optional architecture notes, domain rules, or module responsibilities"
          value={props.repoContext}
          onChange={(event) => props.setRepoContext(event.target.value)}
        />
      </Field>

      <Field label="Code, diff, or patch">
        <textarea
          className="min-h-[320px] w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 font-mono text-sm outline-none"
          placeholder="Paste code, patch, or unified diff here"
          value={props.diffText}
          onChange={(event) => props.setDiffText(event.target.value)}
        />
      </Field>

      <button
        type="button"
        onClick={props.onSubmit}
        disabled={props.loading}
        className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.loading ? "Reviewing..." : "Run manual review"}
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
