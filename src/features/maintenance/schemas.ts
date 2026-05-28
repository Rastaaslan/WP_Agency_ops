import { z } from "zod";
import { optionalText } from "@/server/validators/helpers";

export const maintenanceTypeValues = [
  "general",
  "update",
  "backup",
  "security",
  "performance",
  "form",
  "deployment",
  "static_publish",
  "bugfix",
  "plugin_maintenance",
  "other",
] as const;

export const maintenanceStatusValues = [
  "planned",
  "in_progress",
  "done",
  "issue",
  "cancelled",
] as const;

export const interventionItemStatusValues = [
  "planned",
  "done",
  "skipped",
  "failed",
  "warning",
] as const;

export const interventionFormSchema = z.object({
  siteId: z.string().trim().min(1, "Le site est obligatoire"),
  title: z.string().trim().min(1, "Le titre est obligatoire").max(220),
  type: z.enum(maintenanceTypeValues),
  status: z.enum(maintenanceStatusValues),
  description: optionalText(4000),
  technicalNotes: optionalText(6000),
  clientSummary: optionalText(4000),
  itemsText: optionalText(8000),
});

export const interventionItemFormSchema = z.object({
  label: z.string().trim().min(1, "Le libelle est obligatoire").max(240),
  status: z.enum(interventionItemStatusValues),
  details: optionalText(2000),
});
