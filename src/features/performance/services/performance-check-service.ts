import { Prisma } from "@/generated/prisma/client";
import type { PerformanceCheckStatus } from "@/features/core/enums";
import { prisma } from "@/server/db/client";

const DEFAULT_TIMEOUT_MS = 5000;
const WARNING_RESPONSE_TIME_MS = 1500;

export const PERFORMANCE_CHECK_USER_AGENT =
  "WP Agency Ops v2 Performance Check/1.0 (simple)";

type PerformanceFetch = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

type RunPerformanceCheckOptions = {
  checkedAt?: Date;
  fetcher?: PerformanceFetch;
  nowMs?: () => number;
  timeoutMs?: number;
};

export type PerformanceProbeResult = {
  url: string;
  status: number | null;
  responseTimeMs: number | null;
  contentLengthBytes: number | null;
  error: string | null;
};

export type PerformanceCheckEvaluation = {
  checkedAt: Date;
  checkedUrl: string;
  status: PerformanceCheckStatus;
  httpStatus: number | null;
  responseTimeMs: number | null;
  contentLengthBytes: number | null;
  summary: string;
  notes: string;
  probe: PerformanceProbeResult;
};

export async function listPerformanceChecksBySite(siteId: string) {
  return prisma.performanceCheck.findMany({
    where: { siteId },
    orderBy: {
      checkedAt: "desc",
    },
  });
}

export async function getLatestPerformanceCheckBySite(siteId: string) {
  return prisma.performanceCheck.findFirst({
    where: { siteId },
    orderBy: {
      checkedAt: "desc",
    },
  });
}

export async function getPerformanceCheckById(id: string) {
  return prisma.performanceCheck.findUnique({
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

export async function runPerformanceCheck(
  siteId: string,
  options: RunPerformanceCheckOptions = {},
) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
  });

  if (!site) {
    return null;
  }

  const checkedAt = options.checkedAt ?? new Date();

  let checkedUrl: string;

  try {
    checkedUrl = buildPerformanceCheckUrl(site.url);
  } catch (error) {
    return createPerformanceCheckRecord(
      site.id,
      buildFailedPerformanceCheckEvaluation(site.url, checkedAt, error),
    );
  }

  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  const probe = await fetchPerformanceTarget(
    checkedUrl,
    fetcher,
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    options.nowMs,
  );

  return createPerformanceCheckRecord(
    site.id,
    evaluatePerformanceCheck({
      checkedAt,
      checkedUrl,
      probe,
    }),
  );
}

export function buildPerformanceCheckUrl(siteUrl: string) {
  const parsedUrl = new URL(siteUrl);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Unsupported site URL protocol.");
  }

  return parsedUrl.toString();
}

export async function fetchPerformanceTarget(
  url: string,
  fetcher: PerformanceFetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  nowMs: () => number = () => Date.now(),
): Promise<PerformanceProbeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = nowMs();

  try {
    const response = await fetcher(url, {
      cache: "no-store",
      headers: {
        accept: "*/*",
        "user-agent": PERFORMANCE_CHECK_USER_AGENT,
      },
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    return {
      url,
      status: response.status,
      responseTimeMs: readElapsedMs(startedAt, nowMs),
      contentLengthBytes: readContentLength(response.headers),
      error: null,
    };
  } catch (error) {
    return {
      url,
      status: null,
      responseTimeMs: readElapsedMs(startedAt, nowMs),
      contentLengthBytes: null,
      error: readErrorName(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function evaluatePerformanceCheck({
  checkedAt,
  checkedUrl,
  probe,
}: {
  checkedAt: Date;
  checkedUrl: string;
  probe: PerformanceProbeResult;
}): PerformanceCheckEvaluation {
  const status = resolvePerformanceStatus(probe);

  return {
    checkedAt,
    checkedUrl,
    status,
    httpStatus: probe.status,
    responseTimeMs: probe.responseTimeMs,
    contentLengthBytes: probe.contentLengthBytes,
    summary: buildPerformanceSummary(status),
    notes:
      "Contrôle simple limité à l'URL du site, au statut HTTP, au temps de réponse et à l'en-tête content-length si disponible.",
    probe,
  };
}

function buildFailedPerformanceCheckEvaluation(
  siteUrl: string,
  checkedAt: Date,
  error: unknown,
): PerformanceCheckEvaluation {
  const probe = {
    url: siteUrl,
    status: null,
    responseTimeMs: null,
    contentLengthBytes: null,
    error: readErrorName(error),
  };

  return {
    checkedAt,
    checkedUrl: siteUrl,
    status: "failed",
    httpStatus: null,
    responseTimeMs: null,
    contentLengthBytes: null,
    summary:
      "Contrôle échoué : l'URL du site n'a pas pu être vérifiée.",
    notes:
      "Contrôle simple limité à l'URL du site, au statut HTTP, au temps de réponse et à l'en-tête content-length si disponible.",
    probe,
  };
}

function createPerformanceCheckRecord(
  siteId: string,
  evaluation: PerformanceCheckEvaluation,
) {
  return prisma.performanceCheck.create({
    data: {
      siteId,
      checkedAt: evaluation.checkedAt,
      status: evaluation.status,
      httpStatus: evaluation.httpStatus,
      responseTimeMs: evaluation.responseTimeMs,
      contentLengthBytes: evaluation.contentLengthBytes,
      summary: evaluation.summary,
      notes: evaluation.notes,
      rawJson: toRawJson(evaluation),
    },
  });
}

function resolvePerformanceStatus(probe: PerformanceProbeResult) {
  if (probe.status === null) {
    return "failed";
  }

  if (probe.status >= 400) {
    return "issue";
  }

  if (
    probe.responseTimeMs !== null &&
    probe.responseTimeMs >= WARNING_RESPONSE_TIME_MS
  ) {
    return "warning";
  }

  return "ok";
}

function buildPerformanceSummary(status: PerformanceCheckStatus) {
  if (status === "ok") {
    return "Réponse rapide : le site répond dans un délai raisonnable.";
  }

  if (status === "warning") {
    return "Réponse lente : le site répond, mais le temps est à surveiller.";
  }

  if (status === "issue") {
    return "À surveiller : le site répond avec un statut HTTP à vérifier.";
  }

  return "Contrôle échoué : l'URL du site n'a pas répondu dans le délai ou n'est pas joignable.";
}

function readContentLength(headers: Headers) {
  const value = headers.get("content-length");

  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

function readElapsedMs(startedAt: number, nowMs: () => number) {
  return Math.max(0, Math.round(nowMs() - startedAt));
}

function readErrorName(error: unknown) {
  return error instanceof Error ? error.name : "unknown_error";
}

function toRawJson(
  evaluation: PerformanceCheckEvaluation,
): Prisma.InputJsonValue {
  return {
    checkedAt: evaluation.checkedAt.toISOString(),
    checkedUrl: evaluation.checkedUrl,
    method: "HEAD",
    policy: "simple_single_url_performance_check",
    probe: {
      contentLengthBytes: evaluation.probe.contentLengthBytes,
      error: evaluation.probe.error,
      responseTimeMs: evaluation.probe.responseTimeMs,
      status: evaluation.probe.status,
      url: evaluation.probe.url,
    },
  };
}
