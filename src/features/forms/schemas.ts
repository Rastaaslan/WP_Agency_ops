import { z } from "zod";
import { watchedFormStatuses } from "@/features/core/enums";
import { optionalTextSchema, requiredTextSchema } from "@/features/core/schemas";

const watchedFormBaseSchema = z
  .object({
    siteId: requiredTextSchema,
    name: requiredTextSchema,
    pageUrl: z.string().trim().url(),
    expectedRecipients: optionalTextSchema,
    status: z.enum(watchedFormStatuses),
    lastCheckedAt: z.coerce.date().nullish(),
    notes: optionalTextSchema,
  })
  .strict();

export const createWatchedFormSchema = watchedFormBaseSchema.extend({
  status: z.enum(watchedFormStatuses).default("not_tested"),
});

export const updateWatchedFormSchema = watchedFormBaseSchema
  .omit({
    siteId: true,
  })
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one watched form field must be provided.",
  });

export const watchedFormStatusSchema = z.enum(watchedFormStatuses);

export type CreateWatchedFormInput = z.input<typeof createWatchedFormSchema>;
export type UpdateWatchedFormInput = z.input<typeof updateWatchedFormSchema>;
