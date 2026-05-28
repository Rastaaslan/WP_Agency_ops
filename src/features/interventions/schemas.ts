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

export const updateInterventionSchema = createInterventionSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one intervention field must be provided.",
  });

export const interventionStatusSchema = z.enum(interventionStatuses);

export const addInterventionItemSchema = createInterventionItemSchema.omit({
  interventionId: true,
});

export const updateInterventionItemSchema = addInterventionItemSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one intervention item field must be provided.",
  });

export type CreateInterventionInput = z.input<typeof createInterventionSchema>;
export type CreateInterventionItemInput = z.input<
  typeof createInterventionItemSchema
>;
export type UpdateInterventionInput = z.input<typeof updateInterventionSchema>;
export type AddInterventionItemInput = z.input<typeof addInterventionItemSchema>;
export type UpdateInterventionItemInput = z.input<
  typeof updateInterventionItemSchema
>;
