import { beforeEach, describe, expect, it, vi } from "vitest";
import { archiveSite, createSite } from "./site-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    site: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("site service", () => {
  beforeEach(() => {
    prismaMock.site.create.mockReset();
    prismaMock.site.update.mockReset();
  });

  it("creates a site through the validated schema", async () => {
    prismaMock.site.create.mockResolvedValue({ id: "site_1" });

    await createSite({
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
    });

    expect(prismaMock.site.create).toHaveBeenCalledWith({
      data: {
        clientId: "client_1",
        name: "Site Demo",
        url: "https://example.com",
        environment: "production",
        status: "active",
      },
    });
  });

  it("archives a site instead of deleting it", async () => {
    prismaMock.site.update.mockResolvedValue({
      id: "site_1",
      status: "archived",
    });

    await archiveSite("site_1");

    expect(prismaMock.site.update).toHaveBeenCalledWith({
      where: { id: "site_1" },
      data: {
        status: "archived",
      },
    });
  });
});
