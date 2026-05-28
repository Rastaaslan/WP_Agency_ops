import { describe, expect, it, vi } from "vitest";

const createMock = vi.fn(async (input) => ({
  id: "wpur_import_1",
  ...input.data,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    wpurImport: {
      create: createMock,
    },
  },
}));

describe("importWpurPayload", () => {
  it("validates, summarizes and stores a WPUR import", async () => {
    const { importWpurPayload } = await import("./importer");
    const result = await importWpurPayload(
      "site_1",
      JSON.stringify({
        schemaVersion: "1.0",
        reportType: "monthly_maintenance_matrix",
        period: { month: "2026-05", label: "Mai 2026" },
        client: { name: "Client Demo" },
        site: { url: "https://example.com" },
        maintenanceDates: ["2026-05-06"],
        sections: [
          {
            title: "Plugins",
            rows: [
              {
                label: "SEO Toolkit",
                targetType: "plugin",
                targetSlug: "seo-toolkit",
                checks: { updated: true },
              },
            ],
          },
        ],
        alerts: [],
        notes: [],
      }),
    );

    expect(result.periodMonth).toBe("2026-05");
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          siteId: "site_1",
          periodMonth: "2026-05",
          summaryJson: expect.objectContaining({ pluginCount: 1 }),
        }),
      }),
    );
  });
});

