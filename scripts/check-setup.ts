const envChecks = [
  {
    key: "DATABASE_URL",
    required: false,
    description: "Recommended for persistent review history. Use a hosted Postgres URL such as Neon on Vercel."
  },
  {
    key: "AI_PROVIDER",
    required: false,
    description: "Selects the preferred provider. Supported values: google, openai."
  },
  {
    key: "OPENAI_API_KEY",
    required: false,
    description: "Enables external AI reviews through the Vercel AI SDK."
  },
  {
    key: "OPENAI_MODEL",
    required: false,
    description: "Optional model override. Defaults to gpt-4.1-mini."
  },
  {
    key: "GOOGLE_GENERATIVE_AI_API_KEY",
    required: false,
    description: "Enables Gemini reviews through the Vercel AI SDK Google provider."
  },
  {
    key: "GOOGLE_MODEL",
    required: false,
    description: "Optional Gemini model override. Defaults to gemini-2.5-flash."
  },
  {
    key: "GITHUB_TOKEN",
    required: false,
    description: "Required only for GitHub PR review and publishing."
  },
  {
    key: "ENABLE_GITHUB_PUBLISH",
    required: false,
    description: "Controls whether publish-back mode is allowed."
  },
  {
    key: "REVIEW_MAX_DIFF_CHARS",
    required: false,
    description: "Caps prompt size before AI review."
  }
];

console.log("AI-Powered Code Review Assistant setup check\n");

for (const check of envChecks) {
  const value = process.env[check.key];
  const state = value ? "configured" : check.required ? "missing" : "optional";
  console.log(`${check.key}: ${state}`);
  console.log(`  ${check.description}`);
}

if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.log("\nNo external AI provider is configured.");
  console.log("The app will still work using the local fallback reviewer.");
}

if (!process.env.GITHUB_TOKEN) {
  console.log("\nGitHub token is not configured.");
  console.log("Manual review works normally. GitHub PR review and publish actions will be limited.");
}

if (!process.env.DATABASE_URL) {
  console.log("\nDATABASE_URL is not configured.");
  console.log("The app will still run, but review history persistence may be unavailable.");
}

console.log("\nNext steps:");
console.log("1. Copy .env.example to .env.local and fill in any keys you want to use.");
console.log("2. Run `npx prisma generate`.");
console.log("3. Run `npx prisma db push`.");
console.log("4. Start the app with `npm run dev`.");
