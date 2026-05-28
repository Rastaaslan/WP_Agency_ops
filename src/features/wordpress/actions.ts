"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formDataValue } from "@/server/validators/helpers";
import { checkWordPressConnection, runWordPressScan } from "./services/scanner";
import { manualScanSchema } from "./schemas";

export async function checkSiteWordPressConnection(siteId: string) {
  await checkWordPressConnection(siteId);

  revalidatePath("/");
  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}`);
}

export async function runPublicWordPressScan(siteId: string) {
  await runWordPressScan(siteId);

  revalidatePath("/");
  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}`);
}

export async function runManualWordPressScan(siteId: string, formData: FormData) {
  const input = manualScanSchema.parse({
    wpVersion: formDataValue(formData, "wpVersion"),
    phpVersion: formDataValue(formData, "phpVersion"),
    pluginsText: formDataValue(formData, "pluginsText"),
    themesText: formDataValue(formData, "themesText"),
    notes: formDataValue(formData, "notes"),
  });

  await runWordPressScan(siteId, input);

  revalidatePath("/");
  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}`);
}
