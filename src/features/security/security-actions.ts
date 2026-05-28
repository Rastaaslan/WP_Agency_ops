"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SecurityCheckFormState } from "@/features/security/security-form-state";
import { runSecurityCheck } from "@/features/security/services/security-check-service";

export async function runSecurityCheckAction(
  siteId: string,
  _state: SecurityCheckFormState,
  _formData: FormData,
): Promise<SecurityCheckFormState> {
  void _state;
  void _formData;

  try {
    const securityCheck = await runSecurityCheck(siteId);

    if (!securityCheck) {
      return {
        formError: "Site introuvable. Impossible de lancer le contrôle.",
      };
    }
  } catch {
    return {
      formError:
        "Impossible de lancer le contrôle sécurité. Réessayez plus tard ou vérifiez l'URL du site.",
    };
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}`);
}
