import { ZodError } from "zod";
import {
  watchedFormStatuses,
  type WatchedFormStatus,
} from "@/features/core/enums";
import {
  createWatchedFormSchema,
  type CreateWatchedFormInput,
  type UpdateWatchedFormInput,
  updateWatchedFormSchema,
} from "@/features/forms/schemas";

export type WatchedFormField = keyof WatchedFormValues;

export type WatchedFormValues = {
  name: string;
  pageUrl: string;
  expectedRecipients: string;
  status: string;
  lastCheckedAt: string;
  notes: string;
};

export type WatchedFormState = {
  values: WatchedFormValues;
  fieldErrors: Partial<Record<WatchedFormField, string[]>>;
  formError?: string;
};

const fieldLabels: Record<WatchedFormField, string> = {
  name: "Nom",
  pageUrl: "URL de page",
  expectedRecipients: "Destinataires attendus",
  status: "Statut",
  lastCheckedAt: "Dernière vérification",
  notes: "Notes",
};

export const emptyWatchedFormValues: WatchedFormValues = {
  name: "",
  pageUrl: "",
  expectedRecipients: "",
  status: "not_tested",
  lastCheckedAt: "",
  notes: "",
};

export function createInitialWatchedFormState(
  values: Partial<WatchedFormValues> = {},
): WatchedFormState {
  return {
    values: {
      ...emptyWatchedFormValues,
      ...values,
    },
    fieldErrors: {},
  };
}

export function watchedFormValuesFromFormData(
  formData: FormData,
): WatchedFormValues {
  return {
    name: readFormString(formData, "name"),
    pageUrl: readFormString(formData, "pageUrl"),
    expectedRecipients: readFormString(formData, "expectedRecipients"),
    status:
      readFormString(formData, "status") || emptyWatchedFormValues.status,
    lastCheckedAt: readFormString(formData, "lastCheckedAt"),
    notes: readFormString(formData, "notes"),
  };
}

export function parseCreateWatchedForm(
  siteId: string,
  formData: FormData,
):
  | {
      success: true;
      values: WatchedFormValues;
      input: CreateWatchedFormInput;
    }
  | {
      success: false;
      state: WatchedFormState;
    } {
  const values = watchedFormValuesFromFormData(formData);
  const parsedInput = createWatchedFormSchema.safeParse({
    siteId,
    ...toWatchedFormInput(values),
  });

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

export function parseUpdateWatchedForm(formData: FormData):
  | {
      success: true;
      values: WatchedFormValues;
      input: UpdateWatchedFormInput;
    }
  | {
      success: false;
      state: WatchedFormState;
    } {
  const values = watchedFormValuesFromFormData(formData);
  const parsedInput = updateWatchedFormSchema.safeParse(
    toWatchedFormInput(values),
  );

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

export function watchedFormValuesFromRecord(input: {
  name: string;
  pageUrl: string;
  expectedRecipients?: string | null;
  status: string;
  lastCheckedAt?: Date | string | null;
  notes?: string | null;
}): WatchedFormValues {
  return {
    name: input.name,
    pageUrl: input.pageUrl,
    expectedRecipients: input.expectedRecipients ?? "",
    status: input.status,
    lastCheckedAt: input.lastCheckedAt
      ? formatDateTimeLocalInput(input.lastCheckedAt)
      : "",
    notes: input.notes ?? "",
  };
}

export function createWatchedFormErrorState(
  values: WatchedFormValues,
  formError: string,
): WatchedFormState {
  return {
    values,
    fieldErrors: {},
    formError,
  };
}

function toWatchedFormInput(values: WatchedFormValues) {
  return {
    name: values.name,
    pageUrl: values.pageUrl,
    expectedRecipients: optionalValue(values.expectedRecipients),
    status: values.status,
    lastCheckedAt: nullableValue(values.lastCheckedAt),
    notes: optionalValue(values.notes),
  };
}

function formStateFromZodError(
  values: WatchedFormValues,
  error: ZodError,
): WatchedFormState {
  const fieldErrors: WatchedFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (!isWatchedFormField(field)) {
      continue;
    }

    fieldErrors[field] = [
      ...(fieldErrors[field] ?? []),
      formatIssueMessage(field, values),
    ];
  }

  return {
    values,
    fieldErrors,
    formError:
      Object.keys(fieldErrors).length === 0
        ? "Le formulaire surveillé contient une erreur."
        : undefined,
  };
}

function readFormString(formData: FormData, key: WatchedFormField) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function nullableValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isWatchedFormField(value: unknown): value is WatchedFormField {
  return (
    typeof value === "string" &&
    [
      "name",
      "pageUrl",
      "expectedRecipients",
      "status",
      "lastCheckedAt",
      "notes",
    ].includes(value)
  );
}

function formatIssueMessage(
  field: WatchedFormField,
  values: WatchedFormValues,
) {
  if (field === "name") {
    return "Le nom du formulaire est obligatoire.";
  }

  if (field === "pageUrl") {
    return values.pageUrl.length === 0
      ? "L'URL de page est obligatoire."
      : "L'URL de page doit être valide.";
  }

  if (field === "status") {
    return "Le statut du formulaire surveillé doit être valide.";
  }

  if (field === "lastCheckedAt") {
    return "La dernière vérification doit être une date valide.";
  }

  return `${fieldLabels[field]} : valeur invalide.`;
}

function formatDateTimeLocalInput(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export const watchedFormStatusOptions: WatchedFormStatus[] =
  watchedFormStatuses.map((value) => value);
