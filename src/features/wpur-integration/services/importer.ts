import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";
import { WpurReportPayloadSchema } from "../schemas";
import { summarizeWpurPayload } from "./summary";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function parseWpurPayloadJson(rawPayloadJson: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawPayloadJson);
  } catch {
    throw new Error("Le payload WPUR doit etre un JSON valide.");
  }

  return WpurReportPayloadSchema.parse(parsed);
}

export async function importWpurPayload(siteId: string, rawPayloadJson: string) {
  const payload = parseWpurPayloadJson(rawPayloadJson);
  const summary = summarizeWpurPayload(payload);

  return prisma.wpurImport.create({
    data: {
      siteId,
      periodMonth: payload.period.month,
      payloadJson: toJsonValue(payload),
      summaryJson: toJsonValue(summary),
    },
  });
}

