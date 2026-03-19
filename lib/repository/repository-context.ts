import fs from "node:fs/promises";
import path from "node:path";

const MAX_FILE_SIZE = 16_000;
const MAX_RESULTS = 4;
const SKIP_DIRECTORIES = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo"
]);

export type RetrievedContext = {
  filePath: string;
  score: number;
  excerpt: string;
};

export async function retrieveRepositoryContext(params: {
  query: string;
  limit?: number;
  rootPath?: string;
}) {
  const rootPath = params.rootPath || process.env.LOCAL_REPOSITORY_PATH || process.cwd();
  const files = await collectFiles(rootPath);
  const scored: RetrievedContext[] = [];

  for (const filePath of files) {
    try {
      const relativePath = path.relative(rootPath, filePath);
      const content = await fs.readFile(filePath, "utf8");
      const excerpt = content.slice(0, MAX_FILE_SIZE);
      const score = scoreDocument(params.query, `${relativePath}\n${excerpt}`);

      if (score > 0) {
        scored.push({ filePath: relativePath, score, excerpt });
      }
    } catch {
      // Ignore unreadable files in MVP context retrieval.
    }
  }

  return scored
    .sort((left, right) => right.score - left.score)
    .slice(0, params.limit ?? MAX_RESULTS);
}

async function collectFiles(rootPath: string): Promise<string[]> {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (SKIP_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (/\.(ts|tsx|js|jsx|json|md|py|go|java|rb|rs|yml|yaml|sql|sh)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function scoreDocument(query: string, content: string) {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9_/-]+/)
    .filter((term) => term.length >= 3);

  if (terms.length === 0) {
    return 0;
  }

  const normalized = content.toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (normalized.includes(term)) {
      score += 1;
    }
  }

  return score;
}

export function formatRetrievedContext(context: RetrievedContext[]) {
  if (context.length === 0) {
    return "";
  }

  return context
    .map(
      (entry) =>
        `File: ${entry.filePath}\nRelevance: ${entry.score}\nExcerpt:\n${entry.excerpt.slice(0, 1800)}`
    )
    .join("\n\n---\n\n");
}
