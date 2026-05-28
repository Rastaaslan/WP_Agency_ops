import { z } from "zod";
import {
  interventionItemStatuses,
  interventionStatuses,
  interventionTypes,
} from "@/features/core/enums";
import { optionalTextSchema, requiredTextSchema } from "@/features/core/schemas";

const interventionBaseSchema = z
  .object({
    siteId: requiredTextSchema,
    title: requiredTextSchema,
    type: z.enum(interventionTypes),
    status: z.enum(interventionStatuses),
    date: z.coerce.date(),
    internalNotes: optionalTextSchema,
    clientSummary: optionalTextSchema,
  })
  .strict();

const interventionItemBaseSchema = z
  .object({
    label: requiredTextSchema,
    status: z.enum(interventionItemStatuses),
    notes: optionalTextSchema,
  })
  .strict();

export const createInterventionSchema = interventionBaseSchema.extend({
  type: z.enum(interventionTypes).default("other"),
  status: z.enum(interventionStatuses).default("planned"),
});

export const createInterventionItemSchema = interventionItemBaseSchema.extend({
  interventionId: requiredTextSchema,
  status: z.enum(interventionItemStatuses).default("planned"),
});

export const updateInterventionSchema = interventionBaseSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one intervention field must be provided.",
  });

export const interventionStatusSchema = z.enum(interventionStatuses);

export const addInterventionItemSchema = interventionItemBaseSchema.extend({
  status: z.enum(interventionItemStatuses).default("planned"),
});

export const updateInterventionItemSchema = interventionItemBaseSchema
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
