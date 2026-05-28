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
    },
  });

  if (!siteRecord) {
    return null;
  }

  const {
    backups,
    client,
    interventions,
    watchedForms,
    wpurImports,
    ...site
  } = siteRecord;
  const latestWpurImport = wpurImports[0] ?? null;

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
    security: [],
    performance: [],
    forms: watchedForms,
    backups,
  };
}
