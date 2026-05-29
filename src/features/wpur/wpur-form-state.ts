import { wpurPayloadSchema } from "@/features/wpur/schemas";

export type WpurImportFormField = keyof WpurImportFormValues;

export type WpurImportFormValues = {
  payloadJson: string;
};

export type WpurImportFormState = {
  values: WpurImportFormValues;
  fieldErrors: Partial<Record<WpurImportFormField, string[]>>;
  formError?: string;
};

export const emptyWpurImportFormValues: WpurImportFormValues = {
  payloadJson: "",
};

export function createInitialWpurImportFormState(
  values: Partial<WpurImportFormValues> = {},
): WpurImportFormState {
  return {
    values: {
      ...emptyWpurImportFormValues,
      ...values,
    },
    fieldErrors: {},
  };
}

export function wpurImportFormValuesFromFormData(
  formData: FormData,
): WpurImportFormValues {
  const value = formData.get("payloadJson");

  return {
    payloadJson: typeof value === "string" ? value : "",
  };
}

export function parseWpurImportForm(formData: FormData):
  | {
      success: true;
      values: WpurImportFormValues;
      payload: unknown;
    }
  | {
      success: false;
      state: WpurImportFormState;
    } {
  const values = wpurImportFormValuesFromFormData(formData);

  if (values.payloadJson.trim().length === 0) {
    return {
      success: false,
      state: createWpurImportFieldErrorState(values, [
        "Le contenu JSON de l'export WPUR est obligatoire.",
      ]),
    };
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(values.payloadJson);
  } catch {
    return {
      success: false,
      state: createWpurImportFieldErrorState(values, [
        "Le JSON de l'export WPUR est invalide. Vérifiez le copier-coller puis réessayez.",
      ]),
    };
  }

  const parsedPayload = wpurPayloadSchema.safeParse(parsedJson);

  if (!parsedPayload.success) {
    return {
      success: false,
      state: createWpurImportFieldErrorState(values, [
        "L'export WPUR n'a pas la forme attendue. Vérifiez qu'il provient bien de WPUR.",
      ]),
    };
  }

  return {
    success: true,
    values,
    payload: parsedPayload.data,
  };
}

export function createWpurImportFormErrorState(
  values: WpurImportFormValues,
  formError: string,
): WpurImportFormState {
  return {
    values,
    fieldErrors: {},
    formError,
  };
}

function createWpurImportFieldErrorState(
  values: WpurImportFormValues,
  errors: string[],
): WpurImportFormState {
  return {
    values,
    fieldErrors: {
      payloadJson: errors,
    },
  };
}
