import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/client", () => ({
  prisma: {
    wordPressSite: {
      findUniqueOrThrow: vi.fn(async () => ({
        name: "Site Demo",
        url: "https://example.com",
        environment: "production",
        client: { name: "Client", companyName: "Client Co" },
        scans: [
          {
            status: "success",
            createdAt: new Date("2026-05-20"),
            errorMessage: null,
            summaryJson: {
              wpVersion: "6.8.1",
              phpVersion: "8.3",
              activeTheme: "Client Theme",
              updateCount: 1,
            },
            rawJson: {
              recommendations: [
                {
                  message: "Prevoir une mise a jour des extensions.",
                },
              ],
            },
            plugins: [
              {
                name: "Forms Pro",
                version: "2.9.1",
                newVersion: "2.10.0",
                updateAvailable: true,
              },
            ],
            themes: [],
          },
        ],
        interventions: [
          {
            title: "Maintenance mensuelle",
            status: "done",
            clientSummary: "Maintenance realisee.",
            description: null,
            items: [],
          },
        ],
        performanceChecks: [],
        securityChecks: [],
        forms: [],
        backupRecords: [
          {
            checkedAt: new Date("2026-05-20"),
            filesBackedUp: true,
            databaseBackedUp: true,
            status: "ok",
          },
        ],
        wpurImports: [
          {
            periodMonth: "2026-05",
            summaryJson: {
              pluginCount: 3,
              alertCount: 1,
            },
          },
        ],
      })),
    },
  },
}));

describe("MarkdownReportGenerator", () => {
  it("generates readable Markdown and HTML", async () => {
    const { MarkdownReportGenerator } = await import("./markdown-report-generator");
    const generator = new MarkdownReportGenerator();
    const report = await generator.generateSiteReport({
      siteId: "site_1",
      periodStart: new Date("2026-05-01"),
      periodEnd: new Date("2026-05-31"),
    });

    expect(report.markdownContent).toContain("## Etat general");
    expect(report.markdownContent).toContain("Maintenance mensuelle");
    expect(report.markdownContent).toContain("Version WordPress : 6.8.1");
    expect(report.markdownContent).toContain("## WPUR / Plugins");
    expect(report.markdownContent).toContain("## Sauvegardes");
    expect(report.htmlContent).toContain("<h1>");
  });
});
