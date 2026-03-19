import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";

await run("npx", ["prisma", "db", "push"]);
await run("npx", ["prisma", "generate"]);
await run("npx", ["next", "start", "-p", port], { waitForExit: true });

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env
    });

    if (!options.waitForExit) {
      child.on("spawn", resolve);
    }

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}
