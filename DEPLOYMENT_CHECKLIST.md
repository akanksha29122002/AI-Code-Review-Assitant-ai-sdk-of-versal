# Deployment Checklist

## Before Deploying

- Rotate any API keys that were exposed in screenshots, chat messages, or terminal output.
- Confirm `.env.local` is not committed.
- Confirm `.env.example` contains only blank template values.
- Confirm `npm run build` passes locally.
- Confirm the target GitHub repo contains the latest commit.

## Required Environment Variables

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=require
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=your_rotated_key
GOOGLE_MODEL=gemini-2.5-flash
GITHUB_TOKEN=
GITHUB_API_URL=https://api.github.com
ENABLE_GITHUB_PUBLISH=false
REVIEW_MAX_DIFF_CHARS=30000
LOCAL_REPOSITORY_PATH=
```

## Render Checklist

- Create a new Web Service from the GitHub repo.
- Let Render detect the included `render.yaml`.
- Use Docker runtime.
- Create a hosted Postgres database such as Neon.
- Verify `DATABASE_URL` points to that Postgres instance.
- Add `GOOGLE_GENERATIVE_AI_API_KEY`.
- Deploy.
- Open `/api/health` after deployment and verify:
  - `providerConfigured: true`
  - `provider: "google"`

## Railway Checklist

- Create a new project from the GitHub repo.
- Use the included `Dockerfile`.
- Create or connect a hosted Postgres database.
- Set `DATABASE_URL` to the Postgres connection string.
- Add `GOOGLE_GENERATIVE_AI_API_KEY`.
- Deploy.
- Open `/api/health` after deployment and verify provider status.

## Vercel + Neon Checklist

- Create a free Neon Postgres project.
- Copy the pooled `DATABASE_URL`.
- Import the GitHub repo into Vercel.
- Add `DATABASE_URL` in Vercel project settings.
- Add `AI_PROVIDER=google`.
- Add `GOOGLE_GENERATIVE_AI_API_KEY`.
- Deploy.
- Open `/api/health` and verify:
  - `providerConfigured: true`
  - `provider: "google"`
  - `persistence.databaseAvailable: true`

## Post-Deploy Smoke Test

- Open the home page and confirm the dashboard loads.
- Run one manual review.
- Confirm the result shows `engine: google:gemini-2.5-flash`.
- Confirm recent review history updates.
- If GitHub review is enabled, test one PR in preview mode before enabling publish mode.

## Production Notes

- Hosted Postgres is the recommended production persistence layer.
- Vercel + Neon is the simplest free deployment path for durable review history.
- If you want horizontal scaling later, Postgres remains the right base choice.
