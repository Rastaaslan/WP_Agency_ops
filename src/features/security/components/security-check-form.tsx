"use client";

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

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Contrôle en cours..." : "Lancer un contrôle sécurité"}
      </button>
      {state.formError ? (
        <p className="max-w-xl text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
