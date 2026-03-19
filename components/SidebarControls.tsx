"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/utils/languages";

type SidebarControlsProps = {
  language: string;
  setLanguage: (value: string) => void;
  focusAreasText: string;
  setFocusAreasText: (value: string) => void;
  includeSuggestions: boolean;
  setIncludeSuggestions: (value: boolean) => void;
  useLocalContext: boolean;
  setUseLocalContext: (value: boolean) => void;
  modelStatus: string;
  githubStatus: string;
};

export function SidebarControls(props: SidebarControlsProps) {
  return (
    <aside className="glass-panel flex h-fit flex-col gap-6 rounded-3xl p-6">
      <div>
        <p className="section-title">Review Controls</p>
        <h2
          className="mt-2 text-2xl font-semibold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Session Settings
        </h2>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-200">Primary language</span>
        <select
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
          value={props.language}
          onChange={(event) => props.setLanguage(event.target.value)}
        >
          {SUPPORTED_LANGUAGES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-200">Focus areas</span>
        <textarea
          className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
          placeholder="security, regressions, data handling"
          value={props.focusAreasText}
          onChange={(event) => props.setFocusAreasText(event.target.value)}
        />
      </label>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <ToggleRow
          label="Include fix suggestions"
          checked={props.includeSuggestions}
          onChange={props.setIncludeSuggestions}
        />
        <ToggleRow
          label="Use local repository context"
          checked={props.useLocalContext}
          onChange={props.setUseLocalContext}
        />
      </div>

      <div className="space-y-3">
        <StatusCard label="Model status" value={props.modelStatus} />
        <StatusCard label="GitHub auth" value={props.githubStatus} />
      </div>
    </aside>
  );
}

function ToggleRow(props: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-200">{props.label}</span>
      <button
        type="button"
        className={`relative h-7 w-12 rounded-full transition ${
          props.checked ? "bg-emerald-500" : "bg-slate-700"
        }`}
        onClick={() => props.onChange(!props.checked)}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            props.checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

function StatusCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="section-title">{props.label}</p>
      <p className="mt-2 text-sm text-slate-100">{props.value}</p>
    </div>
  );
}
