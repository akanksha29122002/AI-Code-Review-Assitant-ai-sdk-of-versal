type BuildPromptParams = {
  reviewInput: string;
  language: string;
  focusAreas: string[];
  includeSuggestions: boolean;
  repositoryContext?: string;
  changedFilesSummary?: string;
  source: "manual" | "github";
};

export const REVIEW_SYSTEM_PROMPT = `
You are a senior software engineer conducting a production-grade code review.
Evaluate correctness, regressions, security, maintainability, performance, test coverage, and code quality.

Rules:
- Be precise and concise.
- Do not hallucinate issues. Only report a finding when there is evidence in the provided code, patch, or diff.
- Prioritize actionable findings over style nitpicks.
- Mention missing tests whenever behavior, branching, edge cases, or security-sensitive logic changed.
- Return structured output only matching the requested schema.
- If the code looks good, state that clearly in the summary and keep findings empty.
`;

export function buildReviewPrompt({
  reviewInput,
  language,
  focusAreas,
  includeSuggestions,
  repositoryContext,
  changedFilesSummary,
  source
}: BuildPromptParams) {
  return `
Review source: ${source}
Primary language: ${language}
Focus areas: ${focusAreas.length > 0 ? focusAreas.join(", ") : "general review"}
Include fix suggestions: ${includeSuggestions ? "yes" : "no"}

Changed files summary:
${changedFilesSummary || "Not provided."}

Repository context:
${repositoryContext || "No repository context available."}

Review input:
${reviewInput}

Produce:
- summary: short paragraph
- overallRisk: low, medium, or high
- findings: specific, evidence-backed issues only
- missingTests: concise reminders for untested scenarios
- engine: identify the reviewer that produced the result

If includeSuggestions is false, omit recommendation content unless absolutely necessary for clarity.
`;
}
