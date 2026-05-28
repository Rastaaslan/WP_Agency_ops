import { ZodError } from "zod";
import {
  createClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type UpdateClientInput,
} from "@/features/clients/schemas";

export type ClientFormField = keyof ClientFormValues;

export type ClientFormValues = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  notes: string;
};

export type ClientFormState = {
  values: ClientFormValues;
  fieldErrors: Partial<Record<ClientFormField, string[]>>;
  formError?: string;
};

const fieldLabels: Record<ClientFormField, string> = {
  name: "Nom",
  companyName: "Entreprise",
  email: "Email",
  phone: "Téléphone",
  notes: "Notes",
};

export const emptyClientFormValues: ClientFormValues = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  notes: "",
};

export function createInitialClientFormState(
  values: Partial<ClientFormValues> = {},
): ClientFormState {
  return {
    values: {
      ...emptyClientFormValues,
      ...values,
    },
    fieldErrors: {},
  };
}

export function clientFormValuesFromFormData(
  formData: FormData,
): ClientFormValues {
  return {
    name: readFormString(formData, "name"),
    companyName: readFormString(formData, "companyName"),
    email: readFormString(formData, "email"),
    phone: readFormString(formData, "phone"),
    notes: readFormString(formData, "notes"),
  };
}

export function parseCreateClientForm(formData: FormData):
  | {
      success: true;
      values: ClientFormValues;
      input: CreateClientInput;
    }
  | {
      success: false;
      state: ClientFormState;
    } {
  const values = clientFormValuesFromFormData(formData);
  const parsedInput = createClientSchema.safeParse(toClientInput(values));

  if (!parsedInput.success) {
    return {
      success: false,
      state: formStateFromZodError(values, parsedInput.error),
    };
  }

  return {
    success: true,
    values,
    input: parsedInput.data,
  };
}

export function parseUpdateClientForm(formData: FormData):
  | {
      success: true;
      values: ClientFormValues;
      input: UpdateClientInput;
    }
  | {
      success: false;
      state: ClientFormState;
    } {
  const values = clientFormValuesFromFormData(formData);
  const parsedInput = updateClientSchema.safeParse(toClientInput(values));

  if (!parsedInput.success) {
    return {
      success: false,
      state: formStateFromZodError(values, parsedInput.error),
    };
  }

  return {
    success: true,
    values,
    input: parsedInput.data,
  };
}

export function clientValuesFromRecord(input: {
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}): ClientFormValues {
  return {
    name: input.name,
    companyName: input.companyName ?? "",
    email: input.email ?? "",
    phone: input.phone ?? "",
    notes: input.notes ?? "",
  };
}

export function createFormErrorState(
  values: ClientFormValues,
  formError: string,
): ClientFormState {
  return {
    values,
    fieldErrors: {},
    formError,
  };
}

function toClientInput(values: ClientFormValues) {
  return {
    name: values.name,
    companyName: optionalValue(values.companyName),
    email: optionalValue(values.email),
    phone: optionalValue(values.phone),
    notes: optionalValue(values.notes),
  };
}

function formStateFromZodError(
  values: ClientFormValues,
  error: ZodError,
): ClientFormState {
  const fieldErrors: ClientFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (!isClientFormField(field)) {
      continue;
    }

    fieldErrors[field] = [
      ...(fieldErrors[field] ?? []),
      formatIssueMessage(field, issue.message),
    ];
  }

  return {
    values,
    fieldErrors,
    formError:
      Object.keys(fieldErrors).length === 0
        ? "Le formulaire client contient une erreur."
        : undefined,
  };
}

function readFormString(formData: FormData, key: ClientFormField) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function isClientFormField(value: unknown): value is ClientFormField {
  return (
    typeof value === "string" &&
    ["name", "companyName", "email", "phone", "notes"].includes(value)
  );
}

function formatIssueMessage(field: ClientFormField, message: string) {
  if (field === "name") {
    return "Le nom est obligatoire.";
  }

  if (field === "email") {
    return "L'email doit être valide.";
  }

  return `${fieldLabels[field]} : ${message}`;
}
