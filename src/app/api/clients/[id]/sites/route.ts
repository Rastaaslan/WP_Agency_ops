import { listSitesByClient } from "@/features/sites/services/site-service";
import {
  apiData,
  getRouteId,
  handleApiError,
  type IdRouteContext,
} from "@/server/http/api-response";

export async function GET(_request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(await listSitesByClient(id));
  } catch (error) {
    return handleApiError(error);
  }
}
