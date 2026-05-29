"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createWatchedFormErrorState,
  parseCreateWatchedForm,
  parseUpdateWatchedForm,
  type WatchedFormState,
} from "@/features/forms/form-watch-form-state";
import {
  createForm,
  updateForm,
} from "@/features/forms/services/form-watch-service";

export async function createWatchedFormAction(
  siteId: string,
  _state: WatchedFormState,
  formData: FormData,
): Promise<WatchedFormState> {
  const parsedForm = parseCreateWatchedForm(siteId, formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  try {
    await createForm(parsedForm.input);
  } catch (error) {
    return createWatchedFormErrorState(
      parsedForm.values,
      getWatchedFormMutationErrorMessage(error),
    );
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}?notice=watched-form-saved`);
}

export async function updateWatchedFormAction(
  formId: string,
  siteId: string,
  _state: WatchedFormState,
  formData: FormData,
): Promise<WatchedFormState> {
  const parsedForm = parseUpdateWatchedForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  try {
    await updateForm(formId, parsedForm.input);
  } catch (error) {
    return createWatchedFormErrorState(
      parsedForm.values,
      getWatchedFormMutationErrorMessage(error),
    );
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/forms/${formId}/edit`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}?notice=watched-form-saved`);
}

function getWatchedFormMutationErrorMessage(error: unknown) {
  if (isPrismaRecordNotFoundError(error)) {
    return "Formulaire surveillé introuvable dans ce cockpit. Actualisez la page puis réessayez.";
  }

  if (isPrismaForeignKeyError(error)) {
    return "Site introuvable. Choisissez un site existant puis réessayez.";
  }

  return "Impossible d'enregistrer le formulaire surveillé. Vérifiez les champs puis réessayez.";
}

function isPrismaRecordNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

function isPrismaForeignKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2003"
  );
}
