import { z } from "zod";
import { optionalEmail, optionalText } from "@/server/validators/helpers";

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom du client est obligatoire").max(160),
  companyName: optionalText(160),
  email: optionalEmail,
  phone: optionalText(60),
  notes: optionalText(4000),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;
