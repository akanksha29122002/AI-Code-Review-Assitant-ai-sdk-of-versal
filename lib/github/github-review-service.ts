import { AppError } from "@/lib/utils/errors";
import { createGitHubClient } from "@/lib/github/github-client";

export async function fetchPullRequestReviewInput(params: {
  owner: string;
  repo: string;
  prNumber: number;
}) {
  const client = createGitHubClient();

  if (!client) {
    throw new AppError("GitHub token is not configured.", 400);
  }

  const [pullRequest, filesResponse] = await Promise.all([
    client.pulls.get({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber
    }),
    client.pulls.listFiles({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.prNumber,
      per_page: 100
    })
  ]);

  const changedFilesSummary = filesResponse.data
    .map(
      (file) =>
        `${file.filename} (${file.status}, +${file.additions}/-${file.deletions})`
    )
    .join("\n");

  const diffText = filesResponse.data
    .map(
      (file) =>
        `File: ${file.filename}\nStatus: ${file.status}\nPatch:\n${file.patch || "Patch unavailable for this file."}`
    )
    .join("\n\n");

  return {
    title: `${params.owner}/${params.repo} PR #${params.prNumber}: ${pullRequest.data.title}`,
    repository: `${params.owner}/${params.repo}`,
    pullRequestNumber: params.prNumber,
    changedFilesSummary,
    diffText,
    metadata: {
      title: pullRequest.data.title,
      body: pullRequest.data.body || "",
      headSha: pullRequest.data.head.sha,
      htmlUrl: pullRequest.data.html_url
    }
  };
}

export async function publishPullRequestSummary(params: {
  owner: string;
  repo: string;
  prNumber: number;
  body: string;
}) {
  const client = createGitHubClient();

  if (!client) {
    throw new AppError("GitHub token is not configured.", 400);
  }

  const publishEnabled = process.env.ENABLE_GITHUB_PUBLISH === "true";

  if (!publishEnabled) {
    throw new AppError("GitHub review publishing is disabled by configuration.", 400);
  }

  const response = await client.issues.createComment({
    owner: params.owner,
    repo: params.repo,
    issue_number: params.prNumber,
    body: params.body
  });

  return {
    id: response.data.id,
    htmlUrl: response.data.html_url
  };
}
