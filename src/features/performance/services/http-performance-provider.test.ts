import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpPerformanceProvider } from "./http-performance-provider";

describe("HttpPerformanceProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores status and timing from a mocked response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", {
        status: 200,
        headers: { "content-length": "2048" },
      })),
    );

    const provider = new HttpPerformanceProvider();
    const result = await provider.runCheck("site_1", "https://example.com");

    expect(result.status).toBe("ok");
    expect(result.httpStatusCode).toBe(200);
    expect(result.pageWeightKb).toBe(2);
  });
});
