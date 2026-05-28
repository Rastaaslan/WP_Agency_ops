import { archiveClient } from "@/features/clients/services/client-service";
import {
  apiData,
  getRouteId,
  handleApiError,
  type IdRouteContext,
} from "@/server/http/api-response";

export async function POST(_request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(await archiveClient(id));
  } catch (error) {
    return handleApiError(error);
  }
}
