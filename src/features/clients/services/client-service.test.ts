import { beforeEach, describe, expect, it, vi } from "vitest";
import { archiveClient, createClient } from "./client-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    client: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("client service", () => {
  beforeEach(() => {
    prismaMock.client.create.mockReset();
    prismaMock.client.update.mockReset();
  });

  it("creates a client through the validated schema", async () => {
    prismaMock.client.create.mockResolvedValue({ id: "client_1" });

    await createClient({
      name: "Client Demo",
      email: "client@example.com",
    });

    expect(prismaMock.client.create).toHaveBeenCalledWith({
      data: {
        name: "Client Demo",
        email: "client@example.com",
        status: "active",
      },
    });
  });

  it("archives a client instead of deleting it", async () => {
    prismaMock.client.update.mockResolvedValue({
      id: "client_1",
      status: "archived",
    });

    await archiveClient("client_1");

    expect(prismaMock.client.update).toHaveBeenCalledWith({
      where: { id: "client_1" },
      data: {
        status: "archived",
      },
    });
  });
});
