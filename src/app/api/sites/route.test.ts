import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { siteServiceMock } = vi.hoisted(() => ({
  siteServiceMock: {
    createSite: vi.fn(),
    listSites: vi.fn(),
  },
}));

vi.mock("@/features/sites/services/site-service", () => siteServiceMock);

describe("POST /api/sites", () => {
  beforeEach(() => {
    siteServiceMock.createSite.mockReset();
    siteServiceMock.listSites.mockReset();
  });

  it("creates a site through the site service", async () => {
    siteServiceMock.createSite.mockResolvedValue({
      id: "site_1",
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
      environment: "production",
      status: "active",
    });

    const payload = {
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
    };
    const response = await POST(
      new Request("http://localhost/api/sites", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toMatchObject({
      id: "site_1",
      clientId: "client_1",
      name: "Site Demo",
    });
    expect(siteServiceMock.createSite).toHaveBeenCalledWith(payload);
  });
});
