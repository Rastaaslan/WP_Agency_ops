import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const pluginFile =
  "wordpress-plugin/wp-agency-ops-companion/wp-agency-ops-companion.php";

function commandWorks(command) {
  const result = spawnSync(command, ["-v"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  return result.status === 0;
}

function findWingetPhp() {
  if (process.platform !== "win32" || !process.env.LOCALAPPDATA) {
    return null;
  }

  const packagesDir = join(
    process.env.LOCALAPPDATA,
    "Microsoft",
    "WinGet",
    "Packages",
  );

  if (!existsSync(packagesDir)) {
    return null;
  }

  const packageNames = readdirSync(packagesDir)
    .filter((name) => name.startsWith("PHP.PHP."))
    .sort()
    .reverse();

  for (const packageName of packageNames) {
    const phpPath = join(packagesDir, packageName, "php.exe");
    if (existsSync(phpPath)) {
      return phpPath;
    }
  }

  return null;
}

const php = commandWorks("php") ? "php" : findWingetPhp();

if (!php) {
  console.error(
    "PHP CLI was not found. Install PHP or add it to PATH, then retry npm run plugin:lint.",
  );
  process.exit(1);
}

const lint = spawnSync(php, ["-l", pluginFile], {
  encoding: "utf8",
  shell: false,
});

if (lint.stdout) {
  process.stdout.write(lint.stdout);
}

if (lint.stderr) {
  process.stderr.write(lint.stderr);
}

process.exit(lint.status ?? 1);
