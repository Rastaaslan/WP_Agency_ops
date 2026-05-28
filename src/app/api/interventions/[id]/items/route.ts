import { addInterventionItem } from "@/features/interventions/services/intervention-service";
import {
  apiData,
  getRouteId,
  handleApiError,
  type IdRouteContext,
  readJson,
} from "@/server/http/api-response";

export async function POST(request: Request, context: IdRouteContext) {
  try {
    const interventionId = await getRouteId(context);

    return apiData(
      await addInterventionItem(interventionId, await readJson(request)),
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
