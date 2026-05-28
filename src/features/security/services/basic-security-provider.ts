import { joinUrl, normalizeUrl } from "@/lib/urls";
import { prisma } from "@/server/db/client";
import { safeFetch } from "@/server/http/fetch";
import type { SecurityCheckProvider, SecurityCheckResult } from "../types";

async function endpointResponds(url: string) {
  try {
    const response = await safeFetch(url, {
      timeoutMs: 5000,
      redirect: "manual",
    });
    return response.status > 0 && response.status < 400;
  } catch {
    return false;
  }
}

export class BasicSecurityProvider implements SecurityCheckProvider {
  async runCheck(siteId: string): Promise<SecurityCheckResult> {
    const site = await prisma.wordPressSite.findUniqueOrThrow({
      where: { id: siteId },
      select: { url: true },
    });
    const siteUrl = normalizeUrl(site.url);
    const httpsEnabled = siteUrl.startsWith("https://");

    try {
      const response = await safeFetch(siteUrl, {
        timeoutMs: 9000,
        headers: { accept: "text/html, */*" },
      });
      const hstsEnabled = response.headers.has("strict-transport-security");
      const contentSecurityPolicy = response.headers.has("content-security-policy");
      const xFrameOptions = response.headers.has("x-frame-options");
      const xContentTypeOptions = response.headers.has("x-content-type-options");
      const hasSecurityHeaders =
        hstsEnabled || contentSecurityPolicy || xFrameOptions || xContentTypeOptions;
      const readmeExposed = await endpointResponds(joinUrl(siteUrl, "/readme.html"));
      const xmlrpcExposed = await endpointResponds(joinUrl(siteUrl, "/xmlrpc.php"));
      const warnings = [
        !httpsEnabled ? "HTTPS a verifier" : null,
        !hasSecurityHeaders ? "headers de securite absents ou incomplets" : null,
        readmeExposed ? "readme.html accessible" : null,
        xmlrpcExposed ? "xmlrpc.php accessible" : null,
      ].filter(Boolean);
      const status =
        !response.ok || !httpsEnabled
          ? "issue"
          : warnings.length > 0
            ? "warning"
            : "ok";

      return {
        siteId,
        status,
        httpsEnabled,
        hasSecurityHeaders,
        hstsEnabled,
        contentSecurityPolicy,
        xFrameOptions,
        xContentTypeOptions,
        xmlrpcExposed,
        readmeExposed,
        directoryListingDetected: false,
        notes:
          warnings.length > 0
            ? `Action conseillee : ${warnings.join(", ")}.`
            : "Aucune anomalie simple detectee.",
      };
    } catch (error) {
      return {
        siteId,
        status: "failed",
        httpsEnabled,
        hasSecurityHeaders: false,
        hstsEnabled: false,
        contentSecurityPolicy: false,
        xFrameOptions: false,
        xContentTypeOptions: false,
        notes:
          error instanceof Error
            ? error.message
            : "Le controle securite a echoue.",
      };
    }
  }
}
