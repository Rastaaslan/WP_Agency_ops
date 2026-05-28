"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formDataValue } from "@/server/validators/helpers";
import { importWpurPayload } from "./services/importer";

export async function importWpurPayloadAction(siteId: string, formData: FormData) {
  const payloadJson = formDataValue(formData, "payloadJson");

  if (!payloadJson) {
    throw new Error("Collez un payload WPUR JSON avant import.");
  }

  await importWpurPayload(siteId, payloadJson);

  revalidatePath("/");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}#wpur`);
}

