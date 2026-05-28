import {
  createIntervention,
  listInterventions,
} from "@/features/interventions/services/intervention-service";
import { apiData, handleApiError, readJson } from "@/server/http/api-response";

export async function GET() {
  try {
    return apiData(await listInterventions());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return apiData(await createIntervention(await readJson(request)), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
