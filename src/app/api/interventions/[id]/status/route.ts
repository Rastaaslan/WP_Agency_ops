import { updateInterventionStatus } from "@/features/interventions/services/intervention-service";
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

    return apiData(
      await updateInterventionStatus(id, extractStatus(await readJson(request))),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

function extractStatus(body: unknown) {
  if (body && typeof body === "object" && "status" in body) {
    return body.status;
  }

  return body;
}
