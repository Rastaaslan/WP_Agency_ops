import { joinUrl, normalizeUrl } from "@/lib/urls";
import { safeFetch } from "@/server/http/fetch";
import type {
  ConnectionCheckResult,
  ConnectorSite,
  WordPressConnector,
  WordPressScanResult,
} from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractNamespaces(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.namespaces)) {
    return [];
  }

  return payload.namespaces.filter((item): item is string => typeof item === "string");
}

export class PublicRestWordPressConnector implements WordPressConnector {
  async checkConnection(site: ConnectorSite): Promise<ConnectionCheckResult> {
    const wpJsonUrl = joinUrl(site.url, "/wp-json");

    try {
      const response = await safeFetch(wpJsonUrl, { timeoutMs: 7000 });
      const raw = await response.json().catch(() => null);
      const namespaces = extractNamespaces(raw);
      const detected =
        response.ok &&
        (namespaces.some((namespace) => namespace.startsWith("wp/")) ||
          isRecord(raw));

      return {
        ok: response.ok && detected,
        detected,
        statusCode: response.status,
        message: detected
          ? "REST API WordPress detectee."
          : "REST API accessible, mais WordPress n'a pas ete confirme.",
        raw,
      };
    } catch (error) {
      return {
        ok: false,
        detected: false,
        message:
          error instanceof Error
            ? error.message
            : "Connexion WordPress impossible.",
      };
    }
  }

  async scan(site: ConnectorSite): Promise<WordPressScanResult> {
    const siteUrl = normalizeUrl(site.url);
    const warnings = [];
    const raw: Record<string, unknown> = {};

    const homeStartedAt = performance.now();
    const homeResponse = await safeFetch(siteUrl, {
      timeoutMs: 8000,
      headers: { accept: "text/html, */*" },
    }).catch((error) => {
      raw.homeError = error instanceof Error ? error.message : String(error);
      return null;
    });
    const responseTimeMs = Math.round(performance.now() - homeStartedAt);

    if (!homeResponse?.ok) {
      warnings.push({
        code: "site_unreachable",
        severity: "warning" as const,
        message:
          "Le site ne repond pas avec un statut HTTP OK pendant le scan.",
      });
    }

    const wpJsonUrl = joinUrl(siteUrl, "/wp-json");
    const wpJsonResponse = await safeFetch(wpJsonUrl, { timeoutMs: 8000 });
    const wpJson = await wpJsonResponse.json().catch(() => null);
    raw.wpJson = wpJson;
    raw.wpJsonStatus = wpJsonResponse.status;

    const namespaces = extractNamespaces(wpJson);
    const detected =
      wpJsonResponse.ok &&
      namespaces.some((namespace) => namespace.startsWith("wp/"));

    if (!detected) {
      warnings.push({
        code: "wp_rest_not_detected",
        severity: "warning" as const,
        message:
          "La REST API publique ne confirme pas WordPress. Utilisez un scan manuel ou le futur plugin compagnon.",
      });
    }

    const wpV2Url = joinUrl(siteUrl, "/wp-json/wp/v2");
    const wpV2Response = await safeFetch(wpV2Url, { timeoutMs: 8000 }).catch(
      (error) => {
        raw.wpV2Error = error instanceof Error ? error.message : String(error);
        return null;
      },
    );

    if (wpV2Response) {
      raw.wpV2Status = wpV2Response.status;
      raw.wpV2 = await wpV2Response.json().catch(() => null);
    }

    if (detected) {
      warnings.push({
        code: "public_rest_limited",
        severity: "info" as const,
        message:
          "Le mode REST public confirme WordPress, mais ne donne pas la liste complete des plugins, themes et mises a jour.",
      });
    }

    return {
      detected,
      siteUrl,
      plugins: [],
      themes: [],
      updates: [],
      warnings,
      securityHints: [
        {
          code: siteUrl.startsWith("https://") ? "https_enabled" : "https_missing",
          status: siteUrl.startsWith("https://") ? "ok" : "warning",
          message: siteUrl.startsWith("https://")
            ? "Le site utilise HTTPS."
            : "Le site ne semble pas utiliser HTTPS.",
        },
      ],
      performanceHints: [
        {
          code: "home_response_time",
          status: responseTimeMs < 1200 ? "ok" : "warning",
          message: `Temps de reponse observe pendant le scan : ${responseTimeMs} ms.`,
        },
      ],
      raw,
    };
  }
}
