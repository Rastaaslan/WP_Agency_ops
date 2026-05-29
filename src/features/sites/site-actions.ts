"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSiteFormErrorState,
  emptySiteFormValues,
  parseCreateSiteForm,
  parseUpdateSiteForm,
  type SiteFormState,
} from "@/features/sites/site-form-state";
import {
  archiveSite,
  createSite,
  getSiteById,
  updateSite,
} from "@/features/sites/services/site-service";

export async function createSiteAction(
  _state: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  const parsedForm = parseCreateSiteForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  let siteId: string;

  try {
    const site = await createSite(parsedForm.input);
    siteId = site.id;
  } catch (error) {
    return createSiteFormErrorState(
      parsedForm.values,
      getSiteMutationErrorMessage(error),
    );
  }

  revalidatePath("/sites");
  revalidatePath("/clients");
  revalidatePath(`/clients/${parsedForm.input.clientId}`);
  redirect(`/sites/${siteId}?notice=site-created`);
}

export async function updateSiteAction(
  siteId: string,
  _state: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  const parsedForm = parseUpdateSiteForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  let previousClientId: string | undefined;
  const nextClientId = parsedForm.input.clientId;

  try {
    previousClientId = (await getSiteById(siteId))?.clientId;
    await updateSite(siteId, parsedForm.input);
  } catch (error) {
    return createSiteFormErrorState(
      parsedForm.values,
      getSiteMutationErrorMessage(error),
    );
  }

  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);
  revalidatePath("/clients");

  if (nextClientId) {
    revalidatePath(`/clients/${nextClientId}`);
  }

  if (previousClientId && previousClientId !== nextClientId) {
    revalidatePath(`/clients/${previousClientId}`);
  }

  redirect(`/sites/${siteId}?notice=site-updated`);
}

export async function archiveSiteAction(
  siteId: string,
  state: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  void state;
  void formData;

  let clientId: string | undefined;

  try {
    clientId = (await getSiteById(siteId))?.clientId;
    await archiveSite(siteId);
  } catch (error) {
    return createSiteFormErrorState(
      emptySiteFormValues,
      getSiteMutationErrorMessage(error),
    );
  }

  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);

  if (clientId) {
    revalidatePath(`/clients/${clientId}`);
  }

  redirect(`/sites/${siteId}?notice=site-archived`);
}

function getSiteMutationErrorMessage(error: unknown) {
  if (isPrismaRecordNotFoundError(error)) {
    return "Site introuvable dans ce cockpit. Actualisez la page puis réessayez.";
  }

  if (isPrismaForeignKeyError(error)) {
    return "Client introuvable. Choisissez un client existant puis réessayez.";
  }

  return "Impossible d'enregistrer le site. Vérifiez les champs puis réessayez.";
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
