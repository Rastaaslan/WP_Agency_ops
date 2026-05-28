"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  backupStatusOptions,
  backupTypeOptions,
  createInitialBackupFormState,
  type BackupFormState,
  type BackupFormValues,
} from "@/features/backups/backup-form-state";
import { formatEnumLabel } from "@/lib/format";

type BackupFormAction = (
  state: BackupFormState,
  formData: FormData,
) => Promise<BackupFormState>;

type BackupInterventionOption = {
  id: string;
  title: string;
};

type BackupFormProps = {
  action: BackupFormAction;
  cancelHref: string;
  initialValues?: Partial<BackupFormValues>;
  interventions: BackupInterventionOption[];
  submitLabel: string;
};

export function BackupForm({
  action,
  cancelHref,
  initialValues,
  interventions,
  submitLabel,
}: BackupFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialBackupFormState(initialValues),
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}

      <FormSelect
        errors={state.fieldErrors.type}
        label="Type"
        name="type"
        options={backupTypeOptions.map((type) => ({
          label: formatEnumLabel(type),
          value: type,
        }))}
        required
        value={state.values.type}
      />
      <FormSelect
        errors={state.fieldErrors.status}
        label="Statut"
        name="status"
        options={backupStatusOptions.map((status) => ({
          label: formatEnumLabel(status),
          value: status,
        }))}
        required
        value={state.values.status}
      />
      <FormField
        errors={state.fieldErrors.performedAt}
        label="Date"
        name="performedAt"
        required
        type="datetime-local"
        value={state.values.performedAt}
      />
      <FormField
        errors={state.fieldErrors.provider}
        label="Fournisseur"
        name="provider"
        value={state.values.provider}
      />
      <FormField
        errors={state.fieldErrors.storageLocation}
        label="Emplacement"
        name="storageLocation"
        value={state.values.storageLocation}
      />
      <FormSelect
        errors={state.fieldErrors.interventionId}
        label="Intervention liée"
        name="interventionId"
        options={interventions.map((intervention) => ({
          label: intervention.title,
          value: intervention.id,
        }))}
        placeholder="Aucune intervention liée"
        value={state.values.interventionId}
      />
      <FormField
        as="textarea"
        errors={state.fieldErrors.notes}
        label="Notes"
        name="notes"
        value={state.values.notes}
      />

      <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-700">
        Ce formulaire documente une sauvegarde déjà planifiée ou réalisée. WP
        Agency Ops ne lance aucune sauvegarde automatique et ne stocke aucun
        fichier de backup.
      </p>

      <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
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
  name: keyof BackupFormValues;
  required?: boolean;
  type?: string;
  value: string;
}) {
  const inputId = `backup-${name}`;
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
  name: keyof BackupFormValues;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  const inputId = `backup-${name}`;
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
