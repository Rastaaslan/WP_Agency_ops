"use client";

import { useActionState } from "react";
import {
  createInitialInterventionItemFormState,
  interventionItemStatusOptions,
  type InterventionItemFormState,
  type InterventionItemFormValues,
} from "@/features/interventions/intervention-form-state";
import { formatEnumLabel } from "@/lib/format";

type InterventionItemAction = (
  state: InterventionItemFormState,
  formData: FormData,
) => Promise<InterventionItemFormState>;

export function InterventionItemForm({
  action,
  formId = "intervention-item",
  initialValues,
  submitLabel,
}: {
  action: InterventionItemAction;
  formId?: string;
  initialValues?: Partial<InterventionItemFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialInterventionItemFormState(initialValues),
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}

      <FormField
        errors={state.fieldErrors.label}
        formId={formId}
        label="Libellé"
        name="label"
        required
        value={state.values.label}
      />
      <FormSelect
        errors={state.fieldErrors.status}
        formId={formId}
        label="Statut"
        name="status"
        options={interventionItemStatusOptions.map((status) => ({
          label: formatEnumLabel(status),
          value: status,
        }))}
        value={state.values.status}
      />
      <FormField
        as="textarea"
        errors={state.fieldErrors.notes}
        formId={formId}
        label="Notes"
        name="notes"
        value={state.values.notes}
      />
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}

function FormField({
  as = "input",
  errors,
  formId,
  label,
  name,
  required = false,
  value,
}: {
  as?: "input" | "textarea";
  errors?: string[];
  formId: string;
  label: string;
  name: keyof InterventionItemFormValues;
  required?: boolean;
  value: string;
}) {
  const inputId = `${formId}-${name}`;
  const hasErrors = Boolean(errors?.length);
  const className = `mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 ${
    hasErrors ? "border-red-300" : "border-zinc-300"
  }`;

  return (
    <div>
      <label className="text-sm font-medium text-zinc-800" htmlFor={inputId}>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {as === "textarea" ? (
        <textarea
          className={`${className} min-h-24 resize-y`}
          defaultValue={value}
          id={inputId}
          name={name}
        />
      ) : (
        <input
          className={className}
          defaultValue={value}
          id={inputId}
          name={name}
          required={required}
          type="text"
        />
      )}
      <FieldErrors errors={errors} />
    </div>
  );
}

function FormSelect({
  errors,
  formId,
  label,
  name,
  options,
  value,
}: {
  errors?: string[];
  formId: string;
  label: string;
  name: keyof InterventionItemFormValues;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  const inputId = `${formId}-${name}`;
  const hasErrors = Boolean(errors?.length);

  return (
    <div>
      <label className="text-sm font-medium text-zinc-800" htmlFor={inputId}>
        {label}
      </label>
      <select
        className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 ${
          hasErrors ? "border-red-300" : "border-zinc-300"
        }`}
        defaultValue={value}
        id={inputId}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldErrors errors={errors} />
    </div>
  );
}

function FieldErrors({ errors }: { errors?: string[] }) {
  return errors?.length ? (
    <ul className="mt-2 space-y-1 text-sm text-red-700">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  ) : null;
}
