import {
  getInterventionById,
  updateIntervention,
} from "@/features/interventions/services/intervention-service";
import {
  apiData,
  ensureFound,
  getRouteId,
  handleApiError,
  type IdRouteContext,
  readJson,
} from "@/server/http/api-response";

export async function GET(_request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(
      ensureFound(await getInterventionById(id), "Intervention not found."),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(await updateIntervention(id, await readJson(request)));
  } catch (error) {
    return handleApiError(error);
  }
}
