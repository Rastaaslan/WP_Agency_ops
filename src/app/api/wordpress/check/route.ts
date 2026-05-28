import { z } from "zod";
import { PublicRestWordPressConnector } from "@/features/wordpress/connectors/public-rest";

const schema = z.object({
  id: z.string().default("api-check"),
  name: z.string().default("Site"),
  url: z.string().min(1),
  connectionType: z.string().default("public_rest"),
});

export async function POST(request: Request) {
  const site = schema.parse(await request.json());
  const connector = new PublicRestWordPressConnector();
  const result = await connector.checkConnection(site);

  return Response.json({ data: result });
}
