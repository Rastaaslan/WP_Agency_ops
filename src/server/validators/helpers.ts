import { z } from "zod";
import { normalizeUrl } from "@/lib/urls";

export const optionalText = (max = 4000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const optionalEmail = z
  .string()
  .trim()
  .email("Email invalide")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value, context) => {
    if (!value) {
      return undefined;
    }

    try {
      return normalizeUrl(value);
    } catch {
      context.addIssue({
        code: "custom",
        message: "URL invalide",
      });
      return z.NEVER;
    }
  });

export const requiredUrl = z.string().trim().transform((value, context) => {
  try {
    return normalizeUrl(value);
  } catch {
    context.addIssue({
      code: "custom",
      message: "URL invalide",
    });
    return z.NEVER;
  }
});

export function formDataValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function checkboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}
