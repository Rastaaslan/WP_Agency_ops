"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createFormErrorState,
  emptyClientFormValues,
  parseCreateClientForm,
  parseUpdateClientForm,
  type ClientFormState,
} from "@/features/clients/client-form-state";
import {
  archiveClient,
  createClient,
  updateClient,
} from "@/features/clients/services/client-service";

export async function createClientAction(
  _state: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const parsedForm = parseCreateClientForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  let clientId: string;

  try {
    const client = await createClient(parsedForm.input);
    clientId = client.id;
  } catch (error) {
    return createFormErrorState(
      parsedForm.values,
      getClientMutationErrorMessage(error),
    );
  }

  revalidatePath("/clients");
  redirect(`/clients/${clientId}?notice=client-created`);
}

export async function updateClientAction(
  clientId: string,
  _state: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const parsedForm = parseUpdateClientForm(formData);

  if (!parsedForm.success) {
    return parsedForm.state;
  }

  try {
    await updateClient(clientId, parsedForm.input);
  } catch (error) {
    return createFormErrorState(
      parsedForm.values,
      getClientMutationErrorMessage(error),
    );
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}?notice=client-updated`);
}

export async function archiveClientAction(
  clientId: string,
  state: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  void state;
  void formData;

  try {
    await archiveClient(clientId);
  } catch (error) {
    return createFormErrorState(
      emptyClientFormValues,
      getClientMutationErrorMessage(error),
    );
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}?notice=client-archived`);
}

function getClientMutationErrorMessage(error: unknown) {
  if (isPrismaRecordNotFoundError(error)) {
    return "Client introuvable dans ce cockpit. Actualisez la page puis réessayez.";
  }

  return "Impossible d'enregistrer le client. Vérifiez les champs puis réessayez.";
}

function isPrismaRecordNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}
