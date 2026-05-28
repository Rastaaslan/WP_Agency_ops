import { z } from "zod";
import { backupStatuses, backupTypes } from "@/features/core/enums";
import { optionalTextSchema, requiredTextSchema } from "@/features/core/schemas";

const backupBaseSchema = z
  .object({
    siteId: requiredTextSchema,
    interventionId: requiredTextSchema.nullish(),
    type: z.enum(backupTypes),
    status: z.enum(backupStatuses),
    performedAt: z.coerce.date(),
    provider: optionalTextSchema,
    storageLocation: optionalTextSchema,
    notes: optionalTextSchema,
  })
  .strict();

export const createBackupSchema = backupBaseSchema.extend({
  type: z.enum(backupTypes).default("full"),
  status: z.enum(backupStatuses).default("done"),
});

export const updateBackupSchema = backupBaseSchema
  .omit({
    siteId: true,
  })
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one backup field must be provided.",
  });

export const backupStatusSchema = z.enum(backupStatuses);

export type CreateBackupInput = z.input<typeof createBackupSchema>;
export type UpdateBackupInput = z.input<typeof updateBackupSchema>;
