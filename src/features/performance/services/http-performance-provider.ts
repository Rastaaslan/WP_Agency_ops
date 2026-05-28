import { safeFetch } from "@/server/http/fetch";
import type { PerformanceCheckResult, PerformanceProvider } from "../types";

export class HttpPerformanceProvider implements PerformanceProvider {
  async runCheck(siteId: string, url: string): Promise<PerformanceCheckResult> {
    const startedAt = performance.now();

    try {
      const response = await safeFetch(url, {
        timeoutMs: 9000,
        headers: { accept: "text/html, */*" },
      });
      const responseTimeMs = Math.round(performance.now() - startedAt);
      const contentLength = response.headers.get("content-length");
      const pageWeightKb = contentLength
        ? Math.round(Number(contentLength) / 1024)
        : undefined;

      const status =
        !response.ok
          ? "issue"
          : responseTimeMs <= 1200
            ? "ok"
            : responseTimeMs <= 2500
              ? "warning"
              : "issue";

      return {
        siteId,
        url,
        status,
        httpStatusCode: response.status,
        responseTimeMs,
        pageWeightKb,
        notes: response.ok
          ? "Controle HTTP simple realise avec un timeout court."
          : `Le serveur a repondu avec le statut HTTP ${response.status}.`,
      };
    } catch (error) {
      return {
        siteId,
        url,
        status: "failed",
        notes:
          error instanceof Error
            ? error.message
            : "Le controle performance a echoue.",
      };
    }
  }
}
