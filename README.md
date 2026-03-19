# AI-Powered Code Review Assistant

A production-style full-stack demo project for structured AI-assisted code review. The app supports manual reviews from pasted code or diffs, GitHub pull request reviews, local repository context retrieval, SQLite-backed history, and a deterministic fallback reviewer when the external model is unavailable.

The project intentionally does not use LangChain. AI orchestration is handled with the Vercel AI SDK and Zod-based structured output validation.

## Features

- Manual review flow for pasted code snippets, patches, and unified diffs
- GitHub PR review flow powered by Octokit
- Structured review output:
  - `summary`
  - `overallRisk`
  - `findings`
  - `missingTests`
  - `engine`
- SQLite + Prisma review history
- Local repository-aware context retrieval with simple relevance ranking
- Automatic fallback to a deterministic local rule engine
- Professional dark dashboard with recent reviews and raw structured output
- Optional GitHub publish-back mode for PR summary comments

## Tech Stack

- Frontend: Next.js App Router + TypeScript
- AI orchestration: Vercel AI SDK
- Model providers: Google Gemini and OpenAI via Vercel AI SDK providers
- Styling: Tailwind CSS
- Backend: Next.js Route Handlers
- Database: Prisma + SQLite
- GitHub integration: Octokit
- Validation: Zod
- Markdown rendering: react-markdown
- Package manager: npm

## How Vercel AI SDK Is Used

The main review pipeline lives in `lib/ai/review-service.ts`.

- `generateObject` is used to request structured review output from the model.
- The response is validated against `reviewResultSchema`.
- Provider interaction is isolated so additional providers can be introduced later.
- When the provider call fails because of missing keys, quota, network, or other runtime errors, the app automatically falls back to `lib/ai/fallback-reviewer.ts`.

This keeps the product functional even without live model access.

## Architecture

### Core flow

1. The user submits either a manual review input or a GitHub PR request.
2. The route handler validates the request with Zod.
3. The review service optionally retrieves relevant local repository files.
4. The review service builds a strict review prompt and calls the Vercel AI SDK.
5. If the model fails, the local rule-based fallback reviewer runs automatically.
6. The result is stored in SQLite through Prisma.
7. The UI renders the structured review, context snippets, and recent history.

### Main folders

```text
/app
  /api
    /manual-review
    /github-pr-review
    /github-publish-review
    /health
    /reviews
  /page.tsx
/components
/lib
  /ai
  /github
  /repository
  /db
  /utils
/prisma
/scripts
/public
```

### Important modules

- `lib/ai/review-schema.ts`
  Defines the structured output schema and request schemas.
- `lib/ai/review-prompts.ts`
  Contains the system prompt and prompt builder.
- `lib/ai/review-service.ts`
  Central review execution and persistence.
- `lib/ai/fallback-reviewer.ts`
  Local deterministic fallback engine.
- `lib/repository/repository-context.ts`
  Local file scanning and simple relevance ranking.
- `lib/github/github-review-service.ts`
  PR fetch and optional publish-back logic.

## API Routes

### `POST /api/manual-review`

Accepts:

- `title`
- `repoContext`
- `changedFiles`
- `diffText`
- `language`
- `focusAreas`
- `includeSuggestions`
- `useLocalContext`

Returns:

- structured review result
- retrieved repository context
- optional fallback reason

### `POST /api/github-pr-review`

Accepts:

- `owner`
- `repo`
- `prNumber`
- `publishReview`
- `focusAreas`
- `includeSuggestions`
- `useLocalContext`
- `language`

Returns:

- structured review result
- retrieved repository context
- optional fallback reason
- optional publish result or publish error

### `POST /api/github-publish-review`

Standalone publishing endpoint for PR summary comments.

### `GET /api/health`

Returns provider and GitHub configuration status for UI display.

### `GET /api/reviews`

Returns the latest saved reviews for the history panel.

## Database

Prisma defines a `Review` model with:

- `id`
- `source`
- `title`
- `repository`
- `pullRequestNumber`
- `overallRisk`
- `findingsCount`
- `missingTestsCount`
- `summary`
- `rawInput`
- `resultJson`
- `createdAt`

## Environment Variables

Copy `.env.example` to `.env.local` and configure as needed.

```env
DATABASE_URL=file:./prisma/dev.db
AI_PROVIDER=google
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
GOOGLE_GENERATIVE_AI_API_KEY=
GOOGLE_MODEL=gemini-2.5-flash
GITHUB_TOKEN=
GITHUB_API_URL=https://api.github.com
ENABLE_GITHUB_PUBLISH=false
REVIEW_MAX_DIFF_CHARS=30000
LOCAL_REPOSITORY_PATH=
```

### Notes

- `AI_PROVIDER=google` makes Gemini the preferred external model.
- `GOOGLE_GENERATIVE_AI_API_KEY` is the primary key for hosted review in the current setup.
- `OPENAI_API_KEY` remains optional and can be used by switching `AI_PROVIDER=openai`.
- `GITHUB_TOKEN` is required for GitHub PR review.
- `ENABLE_GITHUB_PUBLISH=true` is required before publish-back mode is allowed.
- `LOCAL_REPOSITORY_PATH` can point to another local repo if you want context retrieval against a different codebase.

## Running Locally

### Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Run the setup check script.
4. Generate the Prisma client.
5. Push the Prisma schema to SQLite.
6. Optionally seed sample history.
7. Start the Next.js dev server.

### Commands

```bash
npm install
npm run check-setup
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## Deployment

This project is best deployed to a container host with a persistent disk because it uses SQLite.

Recommended targets:

- Render Web Service + persistent disk
- Railway + mounted volume
- A VPS with Docker

Vercel is not the right default target for this project because SQLite writes are not durable in the serverless runtime.

### Required environment variables for deployment

```env
DATABASE_URL=file:/data/dev.db
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=your_key
GOOGLE_MODEL=gemini-2.5-flash
GITHUB_TOKEN=
GITHUB_API_URL=https://api.github.com
ENABLE_GITHUB_PUBLISH=false
REVIEW_MAX_DIFF_CHARS=30000
LOCAL_REPOSITORY_PATH=
```

### Container start behavior

The production start command is:

```bash
npm run start:prod
```

That command:

1. Pushes the Prisma schema to SQLite
2. Generates the Prisma client
3. Starts Next.js on the configured `PORT`

### Render example

This repo includes [`render.yaml`](./render.yaml), so Render can auto-detect most service settings.

1. Create a new Web Service from the GitHub repo.
2. Let Render use the included `render.yaml`.
3. Confirm the persistent disk is mounted at `/data`.
4. Set `GOOGLE_GENERATIVE_AI_API_KEY` in the Render dashboard.
5. Deploy.
6. Open `/api/health` after deployment and confirm the provider is `google`.

### Railway example

1. Create a new project from this repo or uploaded source.
2. Use the included `Dockerfile`.
3. Mount a persistent volume at `/data`.
4. Set `DATABASE_URL=file:/data/dev.db`.
5. Set your Gemini key in `GOOGLE_GENERATIVE_AI_API_KEY`.
6. Deploy.

### Deployment checklist

See [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) for a short pre-deploy and post-deploy checklist.

## Manual Review Demo

1. Open the dashboard.
2. Stay on the `Manual Review` tab.
3. Paste a code snippet, patch, or unified diff.
4. Choose the primary language.
5. Optionally add:
   - repository context
   - changed file summary
   - focus areas
6. Submit the review.
7. Inspect summary, risk, findings, missing tests, raw JSON, retrieved context, and history.

### Example input idea

Paste a diff containing:

- a hardcoded secret
- a `console.log`
- a broad `catch`

If the external model is unavailable, the fallback engine should still produce structured findings.

## GitHub PR Review Demo

1. Set `GITHUB_TOKEN` in `.env.local`.
2. Open the `GitHub PR Review` tab.
3. Enter:
   - owner
   - repository
   - pull request number
4. Leave publish mode off to preview in the UI.
5. Submit the review.
6. Inspect the generated result and saved history.
7. If `ENABLE_GITHUB_PUBLISH=true`, enable publish mode and submit again to post the summary comment.

## Fallback Mode

Fallback mode is triggered when:

- `OPENAI_API_KEY` is missing
- the provider returns an error
- the request cannot reach the model
- structured generation fails

The fallback engine checks for:

- hardcoded secrets
- debug statements
- broad exception handling
- shell execution or dynamic evaluation
- obvious write-path risk signals
- missing test reminders

The fallback result matches the same response schema as AI-generated reviews.

## Repository Context Retrieval

The MVP retrieval system scans local files and ranks them using simple keyword overlap against the review input.

- It ignores heavy directories like `.git`, `.next`, `node_modules`, and `dist`.
- It returns a small set of relevant file excerpts.
- Retrieved snippets are injected into the AI review prompt.

An optional indexing helper script is also included:

```bash
npm run build-repository-index
```

This writes a lightweight preview index to `public/repository-index.json`.

## Scripts

- `npm run check-setup`
  Validates important environment configuration and explains degraded modes.
- `npm run seed`
  Seeds one demo review row into SQLite.
- `npm run build-repository-index`
  Creates a lightweight local repository preview index.

## UI Overview

The dashboard is designed for demos and interviews:

- Dark theme with a strong presentation-friendly hero section
- Sidebar controls for language, focus areas, suggestions, local context, and status
- Tabs for manual review and GitHub PR review
- Result panels for summary, risk, engine, findings, missing tests, raw output, and retrieved context
- Recent review history stored in SQLite

## Limitations

- Repository retrieval uses basic lexical relevance ranking rather than embeddings.
- GitHub publishing currently posts a summary comment rather than inline review annotations.
- Large pull requests are truncated using `REVIEW_MAX_DIFF_CHARS`.
- No authentication layer is included for end users in this MVP.
- No background job queue is included for long-running reviews.
- No test suite is included in this starter scaffold.

## Next Steps

- Add authentication and per-user review history
- Add embeddings-based repository retrieval and caching
- Add inline GitHub review comments per file/line
- Support multiple model providers behind the same review service interface
- Add streaming structured output in the UI with `streamObject`
- Add evaluation fixtures for the fallback reviewer and prompt regression tests
- Add rate limiting and audit logs for production hardening

## Project Goal

This project is structured to be understandable, demo-friendly, and realistic enough for learning and portfolio use. It demonstrates how to build a reliable AI product around structured generation, provider isolation, graceful fallback behavior, and full-stack application design without depending on LangChain.
