import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/client", () => ({
  prisma: {
    wordPressSite: {
      findUniqueOrThrow: vi.fn(async () => ({ url: "https://example.com" })),
    },
  },
}));

describe("BasicSecurityProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports ok when HTTPS and common headers are present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/readme.html") || url.endsWith("/xmlrpc.php")) {
          return new Response("", { status: 404 });
        }

        return new Response("ok", {
          status: 200,
          headers: {
            "strict-transport-security": "max-age=31536000",
            "x-frame-options": "SAMEORIGIN",
            "x-content-type-options": "nosniff",
          },
        });
      }),
    );

    const { BasicSecurityProvider } = await import("./basic-security-provider");
    const provider = new BasicSecurityProvider();
    const result = await provider.runCheck("site_1");

    expect(result.status).toBe("ok");
    expect(result.httpsEnabled).toBe(true);
    expect(result.hasSecurityHeaders).toBe(true);
  });
});
