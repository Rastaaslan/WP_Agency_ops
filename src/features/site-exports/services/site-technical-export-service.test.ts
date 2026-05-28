import { beforeEach, describe, expect, it, vi } from "vitest";
import { exportSiteTechnicalState } from "./site-technical-export-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    site: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("site technical export service", () => {
  beforeEach(() => {
    prismaMock.site.findUnique.mockReset();
  });

  it("exports global technical state with WPUR in a separated block", async () => {
    const wpurSummary = {
      periodMonth: "2026-05",
      alertCount: 1,
    };

    prismaMock.site.findUnique.mockResolvedValue({
      id: "site_1",
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
      environment: "production",
      status: "active",
      notes: null,
      createdAt: new Date("2026-05-28T00:00:00.000Z"),
      updatedAt: new Date("2026-05-28T00:00:00.000Z"),
      client: {
        id: "client_1",
        name: "Client Demo",
      },
      interventions: [
        {
          id: "intervention_1",
          title: "Maintenance globale",
          items: [],
        },
      ],
      wpurImports: [
        {
          id: "wpur_import_1",
          periodMonth: "2026-05",
          summaryJson: wpurSummary,
        },
      ],
      backups: [
        {
          id: "backup_1",
          type: "full",
          status: "done",
          performedAt: new Date("2026-05-28T08:00:00.000Z"),
          provider: "Hebergeur Demo",
          notes: "Sauvegarde manuelle documentee.",
          intervention: {
            id: "intervention_1",
            title: "Maintenance globale",
          },
        },
      ],
      watchedForms: [
        {
          id: "form_1",
          name: "Contact principal",
          pageUrl: "https://example.com/contact",
          status: "ok",
          lastCheckedAt: new Date("2026-05-28T10:00:00.000Z"),
          expectedRecipients: "contact@example.com",
          notes: "Verification manuelle OK.",
        },
      ],
    });

    const exportState = await exportSiteTechnicalState("site_1");

    expect(prismaMock.site.findUnique).toHaveBeenCalledWith({
      where: { id: "site_1" },
      include: {
        client: true,
        interventions: {
          include: {
            items: true,
          },
          orderBy: {
            date: "desc",
          },
        },
        wpurImports: {
          orderBy: {
            importedAt: "desc",
          },
          take: 1,
        },
        backups: {
          include: {
            intervention: true,
          },
          orderBy: {
            performedAt: "desc",
          },
          take: 5,
        },
        watchedForms: {
          orderBy: [
            {
              status: "asc",
            },
            {
              name: "asc",
            },
          ],
        },
      },
    });
    expect(exportState).toMatchObject({
      client: {
        id: "client_1",
      },
      site: {
        id: "site_1",
      },
      interventions: [
        {
          id: "intervention_1",
        },
      ],
      wpur: {
        import: {
          id: "wpur_import_1",
        },
        summary: wpurSummary,
      },
      security: [],
      performance: [],
      forms: [
        {
          id: "form_1",
          status: "ok",
        },
      ],
      backups: [
        {
          id: "backup_1",
          status: "done",
          type: "full",
        },
      ],
    });
  });
});
