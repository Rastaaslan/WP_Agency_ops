"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createInitialInterventionFormState,
  interventionTypeOptions,
  type InterventionFormState,
  type InterventionFormValues,
} from "@/features/interventions/intervention-form-state";
import { formatEnumLabel } from "@/lib/format";

type InterventionFormAction = (
  state: InterventionFormState,
  formData: FormData,
) => Promise<InterventionFormState>;

type InterventionFormSite = {
  id: string;
  name: string;
  clientName?: string | null;
};

type InterventionFormProps = {
  action: InterventionFormAction;
  cancelHref: string;
  initialValues?: Partial<InterventionFormValues>;
  sites: InterventionFormSite[];
  submitLabel: string;
};

export function InterventionForm({
  action,
  cancelHref,
  initialValues,
  sites,
  submitLabel,
}: InterventionFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialInterventionFormState(initialValues),
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}

      <FormSelect
        errors={state.fieldErrors.siteId}
        label="Site"
        name="siteId"
        options={sites.map((site) => ({
          label: site.clientName ? `${site.name} · ${site.clientName}` : site.name,
          value: site.id,
        }))}
        placeholder="Choisir un site"
        required
        value={state.values.siteId}
      />
      <FormField
        errors={state.fieldErrors.title}
        label="Titre"
        name="title"
        required
        value={state.values.title}
      />
      <FormSelect
        errors={state.fieldErrors.type}
        label="Type"
        name="type"
        options={interventionTypeOptions.map((value) => ({
          label: formatEnumLabel(value),
          value,
        }))}
        required
        value={state.values.type}
      />
      <FormField
        errors={state.fieldErrors.date}
        label="Date"
        name="date"
        required
        type="datetime-local"
        value={state.values.date}
      />
      <FormField
        as="textarea"
        errors={state.fieldErrors.internalNotes}
        label="Notes internes"
        name="internalNotes"
        value={state.values.internalNotes}
      />
      <FormField
        as="textarea"
        errors={state.fieldErrors.clientSummary}
        label="Résumé client"
        name="clientSummary"
        value={state.values.clientSummary}
      />

      <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending || sites.length === 0}
          type="submit"
        >
          {pending ? "Enregistrement..." : submitLabel}
        </button>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-cyan-300 hover:text-cyan-800"
          href={cancelHref}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}

function FormField({
  as = "input",
  errors,
  label,
  name,
  required = false,
  type = "text",
  value,
}: {
  as?: "input" | "textarea";
  errors?: string[];
  label: string;
  name: keyof InterventionFormValues;
  required?: boolean;
  type?: string;
  value: string;
}) {
  const inputId = `intervention-${name}`;
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
          className={`${className} min-h-28 resize-y`}
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
          type={type}
        />
      )}
      <FieldErrors errors={errors} />
    </div>
  );
}

function FormSelect({
  errors,
  label,
  name,
  options,
  placeholder,
  required = false,
  value,
}: {
  errors?: string[];
  label: string;
  name: keyof InterventionFormValues;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  const inputId = `intervention-${name}`;
  const hasErrors = Boolean(errors?.length);

  return (
    <div>
      <label className="text-sm font-medium text-zinc-800" htmlFor={inputId}>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      <select
        className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 ${
          hasErrors ? "border-red-300" : "border-zinc-300"
        }`}
        defaultValue={value}
        id={inputId}
        name={name}
        required={required}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
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
