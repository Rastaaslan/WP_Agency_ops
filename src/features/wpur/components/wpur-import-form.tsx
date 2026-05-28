"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createInitialWpurImportFormState,
  type WpurImportFormState,
} from "@/features/wpur/wpur-form-state";

type WpurImportFormAction = (
  state: WpurImportFormState,
  formData: FormData,
) => Promise<WpurImportFormState>;

type WpurImportFormProps = {
  action: WpurImportFormAction;
  cancelHref: string;
};

export function WpurImportForm({ action, cancelHref }: WpurImportFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialWpurImportFormState(),
  );
  const payloadErrors = state.fieldErrors.payloadJson;
  const hasPayloadErrors = Boolean(payloadErrors?.length);

  return (
    <form action={formAction} className="space-y-5">
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
          {state.formError}
        </p>
      ) : null}

      <div>
        <label className="text-sm font-medium text-zinc-800" htmlFor="wpur-payloadJson">
          Payload JSON WPUR <span className="text-red-600">*</span>
        </label>
        <textarea
          className={`mt-2 min-h-96 w-full resize-y rounded-md border bg-white px-3 py-2 font-mono text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 ${
            hasPayloadErrors ? "border-red-300" : "border-zinc-300"
          }`}
          defaultValue={state.values.payloadJson}
          id="wpur-payloadJson"
          name="payloadJson"
          placeholder='{"schemaVersion":"1.0","reportType":"monthly-plugin-maintenance","period":{"month":"2026-05"}}'
          spellCheck={false}
        />
        {payloadErrors?.length ? (
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {payloadErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Import en cours..." : "Importer le payload WPUR"}
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
