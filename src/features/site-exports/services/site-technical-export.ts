import { prisma } from "@/server/db/client";
import type {
  SiteTechnicalExport,
  SiteTechnicalExportService,
} from "../types";

function isoDate(value?: Date | null) {
  return value ? value.toISOString() : null;
}

export class PrismaSiteTechnicalExportService implements SiteTechnicalExportService {
  async exportSiteTechnicalState(siteId: string): Promise<SiteTechnicalExport> {
    const site = await prisma.wordPressSite.findUniqueOrThrow({
      where: { id: siteId },
      include: {
        client: true,
        securityChecks: { orderBy: { createdAt: "desc" }, take: 1 },
        performanceChecks: { orderBy: { createdAt: "desc" }, take: 1 },
        forms: { where: { status: { not: "archived" } }, orderBy: { updatedAt: "desc" } },
        backupRecords: { orderBy: { checkedAt: "desc" }, take: 10 },
        interventions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            items: true,
            wpurImport: {
              select: {
                id: true,
                periodMonth: true,
                importedAt: true,
                summaryJson: true,
              },
            },
          },
        },
        wpurImports: {
          orderBy: { importedAt: "desc" },
          take: 1,
          select: {
            id: true,
            importedAt: true,
            periodMonth: true,
            summaryJson: true,
          },
        },
      },
    });

    return {
      exportedAt: new Date().toISOString(),
      client: {
        id: site.client.id,
        name: site.client.name,
        companyName: site.client.companyName,
        status: site.client.status,
      },
      site: {
        id: site.id,
        name: site.name,
        url: site.url,
        environment: site.environment,
        status: site.status,
        connectionType: site.connectionType,
        connectionStatus: site.connectionStatus,
        lastScanAt: isoDate(site.lastScanAt),
        notes: site.notes,
      },
      latestSecurityCheck: site.securityChecks[0] ?? null,
      latestPerformanceCheck: site.performanceChecks[0] ?? null,
      forms: site.forms,
      backups: site.backupRecords,
      interventions: site.interventions,
      latestWpurImport: site.wpurImports[0] ?? null,
    };
  }
}

