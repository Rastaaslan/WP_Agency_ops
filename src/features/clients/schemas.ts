import { z } from "zod";
import { clientStatuses } from "@/features/core/enums";
import { optionalTextSchema, requiredTextSchema } from "@/features/core/schemas";

const clientBaseSchema = z
  .object({
    name: requiredTextSchema,
    companyName: optionalTextSchema,
    email: z.string().trim().email().optional(),
    phone: optionalTextSchema,
    notes: optionalTextSchema,
    status: z.enum(clientStatuses),
  })
  .strict();

export const createClientSchema = clientBaseSchema.extend({
  status: z.enum(clientStatuses).default("active"),
});

export const updateClientSchema = clientBaseSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one client field must be provided.",
  });

export type CreateClientInput = z.input<typeof createClientSchema>;
export type UpdateClientInput = z.input<typeof updateClientSchema>;
