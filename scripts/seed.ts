import { prisma } from "../lib/db/prisma";

async function main() {
  const count = await prisma.review.count();

  if (count > 0) {
    console.log("Seed skipped. Reviews already exist.");
    return;
  }

  await prisma.review.create({
    data: {
      source: "manual",
      title: "Sample TypeScript Diff Review",
      overallRisk: "medium",
      findingsCount: 2,
      missingTestsCount: 2,
      summary: "Sample review showing how saved review history appears in the UI.",
      rawInput: "diff --git a/src/app.ts b/src/app.ts",
      resultJson: JSON.stringify({
        summary: "Sample review showing how saved review history appears in the UI.",
        overallRisk: "medium",
        findings: [
          {
            title: "Unhandled null path",
            severity: "medium",
            description: "Input validation is missing before accessing nested properties."
          },
          {
            title: "Debug logging left in production path",
            severity: "low",
            description: "console.log appears in a request handler."
          }
        ],
        missingTests: [
          "Add tests for malformed payloads.",
          "Add a regression test for the updated request flow."
        ],
        engine: "seed-data"
      })
    }
  });

  console.log("Seeded sample review.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
