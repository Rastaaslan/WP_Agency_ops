import { z } from "zod";

export const periodMonthSchema = z.string().regex(/^\d{4}-\d{2}$/, {
  message: "Expected YYYY-MM.",
});

export const requiredTextSchema = z.string().trim().min(1);
export const optionalTextSchema = requiredTextSchema.optional();
