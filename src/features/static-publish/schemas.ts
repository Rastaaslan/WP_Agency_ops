import { z } from "zod";
import { optionalText } from "@/server/validators/helpers";

export const staticReviewSchema = z.object({
  siteId: z.string().trim().min(1),
  isBrochureSite: z.boolean(),
  noDynamicCommerce: z.boolean(),
  noMemberArea: z.boolean(),
  formsIdentified: z.boolean(),
  searchIdentified: z.boolean(),
  commentsIdentified: z.boolean(),
  recommendations: optionalText(3000),
});
