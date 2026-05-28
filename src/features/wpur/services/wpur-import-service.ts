import { wpurPayloadSchema } from "@/features/wpur/schemas";
import { prisma } from "@/server/db/client";
import { toPrismaJson } from "@/server/db/json";

export type WpurPayloadSummary = {
  periodMonth: string;
  maintenanceDateCount: number;
  sectionCount: number;
  totalLineCount: number;
  alertCount: number;
};

export async function listWpurImportsBySite(siteId: string) {
  return prisma.wpurImport.findMany({
    where: { siteId },
    orderBy: {
      importedAt: "desc",
    },
  });
}

export async function getWpurImportById(id: string) {
  return prisma.wpurImport.findUnique({
    where: { id },
  });
}

export function summarizeWpurPayload(payload: unknown): WpurPayloadSummary {
  const parsedPayload = wpurPayloadSchema.parse(payload);

  return {
    periodMonth: parsedPayload.period.month,
    maintenanceDateCount: parsedPayload.maintenanceDates.length,
    sectionCount: parsedPayload.sections.length,
    totalLineCount:
      parsedPayload.maintenanceDates.length +
      parsedPayload.sections.length +
      parsedPayload.alerts.length +
      parsedPayload.notes.length,
    alertCount: parsedPayload.alerts.length,
  };
}

export async function importWpurPayload(siteId: string, payload: unknown) {
  const parsedPayload = wpurPayloadSchema.parse(payload);
  const summary = summarizeWpurPayload(parsedPayload);

  return prisma.wpurImport.create({
    data: {
      siteId,
      periodMonth: summary.periodMonth,
      payloadJson: toPrismaJson(parsedPayload),
      summaryJson: toPrismaJson(summary),
    },
  });
}
