"use client";

import type { FormEvent } from "react";
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Lancer le contrôle performance ?\n\nLe contrôle va interroger l'URL du site une fois.",
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
        {pending
          ? "Contrôle performance en cours..."
          : "Lancer un contrôle performance"}
      </button>
      <p className="max-w-xl text-xs leading-5 text-zinc-500">
        Le contrôle reste limité à l&apos;URL du site.
      </p>
      {state.formError ? (
        <p className="max-w-xl text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
