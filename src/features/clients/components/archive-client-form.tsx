"use client";

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

  if (disabled) {
    return (
      <span className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-zinc-100 px-3 text-sm font-medium text-zinc-500">
        Client archivé
      </span>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-amber-300 bg-amber-50 px-3 text-sm font-medium text-amber-900 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Archivage..." : "Archiver"}
      </button>
      {state.formError ? (
        <p className="max-w-xs text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
