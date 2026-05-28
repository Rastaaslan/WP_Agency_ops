import { ZodError } from "zod";
import {
  createSiteSchema,
  type CreateSiteInput,
  type UpdateSiteInput,
  updateSiteSchema,
} from "@/features/sites/schemas";

export type SiteFormField = keyof SiteFormValues;

export type SiteFormValues = {
  clientId: string;
  name: string;
  url: string;
  environment: string;
  notes: string;
};

export type SiteFormState = {
  values: SiteFormValues;
  fieldErrors: Partial<Record<SiteFormField, string[]>>;
  formError?: string;
};

const fieldLabels: Record<SiteFormField, string> = {
  clientId: "Client",
  name: "Nom",
  url: "URL",
  environment: "Environnement",
  notes: "Notes",
};

export const emptySiteFormValues: SiteFormValues = {
  clientId: "",
  name: "",
  url: "",
  environment: "production",
  notes: "",
};

export function createInitialSiteFormState(
  values: Partial<SiteFormValues> = {},
): SiteFormState {
  return {
    values: {
      ...emptySiteFormValues,
      ...values,
    },
    fieldErrors: {},
  };
}

export function siteFormValuesFromFormData(formData: FormData): SiteFormValues {
  return {
    clientId: readFormString(formData, "clientId"),
    name: readFormString(formData, "name"),
    url: readFormString(formData, "url"),
    environment:
      readFormString(formData, "environment") ||
      emptySiteFormValues.environment,
    notes: readFormString(formData, "notes"),
  };
}

export function parseCreateSiteForm(formData: FormData):
  | {
      success: true;
      values: SiteFormValues;
      input: CreateSiteInput;
    }
  | {
      success: false;
      state: SiteFormState;
    } {
  const values = siteFormValuesFromFormData(formData);
  const parsedInput = createSiteSchema.safeParse(toSiteInput(values));

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

export function parseUpdateSiteForm(formData: FormData):
  | {
      success: true;
      values: SiteFormValues;
      input: UpdateSiteInput;
    }
  | {
      success: false;
      state: SiteFormState;
    } {
  const values = siteFormValuesFromFormData(formData);
  const parsedInput = updateSiteSchema.safeParse(toSiteInput(values));

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

export function siteValuesFromRecord(input: {
  clientId: string;
  name: string;
  url: string;
  environment: string;
  notes?: string | null;
}): SiteFormValues {
  return {
    clientId: input.clientId,
    name: input.name,
    url: input.url,
    environment: input.environment,
    notes: input.notes ?? "",
  };
}

export function createSiteFormErrorState(
  values: SiteFormValues,
  formError: string,
): SiteFormState {
  return {
    values,
    fieldErrors: {},
    formError,
  };
}

function toSiteInput(values: SiteFormValues) {
  return {
    clientId: values.clientId,
    name: values.name,
    url: values.url,
    environment: values.environment,
    notes: optionalValue(values.notes),
  };
}

function formStateFromZodError(
  values: SiteFormValues,
  error: ZodError,
): SiteFormState {
  const fieldErrors: SiteFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (!isSiteFormField(field)) {
      continue;
    }

    fieldErrors[field] = [
      ...(fieldErrors[field] ?? []),
      formatIssueMessage(field, issue.message, values),
    ];
  }

  return {
    values,
    fieldErrors,
    formError:
      Object.keys(fieldErrors).length === 0
        ? "Le formulaire site contient une erreur."
        : undefined,
  };
}

function readFormString(formData: FormData, key: SiteFormField) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function isSiteFormField(value: unknown): value is SiteFormField {
  return (
    typeof value === "string" &&
    ["clientId", "name", "url", "environment", "notes"].includes(value)
  );
}

function formatIssueMessage(
  field: SiteFormField,
  message: string,
  values: SiteFormValues,
) {
  if (field === "clientId") {
    return "Le client est obligatoire.";
  }

  if (field === "name") {
    return "Le nom du site est obligatoire.";
  }

  if (field === "url") {
    return values.url.length === 0
      ? "L'URL est obligatoire."
      : "L'URL doit être valide.";
  }

  if (field === "environment") {
    return "L'environnement doit être valide.";
  }

  return `${fieldLabels[field]} : ${message}`;
}
