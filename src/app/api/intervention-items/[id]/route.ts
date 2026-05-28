import { updateInterventionItem } from "@/features/interventions/services/intervention-service";
import {
  apiData,
  getRouteId,
  handleApiError,
  type IdRouteContext,
  readJson,
} from "@/server/http/api-response";

export async function PATCH(request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(await updateInterventionItem(id, await readJson(request)));
  } catch (error) {
    return handleApiError(error);
  }
}
