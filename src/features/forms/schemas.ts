import { z } from "zod";
import { optionalText, optionalUrl } from "@/server/validators/helpers";

export const formEndpointStatusValues = [
  "untested",
  "ok",
  "issue",
  "archived",
] as const;

export const formEndpointSchema = z.object({
  siteId: z.string().trim().min(1, "Le site est obligatoire"),
  name: z.string().trim().min(1, "Le nom est obligatoire").max(180),
  pageUrl: optionalUrl,
  endpointSlug: optionalText(120),
  expectedFieldsText: optionalText(2000),
  recipientsText: optionalText(2000),
  status: z.enum(formEndpointStatusValues),
  spamProtectionEnabled: z.boolean(),
  notes: optionalText(3000),
});
