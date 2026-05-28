import { getWpurImportById } from "@/features/wpur/services/wpur-import-service";
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
      ensureFound(await getWpurImportById(id), "WPUR import not found."),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
