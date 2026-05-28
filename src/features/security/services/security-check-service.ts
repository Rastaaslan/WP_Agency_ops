import { Prisma } from "@/generated/prisma/client";
import type { SecurityCheckStatus } from "@/features/core/enums";
import { prisma } from "@/server/db/client";

const DEFAULT_TIMEOUT_MS = 5000;

export const SECURITY_CHECK_USER_AGENT =
  "WP Agency Ops v2 Security Check/1.0 (non-offensive)";

type SecurityFetch = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export type SecurityHeaderPresence = {
  hsts: boolean;
  csp: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
};

export type SecurityProbeResult = {
  url: string;
  status: number | null;
  error: string | null;
  headers: SecurityHeaderPresence;
};

export type SecurityCheckEvaluation = {
  checkedAt: Date;
  checkedUrl: string;
  status: SecurityCheckStatus;
  httpStatus: number | null;
  httpsEnabled: boolean;
  hstsHeader: boolean;
  cspHeader: boolean;
  xFrameOptionsHeader: boolean;
  xContentTypeOptionsHeader: boolean;
  xmlrpcAccessible: boolean;
  readmeAccessible: boolean;
  summary: string;
  notes: string;
  probes: {
    site: SecurityProbeResult;
    xmlrpc: SecurityProbeResult;
    readme: SecurityProbeResult;
  };
};

type RunSecurityCheckOptions = {
  checkedAt?: Date;
  fetcher?: SecurityFetch;
  timeoutMs?: number;
};

type SecurityCheckTargets = {
  siteUrl: string;
  xmlrpcUrl: string;
  readmeUrl: string;
};

export async function listSecurityChecksBySite(siteId: string) {
  return prisma.securityCheck.findMany({
    where: { siteId },
    orderBy: {
      checkedAt: "desc",
    },
  });
}

export async function getLatestSecurityCheckBySite(siteId: string) {
  return prisma.securityCheck.findFirst({
    where: { siteId },
    orderBy: {
      checkedAt: "desc",
    },
  });
}

export async function getSecurityCheckById(id: string) {
  return prisma.securityCheck.findUnique({
    where: { id },
    include: {
      site: {
        include: {
          client: true,
        },
      },
    },
  });
}

export async function runSecurityCheck(
  siteId: string,
  options: RunSecurityCheckOptions = {},
) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
  });

  if (!site) {
    return null;
  }

  const checkedAt = options.checkedAt ?? new Date();

  let targets: SecurityCheckTargets;

  try {
    targets = buildSecurityCheckTargets(site.url);
  } catch (error) {
    return createSecurityCheckRecord(
      site.id,
      buildFailedSecurityCheckEvaluation(site.url, checkedAt, error),
    );
  }

  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const [siteProbe, xmlrpcProbe, readmeProbe] = await Promise.all([
    fetchSecurityTarget(targets.siteUrl, fetcher, timeoutMs),
    fetchSecurityTarget(targets.xmlrpcUrl, fetcher, timeoutMs),
    fetchSecurityTarget(targets.readmeUrl, fetcher, timeoutMs),
  ]);

  return createSecurityCheckRecord(
    site.id,
    evaluateSecurityCheck({
      checkedAt,
      checkedUrl: targets.siteUrl,
      siteProbe,
      xmlrpcProbe,
      readmeProbe,
    }),
  );
}

export function buildSecurityCheckTargets(siteUrl: string): SecurityCheckTargets {
  const parsedUrl = new URL(siteUrl);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Unsupported site URL protocol.");
  }

  return {
    siteUrl: parsedUrl.toString(),
    xmlrpcUrl: new URL("/xmlrpc.php", parsedUrl.origin).toString(),
    readmeUrl: new URL("/readme.html", parsedUrl.origin).toString(),
  };
}

export async function fetchSecurityTarget(
  url: string,
  fetcher: SecurityFetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<SecurityProbeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(url, {
      cache: "no-store",
      headers: {
        accept: "*/*",
        "user-agent": SECURITY_CHECK_USER_AGENT,
      },
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    return {
      url,
      status: response.status,
      error: null,
      headers: readSecurityHeaders(response.headers),
    };
  } catch (error) {
    return {
      url,
      status: null,
      error: readErrorName(error),
      headers: emptySecurityHeaders(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function evaluateSecurityCheck({
  checkedAt,
  checkedUrl,
  readmeProbe,
  siteProbe,
  xmlrpcProbe,
}: {
  checkedAt: Date;
  checkedUrl: string;
  siteProbe: SecurityProbeResult;
  xmlrpcProbe: SecurityProbeResult;
  readmeProbe: SecurityProbeResult;
}): SecurityCheckEvaluation {
  const httpsEnabled = isHttpsUrl(checkedUrl);
  const xmlrpcAccessible = isPubliclyAccessible(xmlrpcProbe.status);
  const readmeAccessible = isPubliclyAccessible(readmeProbe.status);
  const headers = siteProbe.headers;
  const status = resolveSecurityStatus({
    headers,
    httpsEnabled,
    readmeAccessible,
    siteHttpStatus: siteProbe.status,
    xmlrpcAccessible,
  });

  return {
    checkedAt,
    checkedUrl,
    status,
    httpStatus: siteProbe.status,
    httpsEnabled,
    hstsHeader: headers.hsts,
    cspHeader: headers.csp,
    xFrameOptionsHeader: headers.xFrameOptions,
    xContentTypeOptionsHeader: headers.xContentTypeOptions,
    xmlrpcAccessible,
    readmeAccessible,
    summary: buildSecuritySummary(status),
    notes:
      "Contrôle non offensif limité à l'URL du site, aux en-têtes HTTP basiques, à /xmlrpc.php et à /readme.html.",
    probes: {
      site: siteProbe,
      xmlrpc: xmlrpcProbe,
      readme: readmeProbe,
    },
  };
}

function buildFailedSecurityCheckEvaluation(
  siteUrl: string,
  checkedAt: Date,
  error: unknown,
): SecurityCheckEvaluation {
  const siteProbe = {
    url: siteUrl,
    status: null,
    error: readErrorName(error),
    headers: emptySecurityHeaders(),
  };

  return {
    checkedAt,
    checkedUrl: siteUrl,
    status: "failed",
    httpStatus: null,
    httpsEnabled: isHttpsUrl(siteUrl),
    hstsHeader: false,
    cspHeader: false,
    xFrameOptionsHeader: false,
    xContentTypeOptionsHeader: false,
    xmlrpcAccessible: false,
    readmeAccessible: false,
    summary:
      "Contrôle recommandé : l'URL du site n'a pas pu être vérifiée.",
    notes:
      "Contrôle non offensif limité à l'URL du site, aux en-têtes HTTP basiques, à /xmlrpc.php et à /readme.html.",
    probes: {
      site: siteProbe,
      xmlrpc: {
        ...siteProbe,
        url: "/xmlrpc.php",
      },
      readme: {
        ...siteProbe,
        url: "/readme.html",
      },
    },
  };
}

function createSecurityCheckRecord(
  siteId: string,
  evaluation: SecurityCheckEvaluation,
) {
  return prisma.securityCheck.create({
    data: {
      siteId,
      checkedAt: evaluation.checkedAt,
      status: evaluation.status,
      httpStatus: evaluation.httpStatus,
      httpsEnabled: evaluation.httpsEnabled,
      hstsHeader: evaluation.hstsHeader,
      cspHeader: evaluation.cspHeader,
      xFrameOptionsHeader: evaluation.xFrameOptionsHeader,
      xContentTypeOptionsHeader: evaluation.xContentTypeOptionsHeader,
      xmlrpcAccessible: evaluation.xmlrpcAccessible,
      readmeAccessible: evaluation.readmeAccessible,
      summary: evaluation.summary,
      notes: evaluation.notes,
      rawJson: toRawJson(evaluation),
    },
  });
}

function resolveSecurityStatus({
  headers,
  httpsEnabled,
  readmeAccessible,
  siteHttpStatus,
  xmlrpcAccessible,
}: {
  headers: SecurityHeaderPresence;
  httpsEnabled: boolean;
  readmeAccessible: boolean;
  siteHttpStatus: number | null;
  xmlrpcAccessible: boolean;
}) {
  if (siteHttpStatus === null) {
    return "failed";
  }

  if (!httpsEnabled || siteHttpStatus >= 500) {
    return "issue";
  }

  if (
    siteHttpStatus >= 400 ||
    !headers.hsts ||
    !headers.csp ||
    !headers.xFrameOptions ||
    !headers.xContentTypeOptions ||
    xmlrpcAccessible ||
    readmeAccessible
  ) {
    return "warning";
  }

  return "ok";
}

function buildSecuritySummary(status: SecurityCheckStatus) {
  if (status === "ok") {
    return "Aucune anomalie bloquante détectée sur ces contrôles basiques.";
  }

  if (status === "warning") {
    return "À surveiller : certains en-têtes ou fichiers publics méritent une revue.";
  }

  if (status === "issue") {
    return "Point à vérifier : HTTPS ou la réponse HTTP demande une revue.";
  }

  return "Contrôle recommandé : l'URL du site n'a pas répondu dans le délai ou n'est pas joignable.";
}

function readSecurityHeaders(headers: Headers): SecurityHeaderPresence {
  return {
    hsts: headers.has("strict-transport-security"),
    csp: headers.has("content-security-policy"),
    xFrameOptions: headers.has("x-frame-options"),
    xContentTypeOptions: headers.has("x-content-type-options"),
  };
}

function emptySecurityHeaders(): SecurityHeaderPresence {
  return {
    hsts: false,
    csp: false,
    xFrameOptions: false,
    xContentTypeOptions: false,
  };
}

function isPubliclyAccessible(status: number | null) {
  return typeof status === "number" && status >= 200 && status < 400;
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function readErrorName(error: unknown) {
  return error instanceof Error ? error.name : "unknown_error";
}

function toRawJson(
  evaluation: SecurityCheckEvaluation,
): Prisma.InputJsonValue {
  return {
    checkedAt: evaluation.checkedAt.toISOString(),
    checkedUrl: evaluation.checkedUrl,
    policy: "non_offensive_limited_http_checks",
    probes: {
      site: serializeProbe(evaluation.probes.site),
      xmlrpc: serializeProbe(evaluation.probes.xmlrpc),
      readme: serializeProbe(evaluation.probes.readme),
    },
  };
}

function serializeProbe(probe: SecurityProbeResult) {
  return {
    error: probe.error,
    headers: probe.headers,
    status: probe.status,
    url: probe.url,
  };
}
