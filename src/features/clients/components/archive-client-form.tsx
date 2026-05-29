"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";
import {
  createInitialClientFormState,
  type ClientFormState,
} from "@/features/clients/client-form-state";

type ArchiveClientAction = (
  state: ClientFormState,
  formData: FormData,
) => Promise<ClientFormState>;

export function ArchiveClientForm({
  action,
  disabled = false,
}: {
  action: ArchiveClientAction;
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialClientFormState(),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Confirmer l'archivage ?\n\nCette action ne supprime pas les données.",
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  if (disabled) {
    return (
      <span className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-zinc-100 px-3 text-sm font-medium text-zinc-500">
        Client archivé
      </span>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2"
      onSubmit={handleSubmit}
    >
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-amber-300 bg-amber-50 px-3 text-sm font-medium text-amber-900 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Archivage..." : "Archiver"}
      </button>
      <p className="max-w-xs text-xs leading-5 text-zinc-500">
        Cette action ne supprime pas les données.
      </p>
      {state.formError ? (
        <p className="max-w-xs text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
