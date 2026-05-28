import { checkWordPressConnection } from "@/features/wordpress/services/scanner";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await checkWordPressConnection(id);

  return Response.json({ data: result });
}
