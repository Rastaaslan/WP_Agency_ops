import { ZodError } from "zod";
import {
  backupStatuses,
  backupTypes,
  type BackupStatus,
  type BackupType,
} from "@/features/core/enums";
import {
  createBackupSchema,
  type CreateBackupInput,
  type UpdateBackupInput,
  updateBackupSchema,
} from "@/features/backups/schemas";

export type BackupFormField = keyof BackupFormValues;

export type BackupFormValues = {
  type: string;
  status: string;
  performedAt: string;
  provider: string;
  storageLocation: string;
  interventionId: string;
  notes: string;
};

export type BackupFormState = {
  values: BackupFormValues;
  fieldErrors: Partial<Record<BackupFormField, string[]>>;
  formError?: string;
};

const fieldLabels: Record<BackupFormField, string> = {
  type: "Type",
  status: "Statut",
  performedAt: "Date",
  provider: "Fournisseur",
  storageLocation: "Emplacement",
  interventionId: "Suivi technique",
  notes: "Notes",
};

export const emptyBackupFormValues: BackupFormValues = {
  type: "full",
  status: "done",
  performedAt: "",
  provider: "",
  storageLocation: "",
  interventionId: "",
  notes: "",
};

export function createInitialBackupFormState(
  values: Partial<BackupFormValues> = {},
): BackupFormState {
  return {
    values: {
      ...emptyBackupFormValues,
      ...values,
    },
    fieldErrors: {},
  };
}

export function backupFormValuesFromFormData(
  formData: FormData,
): BackupFormValues {
  return {
    type: readFormString(formData, "type") || emptyBackupFormValues.type,
    status:
      readFormString(formData, "status") || emptyBackupFormValues.status,
    performedAt: readFormString(formData, "performedAt"),
    provider: readFormString(formData, "provider"),
    storageLocation: readFormString(formData, "storageLocation"),
    interventionId: readFormString(formData, "interventionId"),
    notes: readFormString(formData, "notes"),
  };
}

export function parseCreateBackupForm(
  siteId: string,
  formData: FormData,
):
  | {
      success: true;
      values: BackupFormValues;
      input: CreateBackupInput;
    }
  | {
      success: false;
      state: BackupFormState;
    } {
  const values = backupFormValuesFromFormData(formData);
  const parsedInput = createBackupSchema.safeParse({
    siteId,
    ...toBackupInput(values),
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

export function parseUpdateBackupForm(formData: FormData):
  | {
      success: true;
      values: BackupFormValues;
      input: UpdateBackupInput;
    }
  | {
      success: false;
      state: BackupFormState;
    } {
  const values = backupFormValuesFromFormData(formData);
  const parsedInput = updateBackupSchema.safeParse(toBackupInput(values));

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

export function backupValuesFromRecord(input: {
  type: string;
  status: string;
  performedAt: Date | string;
  provider?: string | null;
  storageLocation?: string | null;
  interventionId?: string | null;
  notes?: string | null;
}): BackupFormValues {
  return {
    type: input.type,
    status: input.status,
    performedAt: formatDateTimeLocalInput(input.performedAt),
    provider: input.provider ?? "",
    storageLocation: input.storageLocation ?? "",
    interventionId: input.interventionId ?? "",
    notes: input.notes ?? "",
  };
}

export function createBackupFormErrorState(
  values: BackupFormValues,
  formError: string,
): BackupFormState {
  return {
    values,
    fieldErrors: {},
    formError,
  };
}

function toBackupInput(values: BackupFormValues) {
  return {
    type: values.type,
    status: values.status,
    performedAt: values.performedAt,
    provider: optionalValue(values.provider),
    storageLocation: optionalValue(values.storageLocation),
    interventionId: nullableValue(values.interventionId),
    notes: optionalValue(values.notes),
  };
}

function formStateFromZodError(
  values: BackupFormValues,
  error: ZodError,
): BackupFormState {
  const fieldErrors: BackupFormState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (!isBackupFormField(field)) {
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
        ? "Le formulaire sauvegarde contient une erreur."
        : undefined,
  };
}

function readFormString(formData: FormData, key: BackupFormField) {
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

function isBackupFormField(value: unknown): value is BackupFormField {
  return (
    typeof value === "string" &&
    [
      "type",
      "status",
      "performedAt",
      "provider",
      "storageLocation",
      "interventionId",
      "notes",
    ].includes(value)
  );
}

function formatIssueMessage(field: BackupFormField, values: BackupFormValues) {
  if (field === "type") {
    return "Le type de sauvegarde doit être valide.";
  }

  if (field === "status") {
    return "Le statut de sauvegarde doit être valide.";
  }

  if (field === "performedAt") {
    return values.performedAt.length === 0
      ? "La date de sauvegarde est obligatoire."
      : "La date de sauvegarde doit être valide.";
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

export const backupTypeOptions: BackupType[] = backupTypes.map((value) => value);
export const backupStatusOptions: BackupStatus[] = backupStatuses.map(
  (value) => value,
);
