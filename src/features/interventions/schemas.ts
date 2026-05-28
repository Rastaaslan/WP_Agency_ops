import { z } from "zod";
import {
  interventionItemStatuses,
  interventionStatuses,
  interventionTypes,
} from "@/features/core/enums";
import { optionalTextSchema, requiredTextSchema } from "@/features/core/schemas";

export const createInterventionSchema = z
  .object({
    siteId: requiredTextSchema,
    title: requiredTextSchema,
    type: z.enum(interventionTypes).default("other"),
    status: z.enum(interventionStatuses).default("planned"),
    date: z.coerce.date(),
    internalNotes: optionalTextSchema,
    clientSummary: optionalTextSchema,
  })
  .strict();

export const createInterventionItemSchema = z
  .object({
    interventionId: requiredTextSchema,
    label: requiredTextSchema,
    status: z.enum(interventionItemStatuses).default("planned"),
    notes: optionalTextSchema,
  })
  .strict();

export type CreateInterventionInput = z.infer<typeof createInterventionSchema>;
export type CreateInterventionItemInput = z.infer<
  typeof createInterventionItemSchema
>;
