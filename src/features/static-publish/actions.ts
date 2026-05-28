"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/client";
import { checkboxValue, formDataValue } from "@/server/validators/helpers";
import { staticReviewSchema } from "./schemas";

export async function saveStaticCompatibilityReview(
  siteId: string,
  formData: FormData,
) {
  const data = staticReviewSchema.parse({
    siteId,
    isBrochureSite: checkboxValue(formData, "isBrochureSite"),
    noDynamicCommerce: checkboxValue(formData, "noDynamicCommerce"),
    noMemberArea: checkboxValue(formData, "noMemberArea"),
    formsIdentified: checkboxValue(formData, "formsIdentified"),
    searchIdentified: checkboxValue(formData, "searchIdentified"),
    commentsIdentified: checkboxValue(formData, "commentsIdentified"),
    recommendations: formDataValue(formData, "recommendations"),
  });
  const positiveScore = [
    data.isBrochureSite,
    data.noDynamicCommerce,
    data.noMemberArea,
    data.formsIdentified,
  ].filter(Boolean).length;
  const riskScore = [
    data.searchIdentified,
    data.commentsIdentified,
  ].filter(Boolean).length;
  const score = Math.max(0, Math.min(100, positiveScore * 25 - riskScore * 15));
  const status =
    score >= 75
      ? "promising"
      : score >= 40
        ? "needs_review"
        : "not_recommended";

  await prisma.staticCompatibilityReview.create({
    data: { ...data, score, status },
  });

  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}`);
}
