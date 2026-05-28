import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluatePerformanceCheck,
  PERFORMANCE_CHECK_USER_AGENT,
  runPerformanceCheck,
  type PerformanceProbeResult,
} from "@/features/performance/services/performance-check-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    site: {
      findUnique: vi.fn(),
    },
    performanceCheck: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("performance check service", () => {
  beforeEach(() => {
    prismaMock.site.findUnique.mockReset();
    prismaMock.performanceCheck.create.mockReset();
  });

  it("normalizes a quick HTTP response as ok", () => {
    const evaluation = evaluatePerformanceCheck({
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      checkedUrl: "https://example.com/",
      probe: probe({
        responseTimeMs: 420,
        status: 200,
      }),
    });

    expect(evaluation).toMatchObject({
      contentLengthBytes: null,
      httpStatus: 200,
      responseTimeMs: 420,
      status: "ok",
      summary: "Réponse rapide : le site répond dans un délai raisonnable.",
    });
  });

  it("marks a slow successful response as warning", () => {
    const evaluation = evaluatePerformanceCheck({
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      checkedUrl: "https://example.com/",
      probe: probe({
        responseTimeMs: 1800,
        status: 200,
      }),
    });

    expect(evaluation).toMatchObject({
      status: "warning",
      summary:
        "Réponse lente : le site répond, mais le temps est à surveiller.",
    });
  });

  it("marks HTTP client or server errors as issue", () => {
    const evaluation = evaluatePerformanceCheck({
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      checkedUrl: "https://example.com/",
      probe: probe({
        responseTimeMs: 230,
        status: 404,
      }),
    });

    expect(evaluation).toMatchObject({
      status: "issue",
      summary: "À surveiller : le site répond avec un statut HTTP à vérifier.",
    });
  });

  it("marks network errors as failed", () => {
    const evaluation = evaluatePerformanceCheck({
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      checkedUrl: "https://example.com/",
      probe: probe({
        error: "AbortError",
        responseTimeMs: 5000,
        status: null,
      }),
    });

    expect(evaluation).toMatchObject({
      status: "failed",
      summary:
        "Contrôle échoué : l'URL du site n'a pas répondu dans le délai ou n'est pas joignable.",
    });
  });

  it("runs one simple HEAD request and stores the result", async () => {
    prismaMock.site.findUnique.mockResolvedValue({
      id: "site_1",
      url: "https://example.com/",
    });
    prismaMock.performanceCheck.create.mockResolvedValue({
      id: "performance_1",
    });

    const fetcher = vi.fn(async () => {
      return new Response(null, {
        headers: {
          "content-length": "1256",
        },
        status: 200,
      });
    });
    const nowValues = [1000, 1420];
    const nowMs = vi.fn(() => nowValues.shift() ?? 1420);

    await runPerformanceCheck("site_1", {
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      fetcher,
      nowMs,
      timeoutMs: 100,
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      "https://example.com/",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          accept: "*/*",
          "user-agent": PERFORMANCE_CHECK_USER_AGENT,
        },
        method: "HEAD",
        redirect: "follow",
      }),
    );
    expect(prismaMock.performanceCheck.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        contentLengthBytes: 1256,
        httpStatus: 200,
        responseTimeMs: 420,
        siteId: "site_1",
        status: "ok",
      }),
    });
  });

  it("returns null without fetch when the site is missing", async () => {
    prismaMock.site.findUnique.mockResolvedValue(null);
    const fetcher = vi.fn();

    await expect(
      runPerformanceCheck("missing_site", { fetcher }),
    ).resolves.toBeNull();

    expect(fetcher).not.toHaveBeenCalled();
    expect(prismaMock.performanceCheck.create).not.toHaveBeenCalled();
  });
});

function probe(
  values: Partial<PerformanceProbeResult>,
): PerformanceProbeResult {
  return {
    contentLengthBytes: null,
    error: null,
    responseTimeMs: null,
    status: null,
    url: "https://example.com/",
    ...values,
  };
}
