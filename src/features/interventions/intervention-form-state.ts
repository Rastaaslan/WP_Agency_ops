import { ZodError } from "zod";
import {
  interventionItemStatuses,
  interventionStatuses,
  interventionTypes,
} from "@/features/core/enums";
import {
  addInterventionItemSchema,
  createInterventionSchema,
  interventionStatusSchema,
  type AddInterventionItemInput,
  type CreateInterventionInput,
  type UpdateInterventionInput,
  type UpdateInterventionItemInput,
  updateInterventionItemSchema,
  updateInterventionSchema,
} from "@/features/interventions/schemas";

export type InterventionFormField = keyof InterventionFormValues;

export type InterventionFormValues = {
  siteId: string;
  title: string;
  type: string;
  date: string;
  internalNotes: string;
  clientSummary: string;
};

export type InterventionFormState = {
  values: InterventionFormValues;
  fieldErrors: Partial<Record<InterventionFormField, string[]>>;
  formError?: string;
};

export type InterventionStatusFormValues = {
  status: string;
};

export type InterventionStatusFormState = {
  values: InterventionStatusFormValues;
  fieldErrors: Partial<Record<keyof InterventionStatusFormValues, string[]>>;
  formError?: string;
};

export type InterventionItemFormField = keyof InterventionItemFormValues;

export type InterventionItemFormValues = {
  label: string;
  status: string;
  notes: string;
};

export type InterventionItemFormState = {
  values: InterventionItemFormValues;
  fieldErrors: Partial<Record<InterventionItemFormField, string[]>>;
  formError?: string;
};

const interventionFieldLabels: Record<InterventionFormField, string> = {
  siteId: "Site",
  title: "Titre",
  type: "Type",
  date: "Date",
  internalNotes: "Notes internes",
  clientSummary: "Résumé client",
};

const itemFieldLabels: Record<InterventionItemFormField, string> = {
  label: "Libellé",
  status: "Statut",
  notes: "Notes",
};

export const emptyInterventionFormValues: InterventionFormValues = {
  siteId: "",
  title: "",
  type: "general_maintenance",
  date: "",
  internalNotes: "",
  clientSummary: "",
};

export const emptyInterventionStatusFormValues: InterventionStatusFormValues = {
  status: "planned",
};

export const emptyInterventionItemFormValues: InterventionItemFormValues = {
  label: "",
  status: "planned",
  notes: "",
};

export function createInitialInterventionFormState(
  values: Partial<InterventionFormValues> = {},
): InterventionFormState {
  return {
    values: {
      ...emptyInterventionFormValues,
      ...values,
    },
    fieldErrors: {},
  };
}

export function createInitialInterventionStatusFormState(
  values: Partial<InterventionStatusFormValues> = {},
): InterventionStatusFormState {
  return {
    values: {
      ...emptyInterventionStatusFormValues,
      ...values,
    },
    fieldErrors: {},
  };
}

export function createInitialInterventionItemFormState(
  values: Partial<InterventionItemFormValues> = {},
): InterventionItemFormState {
  return {
    values: {
      ...emptyInterventionItemFormValues,
      ...values,
    },
    fieldErrors: {},
  };
}

export function interventionFormValuesFromFormData(
  formData: FormData,
): InterventionFormValues {
  return {
    siteId: readFormString(formData, "siteId"),
    title: readFormString(formData, "title"),
    type:
      readFormString(formData, "type") || emptyInterventionFormValues.type,
    date: readFormString(formData, "date"),
    internalNotes: readFormString(formData, "internalNotes"),
    clientSummary: readFormString(formData, "clientSummary"),
  };
}

export function interventionItemFormValuesFromFormData(
  formData: FormData,
): InterventionItemFormValues {
  return {
    label: readFormString(formData, "label"),
    status:
      readFormString(formData, "status") ||
      emptyInterventionItemFormValues.status,
    notes: readFormString(formData, "notes"),
  };
}

export function interventionStatusFormValuesFromFormData(
  formData: FormData,
): InterventionStatusFormValues {
  return {
    status:
      readFormString(formData, "status") ||
      emptyInterventionStatusFormValues.status,
  };
}

export function parseCreateInterventionForm(formData: FormData):
  | {
      success: true;
      values: InterventionFormValues;
      input: CreateInterventionInput;
    }
  | {
      success: false;
      state: InterventionFormState;
    } {
  const values = interventionFormValuesFromFormData(formData);
  const parsedInput = createInterventionSchema.safeParse(
    toInterventionInput(values),
  );

  if (!parsedInput.success) {
    return {
      success: false,
      state: interventionFormStateFromZodError(values, parsedInput.error),
    };
  }

  return {
    success: true,
    values,
    input: parsedInput.data,
  };
}

export function parseUpdateInterventionForm(formData: FormData):
  | {
      success: true;
      values: InterventionFormValues;
      input: UpdateInterventionInput;
    }
  | {
      success: false;
      state: InterventionFormState;
    } {
  const values = interventionFormValuesFromFormData(formData);
  const parsedInput = updateInterventionSchema.safeParse(
    toInterventionInput(values),
  );

  if (!parsedInput.success) {
    return {
      success: false,
      state: interventionFormStateFromZodError(values, parsedInput.error),
    };
  }

  return {
    success: true,
    values,
    input: parsedInput.data,
  };
}

export function parseInterventionStatusForm(formData: FormData):
  | {
      success: true;
      values: InterventionStatusFormValues;
      status: (typeof interventionStatuses)[number];
    }
  | {
      success: false;
      state: InterventionStatusFormState;
    } {
  const values = interventionStatusFormValuesFromFormData(formData);
  const parsedStatus = interventionStatusSchema.safeParse(values.status);

  if (!parsedStatus.success) {
    return {
      success: false,
      state: {
        values,
        fieldErrors: {
          status: ["Le statut d'intervention doit être valide."],
        },
      },
    };
  }

  return {
    success: true,
    values,
    status: parsedStatus.data,
  };
}

export function parseAddInterventionItemForm(formData: FormData):
  | {
      success: true;
      values: InterventionItemFormValues;
      input: AddInterventionItemInput;
    }
  | {
      success: false;
      state: InterventionItemFormState;
    } {
  const values = interventionItemFormValuesFromFormData(formData);
  const boundaryErrorState = validateItemBoundary(values);

  if (boundaryErrorState) {
    return {
      success: false,
      state: boundaryErrorState,
    };
  }

  const parsedInput = addInterventionItemSchema.safeParse(toItemInput(values));

  if (!parsedInput.success) {
    return {
      success: false,
      state: itemFormStateFromZodError(values, parsedInput.error),
    };
  }

  return {
    success: true,
    values,
    input: parsedInput.data,
  };
}

export function parseUpdateInterventionItemForm(formData: FormData):
  | {
      success: true;
      values: InterventionItemFormValues;
      input: UpdateInterventionItemInput;
    }
  | {
      success: false;
      state: InterventionItemFormState;
    } {
  const values = interventionItemFormValuesFromFormData(formData);
  const boundaryErrorState = validateItemBoundary(values);

  if (boundaryErrorState) {
    return {
      success: false,
      state: boundaryErrorState,
    };
  }

  const parsedInput = updateInterventionItemSchema.safeParse(toItemInput(values));

  if (!parsedInput.success) {
    return {
      success: false,
      state: itemFormStateFromZodError(values, parsedInput.error),
    };
  }

  return {
    success: true,
    values,
    input: parsedInput.data,
  };
}

export function interventionValuesFromRecord(input: {
  siteId: string;
  title: string;
  type: string;
  date: Date | string;
  internalNotes?: string | null;
  clientSummary?: string | null;
}): InterventionFormValues {
  return {
    siteId: input.siteId,
    title: input.title,
    type: input.type,
    date: formatDateTimeLocalInput(input.date),
    internalNotes: input.internalNotes ?? "",
    clientSummary: input.clientSummary ?? "",
  };
}

export function interventionItemValuesFromRecord(input: {
  label: string;
  status: string;
  notes?: string | null;
}): InterventionItemFormValues {
  return {
    label: input.label,
    status: input.status,
    notes: input.notes ?? "",
  };
}

export function createInterventionFormErrorState(
  values: InterventionFormValues,
  formError: string,
): InterventionFormState {
  return {
    values,
    fieldErrors: {},
    formError,
  };
}

export function createInterventionStatusFormErrorState(
  values: InterventionStatusFormValues,
  formError: string,
): InterventionStatusFormState {
  return {
    values,
    fieldErrors: {},
    formError,
  };
}

export function createInterventionItemFormErrorState(
  values: InterventionItemFormValues,
  formError: string,
): InterventionItemFormState {
  return {
    values,
    fieldErrors: {},
    formError,
  };
}

export function looksLikeDetailedPluginItem(label: string) {
  const normalizedLabel = normalizeText(label);

  return forbiddenPluginDetailPatterns.some((pattern) =>
    pattern.test(normalizedLabel),
  );
}

function toInterventionInput(values: InterventionFormValues) {
  return {
    siteId: values.siteId,
    title: values.title,
    type: values.type,
    date: values.date,
    internalNotes: optionalValue(values.internalNotes),
    clientSummary: optionalValue(values.clientSummary),
  };
}

function toItemInput(values: InterventionItemFormValues) {
  return {
    label: values.label,
    status: values.status,
    notes: optionalValue(values.notes),
  };
}

function interventionFormStateFromZodError(
  values: InterventionFormValues,
  error: ZodError,
): InterventionFormState {
  const fieldErrors: InterventionFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (!isInterventionFormField(field)) {
      continue;
    }

    fieldErrors[field] = [
      ...(fieldErrors[field] ?? []),
      formatInterventionIssueMessage(field, values),
    ];
  }

  return {
    values,
    fieldErrors,
    formError:
      Object.keys(fieldErrors).length === 0
        ? "Le formulaire intervention contient une erreur."
        : undefined,
  };
}

function itemFormStateFromZodError(
  values: InterventionItemFormValues,
  error: ZodError,
): InterventionItemFormState {
  const fieldErrors: InterventionItemFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (!isInterventionItemFormField(field)) {
      continue;
    }

    fieldErrors[field] = [
      ...(fieldErrors[field] ?? []),
      formatItemIssueMessage(field),
    ];
  }

  return {
    values,
    fieldErrors,
    formError:
      Object.keys(fieldErrors).length === 0
        ? "Le formulaire item contient une erreur."
        : undefined,
  };
}

function validateItemBoundary(values: InterventionItemFormValues) {
  if (!looksLikeDetailedPluginItem(values.label)) {
    return null;
  }

  return {
    values,
    fieldErrors: {
      label: [
        "L'item doit rester global. Le détail plugin par plugin appartient à WPUR.",
      ],
    },
  } satisfies InterventionItemFormState;
}

function readFormString(
  formData: FormData,
  key:
    | InterventionFormField
    | InterventionItemFormField
    | keyof InterventionStatusFormValues,
) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function isInterventionFormField(
  value: unknown,
): value is InterventionFormField {
  return (
    typeof value === "string" &&
    [
      "siteId",
      "title",
      "type",
      "date",
      "internalNotes",
      "clientSummary",
    ].includes(value)
  );
}

function isInterventionItemFormField(
  value: unknown,
): value is InterventionItemFormField {
  return (
    typeof value === "string" && ["label", "status", "notes"].includes(value)
  );
}

function formatInterventionIssueMessage(
  field: InterventionFormField,
  values: InterventionFormValues,
) {
  if (field === "siteId") {
    return "Le site est obligatoire.";
  }

  if (field === "title") {
    return "Le titre est obligatoire.";
  }

  if (field === "date") {
    return values.date.length === 0
      ? "La date est obligatoire."
      : "La date doit être valide.";
  }

  if (field === "type") {
    return "Le type d'intervention doit être valide.";
  }

  return `${interventionFieldLabels[field]} : valeur invalide.`;
}

function formatItemIssueMessage(field: InterventionItemFormField) {
  if (field === "label") {
    return "Le libellé de l'item est obligatoire.";
  }

  if (field === "status") {
    return "Le statut de l'item doit être valide.";
  }

  return `${itemFieldLabels[field]} : valeur invalide.`;
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

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const forbiddenPluginDetailPatterns = [
  /comparer.*versions?.*plugins?/,
  /versions?.*plugins?.*(installees?|disponibles?)/,
  /rapport.*plugin.*figma/,
  /figma.*plugin/,
  /mettre a jour\s+(elementor|yoast|yoast seo|woocommerce|extension|plugin)/,
  /mise a jour\s+(elementor|yoast|yoast seo|woocommerce|extension|plugin)/,
  /(elementor|yoast|yoast seo|woocommerce).*\d+\.\d+/,
  /de\s+\d+\.\d+(?:\.\d+)?\s+a\s+\d+\.\d+(?:\.\d+)?/,
];

export const interventionTypeOptions = interventionTypes.map((value) => value);
export const interventionStatusOptions = interventionStatuses.map(
  (value) => value,
);
export const interventionItemStatusOptions = interventionItemStatuses.map(
  (value) => value,
);
