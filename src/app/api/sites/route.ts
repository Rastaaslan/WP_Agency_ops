import { createSite, listSites } from "@/features/sites/services/site-service";
import { apiData, handleApiError, readJson } from "@/server/http/api-response";

export async function GET() {
  try {
    return apiData(await listSites());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return apiData(await createSite(await readJson(request)), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
