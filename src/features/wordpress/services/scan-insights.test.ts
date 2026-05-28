import { describe, expect, it } from "vitest";
import { enrichScanResult } from "./scan-insights";
import type { WordPressScanResult } from "../types";

const baseResult: WordPressScanResult = {
  detected: true,
  connectionType: "companion_plugin",
  siteUrl: "https://example.com",
  plugins: [],
  themes: [],
  updates: [],
  warnings: [],
  recommendations: [],
  securityHints: [],
  performanceHints: [],
};

describe("enrichScanResult", () => {
  it("adds calm warnings and recommendations for update-heavy scans", () => {
    const result = enrichScanResult({
      ...baseResult,
      environment: "production",
      debugEnabled: true,
      plugins: [
        {
          name: "Forms Pro",
          active: true,
          updateAvailable: true,
          version: "2.9.1",
          newVersion: "2.10.0",
        },
        {
          name: "Old Gallery",
          active: false,
          updateAvailable: false,
        },
      ],
      themes: [
        {
          name: "Client Theme",
          active: true,
          updateAvailable: true,
        },
      ],
      updates: [
        {
          kind: "core",
          label: "WordPress 6.8.2",
          currentVersion: "6.8.1",
          newVersion: "6.8.2",
        },
      ],
    });

    expect(result.warnings.map((warning) => warning.code)).toContain(
      "wordpress_update_available",
    );
    expect(result.warnings.map((warning) => warning.code)).toContain(
      "debug_enabled",
    );
    expect(result.recommendations.map((recommendation) => recommendation.code)).toContain(
      "backup_before_maintenance",
    );
    expect(result.recommendations.map((recommendation) => recommendation.code)).toContain(
      "review_inactive_plugins",
    );
  });
});
