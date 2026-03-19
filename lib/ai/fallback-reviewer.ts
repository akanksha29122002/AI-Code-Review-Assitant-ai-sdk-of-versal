import type { ReviewResult } from "@/lib/ai/review-schema";

type FallbackParams = {
  input: string;
  language: string;
  includeSuggestions: boolean;
  source: "manual" | "github";
};

type RuleMatch = {
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
  recommendation?: string;
  pattern: RegExp;
};

const RULES: RuleMatch[] = [
  {
    title: "Potential hardcoded secret",
    severity: "high",
    description:
      "The change appears to include a token, password, secret, or private key literal. Hardcoded credentials are a direct security risk.",
    recommendation: "Move secrets into environment variables or a secrets manager and rotate any exposed values.",
    pattern: /(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"'\n]{8,}["']|-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/i
  },
  {
    title: "Debug statement left in code",
    severity: "low",
    description:
      "Debug logging or debugger statements were found. These can leak data or create noisy production logs.",
    recommendation: "Remove the statement or guard it behind development-only instrumentation.",
    pattern: /\b(console\.(log|debug)|debugger|print\()/
  },
  {
    title: "Overly broad exception handling",
    severity: "medium",
    description:
      "A broad catch or generic exception handler was detected. This can hide failures and make troubleshooting harder.",
    recommendation: "Catch narrower exception types and either rethrow or attach meaningful context.",
    pattern: /catch\s*\((e|err|error)?\)\s*\{|\bexcept\s*:\s*|\bexcept Exception\b/i
  },
  {
    title: "Shell execution or dynamic evaluation",
    severity: "high",
    description:
      "Dynamic code execution or shell execution patterns were found. These paths are often security-sensitive and need strict input validation.",
    recommendation: "Avoid dynamic execution where possible and validate, sanitize, and constrain inputs before invocation.",
    pattern: /\b(eval|exec|spawn|child_process|os\.system|subprocess\.)\b/i
  },
  {
    title: "Forceful database write without transaction cues",
    severity: "medium",
    description:
      "The code appears to make direct write operations that may need transaction boundaries or rollback handling.",
    recommendation: "Review whether the write path needs atomicity, retries, or idempotency guarantees.",
    pattern: /\b(insert|update|delete|upsert|create)\b.*\b(db|database|prisma|sql|query)\b/i
  }
];

export function runFallbackReviewer({
  input,
  language,
  includeSuggestions,
  source
}: FallbackParams): ReviewResult {
  const findings = RULES.filter((rule) => rule.pattern.test(input)).map((rule) => ({
    title: rule.title,
    severity: rule.severity,
    description: rule.description,
    recommendation: includeSuggestions ? rule.recommendation : undefined
  }));

  const missingTests = buildMissingTests(input, source, language);
  const summary =
    findings.length > 0
      ? `Fallback reviewer detected ${findings.length} potential issue(s). Review these findings manually because the deterministic engine is intentionally conservative.`
      : "Fallback reviewer did not detect any obvious issues in the provided code or diff. A deeper model-driven review was unavailable, so this result should be treated as a lightweight safety net.";

  return {
    summary,
    overallRisk: findings.some((item) => item.severity === "high")
      ? "high"
      : findings.some((item) => item.severity === "medium")
        ? "medium"
        : "low",
    findings,
    missingTests,
    engine: "local-rule-engine"
  };
}

function buildMissingTests(input: string, source: "manual" | "github", language: string) {
  const tests = new Set<string>();

  if (!/test|spec|describe|it\(|pytest|unittest|jest|vitest/i.test(input)) {
    tests.add("Add coverage for the primary success path and at least one failing or edge-case path.");
  }

  if (/auth|token|password|secret|permission|role/i.test(input)) {
    tests.add("Add authorization and security-focused tests for invalid credentials, missing permissions, and secret-handling paths.");
  }

  if (/catch|except|throw|error|reject/i.test(input)) {
    tests.add("Add tests for failure handling to confirm errors are surfaced, logged, or retried correctly.");
  }

  if (/if\s*\(|switch\s*\(|\?.*:/.test(input)) {
    tests.add("Add branch coverage for the updated conditionals and edge-case inputs.");
  }

  if (source === "github") {
    tests.add("Add an integration-level regression test covering the pull request behavior end to end.");
  }

  if (/sql|query|mutation|create|update|delete/i.test(input)) {
    tests.add("Add tests validating persistence behavior, including duplicates, rollbacks, and invalid payloads.");
  }

  if (language.toLowerCase().includes("typescript") || language.toLowerCase().includes("javascript")) {
    tests.add("Add tests for nullish, undefined, and malformed inputs where the changed code accepts external data.");
  }

  return Array.from(tests);
}
