import { z } from "zod";
import { clientStatuses } from "@/features/core/enums";
import { optionalTextSchema, requiredTextSchema } from "@/features/core/schemas";

export const createClientSchema = z
  .object({
    name: requiredTextSchema,
    companyName: optionalTextSchema,
    email: z.string().trim().email().optional(),
    phone: optionalTextSchema,
    notes: optionalTextSchema,
    status: z.enum(clientStatuses).default("active"),
  })
  .strict();

export type CreateClientInput = z.infer<typeof createClientSchema>;
