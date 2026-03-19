import { Octokit } from "@octokit/rest";

export function createGitHubClient() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return null;
  }

  return new Octokit({
    auth: token,
    baseUrl: process.env.GITHUB_API_URL || "https://api.github.com"
  });
}
