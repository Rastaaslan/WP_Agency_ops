import { z } from "zod";
import {
  optionalTextSchema,
  periodMonthSchema,
  requiredTextSchema,
} from "@/features/core/schemas";

export const wpurPayloadSchema = z
  .object({
    schemaVersion: requiredTextSchema,
    reportType: requiredTextSchema,
    period: z
      .object({
        month: periodMonthSchema,
      })
      .strict(),
    client: z
      .object({
        name: requiredTextSchema,
        companyName: optionalTextSchema,
      })
      .strict(),
    site: z
      .object({
        name: requiredTextSchema,
        url: z.string().trim().url(),
      })
      .strict(),
    maintenanceDates: z.array(z.string().date()),
    sections: z.array(
      z
        .object({
          title: requiredTextSchema,
          summary: optionalTextSchema,
        })
        .strict(),
    ),
    alerts: z.array(
      z
        .object({
          level: z.enum(["info", "warning", "critical"]),
          message: requiredTextSchema,
        })
        .strict(),
    ),
    notes: z.array(requiredTextSchema),
  })
  .strict();

export const createWpurImportSchema = z
  .object({
    siteId: requiredTextSchema,
    periodMonth: periodMonthSchema,
    payload: wpurPayloadSchema,
    summary: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type WpurPayload = z.infer<typeof wpurPayloadSchema>;
export type CreateWpurImportInput = z.infer<typeof createWpurImportSchema>;
