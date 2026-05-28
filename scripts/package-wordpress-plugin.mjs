import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const pluginDir = resolve("wordpress-plugin", "wp-agency-ops-companion");
const outputFile = resolve("dist", "wp-agency-ops-companion.zip");

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
    ...options,
  });
}

function commandWorks(command, args = ["--version"]) {
  const result = run(command, args);
  return result.status === 0;
}

function fail(message, result) {
  console.error(message);
  if (result?.stdout) {
    console.error(result.stdout);
  }
  if (result?.stderr) {
    console.error(result.stderr);
  }
  process.exit(1);
}

if (!existsSync(pluginDir)) {
  fail(`Plugin directory not found: ${pluginDir}`);
}

mkdirSync(dirname(outputFile), { recursive: true });

if (existsSync(outputFile)) {
  rmSync(outputFile, { force: true });
}

if (commandWorks("zip", ["-v"])) {
  const result = run(
    "zip",
    [
      "-r",
      outputFile,
      "wp-agency-ops-companion",
      "-x",
      "**/.DS_Store",
      "**/__MACOSX/**",
    ],
    { cwd: resolve("wordpress-plugin") },
  );

  if (result.status !== 0) {
    fail("zip failed to package the plugin.", result);
  }
} else if (process.platform === "win32" && commandWorks("powershell", ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"])) {
  const result = run("powershell", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    `Compress-Archive -LiteralPath '${pluginDir.replaceAll("'", "''")}' -DestinationPath '${outputFile.replaceAll("'", "''")}' -Force`,
  ]);

  if (result.status !== 0) {
    fail("Compress-Archive failed to package the plugin.", result);
  }
} else {
  fail("No zip tool found. Install zip or use PowerShell with Compress-Archive.");
}

console.log(`Packaged ${outputFile}`);
