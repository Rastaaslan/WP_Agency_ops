import { z } from "zod";
import { siteEnvironments, siteStatuses } from "@/features/core/enums";
import { optionalTextSchema, requiredTextSchema } from "@/features/core/schemas";

export const createSiteSchema = z
  .object({
    clientId: requiredTextSchema,
    name: requiredTextSchema,
    url: z.string().trim().url(),
    environment: z.enum(siteEnvironments).default("production"),
    status: z.enum(siteStatuses).default("active"),
    notes: optionalTextSchema,
  })
  .strict();

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
