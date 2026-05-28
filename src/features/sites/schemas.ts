import { z } from "zod";
import {
  optionalText,
  optionalUrl,
  requiredUrl,
} from "@/server/validators/helpers";

export const siteEnvironmentValues = [
  "production",
  "staging",
  "development",
] as const;

export const connectionTypeValues = [
  "none",
  "public_rest",
  "manual",
  "companion_plugin",
  "application_password",
] as const;

export const siteFormSchema = z.object({
  clientId: z.string().trim().min(1, "Le client est obligatoire"),
  name: z.string().trim().min(1, "Le nom du site est obligatoire").max(180),
  url: requiredUrl,
  adminUrl: optionalUrl,
  environment: z.enum(siteEnvironmentValues),
  connectionType: z.enum(connectionTypeValues),
  secretReference: optionalText(160),
  notes: optionalText(4000),
});

export type SiteFormInput = z.infer<typeof siteFormSchema>;
