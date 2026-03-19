import fs from "node:fs/promises";
import path from "node:path";

const rootPath = process.env.LOCAL_REPOSITORY_PATH || process.cwd();
const outputPath = path.join(process.cwd(), "public", "repository-index.json");

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if ([".git", ".next", "node_modules", "dist", "build"].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && /\.(ts|tsx|js|jsx|md|json|py|go|java|rb|rs)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const files = await collectFiles(rootPath);
  const index = [];

  for (const file of files) {
    try {
      const content = await fs.readFile(file, "utf8");
      index.push({
        filePath: path.relative(rootPath, file),
        preview: content.slice(0, 1200)
      });
    } catch {
      // Ignore files that cannot be indexed.
    }
  }

  await fs.writeFile(outputPath, JSON.stringify(index, null, 2), "utf8");
  console.log(`Wrote ${index.length} indexed entries to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
