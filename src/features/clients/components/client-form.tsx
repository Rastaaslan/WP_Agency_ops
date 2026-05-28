"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createInitialClientFormState,
  type ClientFormState,
  type ClientFormValues,
} from "@/features/clients/client-form-state";

type ClientFormAction = (
  state: ClientFormState,
  formData: FormData,
) => Promise<ClientFormState>;

type ClientFormProps = {
  action: ClientFormAction;
  cancelHref: string;
  initialValues?: Partial<ClientFormValues>;
  submitLabel: string;
};

export function ClientForm({
  action,
  cancelHref,
  initialValues,
  submitLabel,
}: ClientFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialClientFormState(initialValues),
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}

      <FormField
        errors={state.fieldErrors.name}
        label="Nom"
        name="name"
        required
        value={state.values.name}
      />
      <FormField
        errors={state.fieldErrors.companyName}
        label="Entreprise"
        name="companyName"
        value={state.values.companyName}
      />
      <FormField
        errors={state.fieldErrors.email}
        label="Email"
        name="email"
        type="email"
        value={state.values.email}
      />
      <FormField
        errors={state.fieldErrors.phone}
        label="Téléphone"
        name="phone"
        value={state.values.phone}
      />
      <FormField
        as="textarea"
        errors={state.fieldErrors.notes}
        label="Notes"
        name="notes"
        value={state.values.notes}
      />

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
  name: keyof ClientFormValues;
  required?: boolean;
  type?: string;
  value: string;
}) {
  const inputId = `client-${name}`;
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
      {errors?.length ? (
        <ul className="mt-2 space-y-1 text-sm text-red-700">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
