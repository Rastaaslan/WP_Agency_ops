import { listInterventionsBySite } from "@/features/interventions/services/intervention-service";
import {
  apiData,
  getRouteId,
  handleApiError,
  type IdRouteContext,
} from "@/server/http/api-response";

export async function GET(_request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(await listInterventionsBySite(id));
  } catch (error) {
    return handleApiError(error);
  }
}
