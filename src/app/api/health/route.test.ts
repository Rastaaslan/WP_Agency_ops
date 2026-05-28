import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { countClients } = vi.hoisted(() => ({
  countClients: vi.fn(),
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    client: {
      count: countClients,
    },
  },
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    countClients.mockReset();
  });

  it("returns ok when the database responds", async () => {
    countClients.mockResolvedValue(0);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      checks: {
        database: "ok",
      },
    });
    expect(body.checkedAt).toEqual(expect.any(String));
  });

  it("returns degraded when the database check fails", async () => {
    countClients.mockRejectedValue(new Error("database unavailable"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      status: "degraded",
      checks: {
        database: "failed",
      },
      message: "database unavailable",
    });
    expect(body.checkedAt).toEqual(expect.any(String));
  });
});
