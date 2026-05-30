import { exportSiteTechnicalState } from "@/features/site-exports/services/site-technical-export-service";
import {
  apiData,
  ensureFound,
  getRouteId,
  handleApiError,
  type IdRouteContext,
} from "@/server/http/api-response";

export async function GET(_request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(
      ensureFound(
        await exportSiteTechnicalState(id),
        "État technique du site introuvable.",
      ),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
