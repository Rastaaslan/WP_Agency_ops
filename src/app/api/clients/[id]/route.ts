import {
  getClientById,
  updateClient,
} from "@/features/clients/services/client-service";
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

    return apiData(ensureFound(await getClientById(id), "Client not found."));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(await updateClient(id, await readJson(request)));
  } catch (error) {
    return handleApiError(error);
  }
}
