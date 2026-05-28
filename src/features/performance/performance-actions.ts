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
          "Site introuvable. Impossible de lancer le contrôle performance.",
      };
    }
  } catch {
    return {
      formError:
        "Impossible de lancer le contrôle performance. Réessayez plus tard ou vérifiez l'URL du site.",
    };
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}`);
}
