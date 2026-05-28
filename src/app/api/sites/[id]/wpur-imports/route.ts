import {
  importWpurPayload,
  listWpurImportsBySite,
} from "@/features/wpur/services/wpur-import-service";
import {
  apiData,
  getRouteId,
  handleApiError,
  type IdRouteContext,
  readJson,
} from "@/server/http/api-response";

export async function GET(_request: Request, context: IdRouteContext) {
  try {
    const id = await getRouteId(context);

    return apiData(await listWpurImportsBySite(id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: IdRouteContext) {
  try {
    const siteId = await getRouteId(context);
    const importedPayload = await importWpurPayload(
      siteId,
      extractPayload(await readJson(request)),
    );

    return apiData(
      {
        import: importedPayload,
        summary: importedPayload.summaryJson ?? null,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

function extractPayload(body: unknown) {
  if (body && typeof body === "object" && "payload" in body) {
    return body.payload;
  }

  return body;
}
