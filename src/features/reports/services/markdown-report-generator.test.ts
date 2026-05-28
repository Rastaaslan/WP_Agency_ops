import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/client", () => ({
  prisma: {
    wordPressSite: {
      findUniqueOrThrow: vi.fn(async () => ({
        name: "Site Demo",
        url: "https://example.com",
        client: { name: "Client", companyName: "Client Co" },
        scans: [],
        interventions: [
          {
            title: "Maintenance mensuelle",
            status: "done",
            clientSummary: "Maintenance realisee.",
            description: null,
          },
        ],
        performanceChecks: [],
        securityChecks: [],
        forms: [],
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

    expect(report.markdownContent).toContain("## Actions realisees");
    expect(report.markdownContent).toContain("Maintenance mensuelle");
    expect(report.htmlContent).toContain("<h1>");
  });
});
