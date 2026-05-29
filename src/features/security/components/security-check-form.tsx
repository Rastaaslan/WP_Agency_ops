"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";
import {
  createInitialSecurityCheckFormState,
  type SecurityCheckFormState,
} from "@/features/security/security-form-state";

type SecurityCheckAction = (
  state: SecurityCheckFormState,
  formData: FormData,
) => Promise<SecurityCheckFormState>;

export function SecurityCheckForm({ action }: { action: SecurityCheckAction }) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialSecurityCheckFormState(),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Lancer le contrôle sécurité ?\n\nLe contrôle va interroger l'URL du site et quelques ressources publiques une fois.",
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2"
      onSubmit={handleSubmit}
    >
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Contrôle en cours..." : "Lancer un contrôle sécurité"}
      </button>
      <p className="max-w-xl text-xs leading-5 text-zinc-500">
        Le contrôle reste simple et non offensif.
      </p>
      {state.formError ? (
        <p className="max-w-xl text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
