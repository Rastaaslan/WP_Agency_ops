import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardSummary } from "@/features/dashboard/services/dashboard-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    backupRecord: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    client: {
      count: vi.fn(),
    },
    intervention: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    performanceCheck: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    securityCheck: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    site: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    watchedForm: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    wpurImport: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("dashboard service", () => {
  beforeEach(() => {
    for (const model of Object.values(prismaMock)) {
      for (const method of Object.values(model)) {
        method.mockReset();
      }
    }
  });

  it("aggregates cockpit data without expanding WPUR plugin details", async () => {
    prismaMock.client.count.mockResolvedValue(3);
    prismaMock.site.count.mockResolvedValue(8);
    prismaMock.intervention.count.mockResolvedValue(2);
    prismaMock.backupRecord.count.mockResolvedValue(4);
    prismaMock.watchedForm.count.mockResolvedValue(5);
    prismaMock.securityCheck.count.mockResolvedValue(6);
    prismaMock.performanceCheck.count.mockResolvedValue(7);

    prismaMock.wpurImport.findMany.mockImplementation((args) => {
      if ("select" in args) {
        return Promise.resolve([{ siteId: "site_1" }, { siteId: "site_2" }]);
      }

      return Promise.resolve([
        {
          id: "wpur_1",
          periodMonth: "2026-05",
          importedAt: new Date("2026-05-28T10:00:00.000Z"),
          summaryJson: {
            alertCount: 1,
          },
          site: {
            id: "site_1",
            name: "Site Demo",
            client: {
              id: "client_1",
              name: "Client Demo",
            },
          },
        },
      ]);
    });
    prismaMock.backupRecord.findMany.mockImplementation((args) => {
      if ("select" in args) {
        return Promise.resolve([{ siteId: "site_1" }, { siteId: "site_3" }]);
      }

      return Promise.resolve([
        {
          id: "backup_1",
          status: "failed",
          type: "full",
          site: {
            id: "site_3",
            name: "Site sauvegarde",
            client: null,
          },
        },
      ]);
    });
    prismaMock.securityCheck.findMany.mockImplementation((args) => {
      if ("select" in args) {
        return Promise.resolve([{ siteId: "site_4" }]);
      }

      return Promise.resolve([
        {
          id: "security_1",
          status: "warning",
          site: {
            id: "site_4",
            name: "Site securite",
            client: null,
          },
        },
      ]);
    });
    prismaMock.performanceCheck.findMany.mockImplementation((args) => {
      if ("select" in args) {
        return Promise.resolve([{ siteId: "site_2" }]);
      }

      return Promise.resolve([
        {
          id: "performance_1",
          status: "issue",
          site: {
            id: "site_2",
            name: "Site performance",
            client: null,
          },
        },
      ]);
    });
    prismaMock.watchedForm.findMany.mockImplementation((args) => {
      if ("select" in args) {
        return Promise.resolve([{ siteId: "site_5" }]);
      }

      return Promise.resolve([
        {
          id: "form_1",
          name: "Contact",
          status: "not_tested",
          site: {
            id: "site_5",
            name: "Site formulaire",
            client: null,
          },
        },
      ]);
    });
    prismaMock.intervention.findMany.mockResolvedValue([
      {
        id: "intervention_1",
        status: "planned",
        title: "Maintenance globale",
        site: {
          id: "site_1",
          name: "Site Demo",
          client: {
            id: "client_1",
            name: "Client Demo",
          },
        },
      },
    ]);
    prismaMock.site.findMany.mockResolvedValue([
      {
        id: "site_1",
        name: "Site Demo",
        status: "active",
        client: {
          id: "client_1",
          name: "Client Demo",
        },
      },
    ]);

    const summary = await getDashboardSummary({
      now: new Date("2026-05-28T12:00:00.000Z"),
    });

    expect(summary.overview).toEqual({
      activeClientCount: 3,
      activeSiteCount: 8,
      openInterventionCount: 2,
      recentlyTrackedSiteCount: 5,
    });
    expect(summary.signals).toEqual({
      formsToWatchCount: 5,
      recentBackupCount: 4,
      recentPerformanceCheckCount: 7,
      recentSecurityCheckCount: 6,
      sitesWithRecentWpurImportCount: 2,
    });
    expect(summary.latestWpurImports[0]).toMatchObject({
      id: "wpur_1",
      periodMonth: "2026-05",
      summaryJson: {
        alertCount: 1,
      },
    });
    expect(summary.watchPoints.forms).toHaveLength(1);
    expect(summary.watchPoints.backups).toHaveLength(1);
    expect(summary.watchPoints.securityChecks).toHaveLength(1);
    expect(summary.watchPoints.performanceChecks).toHaveLength(1);
    expect(prismaMock.intervention.count).toHaveBeenCalledWith({
      where: {
        status: {
          in: ["planned", "in_progress", "issue"],
        },
      },
    });
    expect(prismaMock.wpurImport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          site: {
            include: {
              client: true,
            },
          },
        },
        take: 5,
      }),
    );
  });
});
