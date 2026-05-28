import { describe, expect, it } from "vitest";
import { APP_NAME } from "@/lib/app-info";
import { env } from "@/server/env";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns the minimal application health payload", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: "ok",
      app: APP_NAME,
      environment: env.NODE_ENV,
    });
  });
});
