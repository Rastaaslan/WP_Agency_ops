import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateSecurityCheck,
  runSecurityCheck,
  SECURITY_CHECK_USER_AGENT,
  type SecurityProbeResult,
} from "@/features/security/services/security-check-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    site: {
      findUnique: vi.fn(),
    },
    securityCheck: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("security check service", () => {
  beforeEach(() => {
    prismaMock.site.findUnique.mockReset();
    prismaMock.securityCheck.create.mockReset();
  });

  it("normalizes an ok security result without offensive checks", () => {
    const evaluation = evaluateSecurityCheck({
      checkedAt: new Date("2026-05-28T10:30:00.000Z"),
      checkedUrl: "https://example.com/",
      siteProbe: probe("https://example.com/", 200, {
        csp: true,
        hsts: true,
        xContentTypeOptions: true,
        xFrameOptions: true,
      }),
      xmlrpcProbe: probe("https://example.com/xmlrpc.php", 404),
      readmeProbe: probe("https://example.com/readme.html", 404),
    });

    expect(evaluation).toMatchObject({
      status: "ok",
      httpsEnabled: true,
      xmlrpcAccessible: false,
      readmeAccessible: false,
      summary: "Aucune anomalie bloquante détectée sur ces contrôles basiques.",
    });
  });

  it("marks missing headers and public files as a point to watch", () => {
    const evaluation = evaluateSecurityCheck({
      checkedAt: new Date("2026-05-28T10:30:00.000Z"),
      checkedUrl: "https://example.com/",
      siteProbe: probe("https://example.com/", 200, {
        csp: false,
        hsts: false,
        xContentTypeOptions: true,
        xFrameOptions: true,
      }),
      xmlrpcProbe: probe("https://example.com/xmlrpc.php", 404),
      readmeProbe: probe("https://example.com/readme.html", 200),
    });

    expect(evaluation).toMatchObject({
      status: "warning",
      readmeAccessible: true,
      summary:
        "À surveiller : certains en-têtes ou fichiers publics méritent une revue.",
    });
  });

  it("marks plain HTTP as a point to verify", () => {
    const evaluation = evaluateSecurityCheck({
      checkedAt: new Date("2026-05-28T10:30:00.000Z"),
      checkedUrl: "http://example.com/",
      siteProbe: probe("http://example.com/", 200),
      xmlrpcProbe: probe("http://example.com/xmlrpc.php", 404),
      readmeProbe: probe("http://example.com/readme.html", 404),
    });

    expect(evaluation).toMatchObject({
      status: "issue",
      httpsEnabled: false,
      summary: "Point à vérifier : HTTPS ou la réponse HTTP demande une revue.",
    });
  });

  it("runs only the allowed HEAD probes and stores the result", async () => {
    prismaMock.site.findUnique.mockResolvedValue({
      id: "site_1",
      url: "https://example.com/",
    });
    prismaMock.securityCheck.create.mockResolvedValue({ id: "security_1" });

    const fetcher = vi.fn(async (url: string) => {
      if (url.endsWith("/xmlrpc.php") || url.endsWith("/readme.html")) {
        return new Response(null, { status: 404 });
      }

      return new Response(null, {
        headers: {
          "content-security-policy": "default-src 'self'",
          "strict-transport-security": "max-age=31536000",
          "x-content-type-options": "nosniff",
          "x-frame-options": "SAMEORIGIN",
        },
        status: 200,
      });
    });

    await runSecurityCheck("site_1", {
      checkedAt: new Date("2026-05-28T10:30:00.000Z"),
      fetcher,
      timeoutMs: 100,
    });

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "https://example.com/",
      "https://example.com/xmlrpc.php",
      "https://example.com/readme.html",
    ]);
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({
      cache: "no-store",
      headers: {
        "user-agent": SECURITY_CHECK_USER_AGENT,
      },
      method: "HEAD",
      redirect: "follow",
    });
    expect(prismaMock.securityCheck.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cspHeader: true,
        hstsHeader: true,
        httpsEnabled: true,
        readmeAccessible: false,
        siteId: "site_1",
        status: "ok",
        xmlrpcAccessible: false,
      }),
    });
  });

  it("returns null without fetch when the site is missing", async () => {
    prismaMock.site.findUnique.mockResolvedValue(null);
    const fetcher = vi.fn();

    await expect(
      runSecurityCheck("missing_site", { fetcher }),
    ).resolves.toBeNull();

    expect(fetcher).not.toHaveBeenCalled();
    expect(prismaMock.securityCheck.create).not.toHaveBeenCalled();
  });
});

function probe(
  url: string,
  status: number | null,
  headers: SecurityProbeResult["headers"] = {
    csp: false,
    hsts: false,
    xContentTypeOptions: false,
    xFrameOptions: false,
  },
): SecurityProbeResult {
  return {
    url,
    error: null,
    headers,
    status,
  };
}
