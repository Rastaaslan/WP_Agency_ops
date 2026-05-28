import { z } from "zod";
import { optionalText } from "@/server/validators/helpers";

export const backupStatusValues = ["unknown", "ok", "warning", "issue"] as const;

export const backupRecordFormSchema = z.object({
  checkedAt: z.string().trim().optional(),
  status: z.enum(backupStatusValues),
  filesBackedUp: z.boolean(),
  databaseBackedUp: z.boolean(),
  interventionId: optionalText(120),
  notes: optionalText(2000),
});

