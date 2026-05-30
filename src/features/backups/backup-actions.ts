"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBackupFormErrorState,
  parseCreateBackupForm,
  parseUpdateBackupForm,
  type BackupFormState,
} from "@/features/backups/backup-form-state";
import {
  createBackup,
  updateBackup,
} from "@/features/backups/services/backup-service";

export async function createBackupAction(
  siteId: string,
  _state: BackupFormState,
  formData: FormData,
): Promise<BackupFormState> {
  const parsedForm = parseCreateBackupForm(siteId, formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  try {
    await createBackup(parsedForm.input);
  } catch (error) {
    return createBackupFormErrorState(
      parsedForm.values,
      getBackupMutationErrorMessage(error),
    );
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}?notice=backup-saved`);
}

export async function updateBackupAction(
  backupId: string,
  siteId: string,
  _state: BackupFormState,
  formData: FormData,
): Promise<BackupFormState> {
  const parsedForm = parseUpdateBackupForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  try {
    await updateBackup(backupId, parsedForm.input);
  } catch (error) {
    return createBackupFormErrorState(
      parsedForm.values,
      getBackupMutationErrorMessage(error),
    );
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/backups/${backupId}/edit`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}?notice=backup-saved`);
}

function getBackupMutationErrorMessage(error: unknown) {
  if (isPrismaRecordNotFoundError(error)) {
    return "Sauvegarde introuvable dans ce cockpit. Actualisez la page puis réessayez.";
  }

  if (isPrismaForeignKeyError(error)) {
    return "Site ou suivi technique introuvable. Choisissez une valeur existante puis réessayez.";
  }

  return "Impossible d'enregistrer la sauvegarde. Vérifiez les champs puis réessayez.";
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
