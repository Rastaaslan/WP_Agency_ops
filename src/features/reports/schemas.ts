import { z } from "zod";
import { optionalText } from "@/server/validators/helpers";

export const generateReportSchema = z.object({
  siteId: z.string().trim().min(1, "Le site est obligatoire"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  title: optionalText(220),
});

export const updateReportSchema = z.object({
  title: z.string().trim().min(1).max(220),
  markdownContent: z.string().trim().min(1),
  status: z.enum(["draft", "generated", "archived"]),
});
