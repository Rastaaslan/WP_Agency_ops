import { PrismaSiteTechnicalExportService } from "@/features/site-exports/services/site-technical-export";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const service = new PrismaSiteTechnicalExportService();
  const exported = await service.exportSiteTechnicalState(id);

  return Response.json({ data: exported });
}

