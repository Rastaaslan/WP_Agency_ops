"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";
import {
  createInitialInterventionStatusFormState,
  interventionStatusOptions,
  type InterventionStatusFormState,
} from "@/features/interventions/intervention-form-state";
import { formatEnumLabel } from "@/lib/format";

type InterventionStatusAction = (
  state: InterventionStatusFormState,
  formData: FormData,
) => Promise<InterventionStatusFormState>;

export function InterventionStatusForm({
  action,
  currentStatus,
}: {
  action: InterventionStatusAction;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialInterventionStatusFormState({ status: currentStatus }),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const nextStatus = formData.get("status");

    if (currentStatus === "cancelled" || nextStatus !== "cancelled") {
      return;
    }

    const confirmed = window.confirm(
      "Confirmer l'annulation ?\n\nL'intervention passera au statut annulé sans supprimer les données.",
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} className="space-y-3" onSubmit={handleSubmit}>
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}
      <div>
        <label
          className="text-sm font-medium text-zinc-800"
          htmlFor="intervention-status"
        >
          Avancement
        </label>
        <select
          className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          defaultValue={state.values.status}
          id="intervention-status"
          name="status"
        >
          {interventionStatusOptions.map((status) => (
            <option key={status} value={status}>
              {formatEnumLabel(status)}
            </option>
          ))}
        </select>
        {state.fieldErrors.status?.length ? (
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {state.fieldErrors.status.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Mise à jour..." : "Mettre à jour l'avancement"}
      </button>
    </form>
  );
}
