"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getSiteById } from "@/features/sites/services/site-service";
import {
  createWpurImportFormErrorState,
  parseWpurImportForm,
  type WpurImportFormState,
} from "@/features/wpur/wpur-form-state";
import { importWpurPayload } from "@/features/wpur/services/wpur-import-service";

export async function importWpurPayloadAction(
  siteId: string,
  _state: WpurImportFormState,
  formData: FormData,
): Promise<WpurImportFormState> {
  const parsedForm = parseWpurImportForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  try {
    const site = await getSiteById(siteId);

    if (!site) {
      return createWpurImportFormErrorState(
        parsedForm.values,
        "Site introuvable. Choisissez un site existant puis réessayez.",
      );
    }

    await importWpurPayload(siteId, parsedForm.payload);
  } catch (error) {
    return createWpurImportFormErrorState(
      parsedForm.values,
      getWpurImportMutationErrorMessage(error),
    );
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}`);
}

function getWpurImportMutationErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return "L'export WPUR ne respecte pas le schéma attendu.";
  }

  if (isPrismaForeignKeyError(error)) {
    return "Site introuvable. Choisissez un site existant puis réessayez.";
  }

  return "Impossible d'importer l'export WPUR. Vérifiez le JSON puis réessayez.";
}

function isPrismaForeignKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2003"
  );
}
