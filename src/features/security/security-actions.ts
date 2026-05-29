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
        formError: "Site introuvable. Le contrôle sécurité n'a pas été lancé.",
      };
    }
  } catch {
    return {
      formError:
        "Le contrôle sécurité n'a pas pu démarrer. Vérifiez l'URL du site puis réessayez.",
    };
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/api/sites/${siteId}/technical-export`);
  redirect(`/sites/${siteId}?notice=security-check-run`);
}
