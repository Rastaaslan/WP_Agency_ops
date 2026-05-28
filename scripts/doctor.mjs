import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const checks = [];

function run(command, args = []) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
}

function addCheck(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

function commandOutput(command, args = []) {
  const result = run(command, args);
  return {
    ok: result.status === 0,
    text: (result.stdout || result.stderr || "").trim(),
  };
}

const nodeVersion = process.versions.node;
const majorNodeVersion = Number(nodeVersion.split(".")[0]);
addCheck(
  "Node.js >= 22",
  majorNodeVersion >= 22,
  `detected ${nodeVersion}`,
);

const npm = commandOutput("npm", ["--version"]);
addCheck("npm available", npm.ok, npm.text);

addCheck(".env.example present", existsSync(".env.example"));
addCheck("Prisma schema present", existsSync("prisma/schema.prisma"));
addCheck("Prisma migration present", existsSync("prisma/migrations"));
addCheck(
  "WordPress companion plugin present",
  existsSync("wordpress-plugin/wp-agency-ops-companion/wp-agency-ops-companion.php"),
);

const prismaGenerate = commandOutput("npx", ["prisma", "validate"]);
addCheck("Prisma schema validates", prismaGenerate.ok, prismaGenerate.text);

const pluginLint = commandOutput("npm", ["run", "plugin:lint"]);
addCheck("Plugin PHP syntax check", pluginLint.ok, pluginLint.text);

const failed = checks.filter((check) => !check.passed);

for (const check of checks) {
  const icon = check.passed ? "OK" : "FAIL";
  console.log(`${icon} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} check(s) failed.`);
  process.exit(1);
}

console.log("\nEnvironment looks ready.");
