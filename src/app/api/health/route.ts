import { APP_NAME } from "@/lib/app-info";
import { env } from "@/server/env";

export function GET() {
  return Response.json({
    status: "ok",
    app: APP_NAME,
    environment: env.NODE_ENV,
  });
}
