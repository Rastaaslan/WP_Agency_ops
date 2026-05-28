import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/client", () => ({
  prisma: {
    wordPressSite: {
      findUniqueOrThrow: vi.fn(async () => ({
        id: "site_1",
        name: "Site Demo",
        url: "https://example.com",
        environment: "production",
        status: "active",
        connectionType: "manual",
        connectionStatus: "unknown",
        lastScanAt: new Date("2026-05-20T10:00:00.000Z"),
        notes: "Site suivi.",
        client: {
          id: "client_1",
          name: "Client",
          companyName: "Client Co",
          status: "active",
        },
        securityChecks: [{ id: "security_1", status: "ok" }],
        performanceChecks: [{ id: "performance_1", status: "ok" }],
        forms: [{ id: "form_1", name: "Contact" }],
        backupRecords: [{ id: "backup_1", status: "ok" }],
        interventions: [{ id: "intervention_1", title: "Maintenance", items: [] }],
        wpurImports: [{ id: "wpur_1", periodMonth: "2026-05", summaryJson: { pluginCount: 4 } }],
      })),
    },
  },
}));

describe("PrismaSiteTechnicalExportService", () => {
  it("exports the global site technical state", async () => {
    const { PrismaSiteTechnicalExportService } = await import("./site-technical-export");
    const service = new PrismaSiteTechnicalExportService();
    const exported = await service.exportSiteTechnicalState("site_1");

    expect(exported.client.companyName).toBe("Client Co");
    expect(exported.site.lastScanAt).toBe("2026-05-20T10:00:00.000Z");
    expect(exported.backups).toHaveLength(1);
    expect(exported.latestWpurImport).toEqual(expect.objectContaining({ id: "wpur_1" }));
  });
});

