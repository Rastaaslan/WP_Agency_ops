"use client";

import { useActionState } from "react";
import {
  createInitialPerformanceCheckFormState,
  type PerformanceCheckFormState,
} from "@/features/performance/performance-form-state";

type PerformanceCheckAction = (
  state: PerformanceCheckFormState,
  formData: FormData,
) => Promise<PerformanceCheckFormState>;

export function PerformanceCheckForm({
  action,
}: {
  action: PerformanceCheckAction;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialPerformanceCheckFormState(),
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Contrôle performance en cours..."
          : "Lancer un contrôle performance"}
      </button>
      {state.formError ? (
        <p className="max-w-xl text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
