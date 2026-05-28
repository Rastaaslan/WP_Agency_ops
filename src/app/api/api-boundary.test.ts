import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const apiRoot = join(process.cwd(), "src", "app", "api");
const forbiddenRouteTerms = [
  "wordpress.org",
  "PluginSnapshot",
  "WordPressPlugin",
  "WordPressTheme",
  "latestVersion",
  "pluginVersion",
  "pluginSlug",
  "figma",
];

describe("API WPUR boundary", () => {
  it("does not introduce detailed plugin maintenance logic in route handlers", () => {
    const routeFiles = listRouteFiles(apiRoot);

    for (const file of routeFiles) {
      const source = readFileSync(file, "utf8");

      for (const term of forbiddenRouteTerms) {
        expect(source.toLowerCase()).not.toContain(term.toLowerCase());
      }
    }
  });
});

function listRouteFiles(directory: string): string[] {
  return readdirSync(directory, {
    withFileTypes: true,
  }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listRouteFiles(entryPath);
    }

    return entry.name === "route.ts" ? [entryPath] : [];
  });
}
