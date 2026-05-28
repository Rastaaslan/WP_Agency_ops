import { prisma } from "@/server/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    await prisma.client.count();

    return Response.json({
      status: "ok",
      checkedAt,
      checks: {
        database: "ok",
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: "degraded",
        checkedAt,
        checks: {
          database: "failed",
        },
        message:
          error instanceof Error
            ? error.message
            : "Database health check failed.",
      },
      { status: 503 },
    );
  }
}
