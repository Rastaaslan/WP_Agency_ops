import { describe, expect, it } from "vitest";
import { summarizeScanResult } from "./scanner";

describe("summarizeScanResult", () => {
  it("counts plugins, themes, updates and warnings", () => {
    const summary = summarizeScanResult({
      detected: true,
      siteUrl: "https://example.com",
      wpVersion: "6.8.1",
      plugins: [
        { name: "SEO", updateAvailable: true },
        { name: "Forms", updateAvailable: false },
      ],
      themes: [{ name: "Theme", updateAvailable: false }],
      updates: [{ kind: "core", label: "Core update" }],
      warnings: [
        { code: "info", message: "Info", severity: "info" },
        { code: "warn", message: "Warn", severity: "warning" },
      ],
      securityHints: [],
      performanceHints: [],
    });

    expect(summary.pluginCount).toBe(2);
    expect(summary.themeCount).toBe(1);
    expect(summary.updateCount).toBe(2);
    expect(summary.warningCount).toBe(1);
  });
});
