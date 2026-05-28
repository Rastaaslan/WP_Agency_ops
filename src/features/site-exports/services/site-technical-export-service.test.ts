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
      securityChecks: [
        {
          id: "security_1",
          status: "warning",
          checkedAt: new Date("2026-05-28T10:30:00.000Z"),
          httpsEnabled: true,
          hstsHeader: false,
          cspHeader: false,
          xFrameOptionsHeader: true,
          xContentTypeOptionsHeader: true,
          xmlrpcAccessible: false,
          readmeAccessible: false,
          summary: "À surveiller.",
        },
      ],
      performanceChecks: [
        {
          id: "performance_1",
          status: "ok",
          checkedAt: new Date("2026-05-28T10:45:00.000Z"),
          httpStatus: 200,
          responseTimeMs: 420,
          contentLengthBytes: 1256,
          summary:
            "Réponse rapide : le site répond dans un délai raisonnable.",
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
        securityChecks: {
          orderBy: {
            checkedAt: "desc",
          },
          take: 5,
        },
        performanceChecks: {
          orderBy: {
            checkedAt: "desc",
          },
          take: 5,
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
      security: {
        latest: {
          id: "security_1",
          status: "warning",
        },
        history: [
          {
            id: "security_1",
          },
        ],
      },
      performance: {
        latest: {
          id: "performance_1",
          status: "ok",
        },
        history: [
          {
            id: "performance_1",
          },
        ],
      },
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
