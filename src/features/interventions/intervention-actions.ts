"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createInterventionFormErrorState,
  createInterventionItemFormErrorState,
  createInterventionStatusFormErrorState,
  parseAddInterventionItemForm,
  parseCreateInterventionForm,
  parseInterventionStatusForm,
  parseUpdateInterventionForm,
  parseUpdateInterventionItemForm,
  type InterventionFormState,
  type InterventionItemFormState,
  type InterventionStatusFormState,
} from "@/features/interventions/intervention-form-state";
import {
  addInterventionItem,
  createIntervention,
  getInterventionById,
  updateIntervention,
  updateInterventionItem,
  updateInterventionStatus,
} from "@/features/interventions/services/intervention-service";

export async function createInterventionAction(
  _state: InterventionFormState,
  formData: FormData,
): Promise<InterventionFormState> {
  const parsedForm = parseCreateInterventionForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  let interventionId: string;

  try {
    const intervention = await createIntervention(parsedForm.input);
    interventionId = intervention.id;
  } catch (error) {
    return createInterventionFormErrorState(
      parsedForm.values,
      getInterventionMutationErrorMessage(error),
    );
  }

  revalidateInterventionLists(parsedForm.input.siteId);
  redirect(`/interventions/${interventionId}?notice=intervention-created`);
}

export async function updateInterventionAction(
  interventionId: string,
  _state: InterventionFormState,
  formData: FormData,
): Promise<InterventionFormState> {
  const parsedForm = parseUpdateInterventionForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  let previousSiteId: string | undefined;
  const nextSiteId = parsedForm.input.siteId;

  try {
    previousSiteId = (await getInterventionById(interventionId))?.siteId;
    await updateIntervention(interventionId, parsedForm.input);
  } catch (error) {
    return createInterventionFormErrorState(
      parsedForm.values,
      getInterventionMutationErrorMessage(error),
    );
  }

  revalidateInterventionLists(nextSiteId);
  revalidatePath(`/interventions/${interventionId}`);

  if (previousSiteId && previousSiteId !== nextSiteId) {
    revalidatePath(`/sites/${previousSiteId}`);
  }

  redirect(`/interventions/${interventionId}?notice=intervention-updated`);
}

export async function updateInterventionStatusAction(
  interventionId: string,
  _state: InterventionStatusFormState,
  formData: FormData,
): Promise<InterventionStatusFormState> {
  const parsedForm = parseInterventionStatusForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  let siteId: string | undefined;

  try {
    siteId = (await getInterventionById(interventionId))?.siteId;
    await updateInterventionStatus(interventionId, parsedForm.status);
  } catch (error) {
    return createInterventionStatusFormErrorState(
      parsedForm.values,
      getInterventionMutationErrorMessage(error),
    );
  }

  const notice =
    parsedForm.status === "cancelled"
      ? "intervention-cancelled"
      : "intervention-status-updated";

  revalidateInterventionLists(siteId);
  revalidatePath(`/interventions/${interventionId}`);
  redirect(`/interventions/${interventionId}?notice=${notice}`);
}

export async function addInterventionItemAction(
  interventionId: string,
  _state: InterventionItemFormState,
  formData: FormData,
): Promise<InterventionItemFormState> {
  const parsedForm = parseAddInterventionItemForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  let siteId: string | undefined;

  try {
    siteId = (await getInterventionById(interventionId))?.siteId;
    await addInterventionItem(interventionId, parsedForm.input);
  } catch (error) {
    return createInterventionItemFormErrorState(
      parsedForm.values,
      getInterventionMutationErrorMessage(error),
    );
  }

  revalidateInterventionLists(siteId);
  revalidatePath(`/interventions/${interventionId}`);
  redirect(`/interventions/${interventionId}?notice=intervention-item-added`);
}

export async function updateInterventionItemAction(
  itemId: string,
  interventionId: string,
  _state: InterventionItemFormState,
  formData: FormData,
): Promise<InterventionItemFormState> {
  const parsedForm = parseUpdateInterventionItemForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  let siteId: string | undefined;

  try {
    siteId = (await getInterventionById(interventionId))?.siteId;
    await updateInterventionItem(itemId, parsedForm.input);
  } catch (error) {
    return createInterventionItemFormErrorState(
      parsedForm.values,
      getInterventionMutationErrorMessage(error),
    );
  }

  revalidateInterventionLists(siteId);
  revalidatePath(`/interventions/${interventionId}`);
  redirect(`/interventions/${interventionId}?notice=intervention-item-updated`);
}

function revalidateInterventionLists(siteId?: string) {
  revalidatePath("/interventions");

  if (siteId) {
    revalidatePath(`/sites/${siteId}`);
  }
}

function getInterventionMutationErrorMessage(error: unknown) {
  if (isPrismaRecordNotFoundError(error)) {
    return "Intervention introuvable dans ce cockpit. Actualisez la page puis réessayez.";
  }

  if (isPrismaForeignKeyError(error)) {
    return "Site introuvable. Choisissez un site existant puis réessayez.";
  }

  return "Impossible d'enregistrer l'intervention. Vérifiez les champs puis réessayez.";
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
