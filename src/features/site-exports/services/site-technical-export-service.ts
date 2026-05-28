import { prisma } from "@/server/db/client";

export async function exportSiteTechnicalState(siteId: string) {
  const siteRecord = await prisma.site.findUnique({
    where: { id: siteId },
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

  if (!siteRecord) {
    return null;
  }

  const {
    backups,
    client,
    interventions,
    performanceChecks,
    securityChecks,
    watchedForms,
    wpurImports,
    ...site
  } = siteRecord;
  const latestWpurImport = wpurImports[0] ?? null;
  const latestSecurityCheck = securityChecks[0] ?? null;
  const latestPerformanceCheck = performanceChecks[0] ?? null;

  return {
    client,
    site,
    interventions,
    wpur: latestWpurImport
      ? {
          import: latestWpurImport,
          summary: latestWpurImport.summaryJson ?? null,
        }
      : null,
    security: {
      latest: latestSecurityCheck,
      history: securityChecks,
    },
    performance: {
      latest: latestPerformanceCheck,
      history: performanceChecks,
    },
    forms: watchedForms,
    backups,
  };
}
