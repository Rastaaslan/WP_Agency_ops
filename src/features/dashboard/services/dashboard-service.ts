import { prisma } from "@/server/db/client";

const RECENT_ACTIVITY_DAYS = 30;

const openInterventionStatuses = ["planned", "in_progress", "issue"] as const;
const watchedFormStatuses = ["issue", "not_tested"] as const;
const backupStatusesToWatch = ["failed", "unknown"] as const;
const checkStatusesToWatch = ["warning", "issue", "failed"] as const;

type DashboardSummaryOptions = {
  now?: Date;
};

export async function getDashboardSummary(
  options: DashboardSummaryOptions = {},
) {
  const now = options.now ?? new Date();
  const recentSince = new Date(
    now.getTime() - RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000,
  );

  const [
    activeClientCount,
    activeSiteCount,
    openInterventionCount,
    recentWpurSiteActivity,
    recentBackupSiteActivity,
    recentSecuritySiteActivity,
    recentPerformanceSiteActivity,
    recentFormSiteActivity,
    recentBackupCount,
    formsToWatchCount,
    recentSecurityCheckCount,
    recentPerformanceCheckCount,
    interventionsToFollow,
    latestSites,
    latestWpurImports,
    formsToWatch,
    backupsToWatch,
    securityChecksToWatch,
    performanceChecksToWatch,
  ] = await Promise.all([
    prisma.client.count({
      where: {
        status: "active",
      },
    }),
    prisma.site.count({
      where: {
        status: "active",
      },
    }),
    prisma.intervention.count({
      where: {
        status: {
          in: [...openInterventionStatuses],
        },
      },
    }),
    prisma.wpurImport.findMany({
      where: {
        importedAt: {
          gte: recentSince,
        },
      },
      select: {
        siteId: true,
      },
    }),
    prisma.backupRecord.findMany({
      where: {
        performedAt: {
          gte: recentSince,
        },
      },
      select: {
        siteId: true,
      },
    }),
    prisma.securityCheck.findMany({
      where: {
        checkedAt: {
          gte: recentSince,
        },
      },
      select: {
        siteId: true,
      },
    }),
    prisma.performanceCheck.findMany({
      where: {
        checkedAt: {
          gte: recentSince,
        },
      },
      select: {
        siteId: true,
      },
    }),
    prisma.watchedForm.findMany({
      where: {
        updatedAt: {
          gte: recentSince,
        },
      },
      select: {
        siteId: true,
      },
    }),
    prisma.backupRecord.count({
      where: {
        performedAt: {
          gte: recentSince,
        },
      },
    }),
    prisma.watchedForm.count({
      where: {
        status: {
          in: [...watchedFormStatuses],
        },
      },
    }),
    prisma.securityCheck.count({
      where: {
        checkedAt: {
          gte: recentSince,
        },
      },
    }),
    prisma.performanceCheck.count({
      where: {
        checkedAt: {
          gte: recentSince,
        },
      },
    }),
    prisma.intervention.findMany({
      where: {
        status: {
          in: [...openInterventionStatuses],
        },
      },
      include: {
        site: {
          include: {
            client: true,
          },
        },
      },
      orderBy: [
        {
          date: "asc",
        },
      ],
      take: 6,
    }),
    prisma.site.findMany({
      where: {
        status: {
          not: "archived",
        },
      },
      include: {
        client: true,
      },
      orderBy: [
        {
          updatedAt: "desc",
        },
        {
          name: "asc",
        },
      ],
      take: 5,
    }),
    prisma.wpurImport.findMany({
      include: {
        site: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        importedAt: "desc",
      },
      take: 5,
    }),
    prisma.watchedForm.findMany({
      where: {
        status: {
          in: [...watchedFormStatuses],
        },
      },
      include: {
        site: {
          include: {
            client: true,
          },
        },
      },
      orderBy: [
        {
          status: "asc",
        },
        {
          lastCheckedAt: "asc",
        },
      ],
      take: 5,
    }),
    prisma.backupRecord.findMany({
      where: {
        status: {
          in: [...backupStatusesToWatch],
        },
      },
      include: {
        site: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        performedAt: "desc",
      },
      take: 5,
    }),
    prisma.securityCheck.findMany({
      where: {
        status: {
          in: [...checkStatusesToWatch],
        },
      },
      include: {
        site: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        checkedAt: "desc",
      },
      take: 5,
    }),
    prisma.performanceCheck.findMany({
      where: {
        status: {
          in: [...checkStatusesToWatch],
        },
      },
      include: {
        site: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        checkedAt: "desc",
      },
      take: 5,
    }),
  ]);

  return {
    overview: {
      activeClientCount,
      activeSiteCount,
      openInterventionCount,
      recentlyTrackedSiteCount: countUniqueSiteIds([
        recentWpurSiteActivity,
        recentBackupSiteActivity,
        recentSecuritySiteActivity,
        recentPerformanceSiteActivity,
        recentFormSiteActivity,
      ]),
    },
    signals: {
      sitesWithRecentWpurImportCount: countUniqueSiteIds([
        recentWpurSiteActivity,
      ]),
      recentBackupCount,
      formsToWatchCount,
      recentSecurityCheckCount,
      recentPerformanceCheckCount,
    },
    interventionsToFollow,
    latestSites,
    latestWpurImports,
    watchPoints: {
      forms: formsToWatch,
      backups: backupsToWatch,
      securityChecks: securityChecksToWatch,
      performanceChecks: performanceChecksToWatch,
    },
  };
}

function countUniqueSiteIds(groups: Array<Array<{ siteId: string }>>) {
  const siteIds = new Set<string>();

  for (const group of groups) {
    for (const item of group) {
      siteIds.add(item.siteId);
    }
  }

  return siteIds.size;
}
