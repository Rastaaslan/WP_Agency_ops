"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PerformanceCheckFormState } from "@/features/performance/performance-form-state";
import { runPerformanceCheck } from "@/features/performance/services/performance-check-service";

export async function runPerformanceCheckAction(
  siteId: string,
  _state: PerformanceCheckFormState,
  _formData: FormData,
): Promise<PerformanceCheckFormState> {
  void _state;
  void _formData;

  try {
    const performanceCheck = await runPerformanceCheck(siteId);

    if (!performanceCheck) {
      return {
        formError:
          "Site introuvable. Le contrôle performance n'a pas été lancé.",
      };
    }
  } catch {
    return {
      formError:
        "Le contrôle performance n'a pas pu démarrer. Vérifiez l'URL du site puis réessayez.",
    };
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}?notice=performance-check-run`);
}
