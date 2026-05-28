import {
  createClient,
  listClients,
} from "@/features/clients/services/client-service";
import { apiData, handleApiError, readJson } from "@/server/http/api-response";

export async function GET() {
  try {
    return apiData(await listClients());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return apiData(await createClient(await readJson(request)), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
