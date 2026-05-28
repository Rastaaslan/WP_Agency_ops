import { joinUrl, normalizeUrl } from "@/lib/urls";
import { safeFetch } from "@/server/http/fetch";
import type { SecretProvider } from "../secret-provider";
import type {
  ConnectionCheckResult,
  ConnectorSite,
  PluginInfo,
  ThemeInfo,
  UpdateInfo,
  WordPressConnector,
  WordPressScanResult,
} from "../types";
import { PublicRestWordPressConnector } from "./public-rest";

type CompanionPluginPayload = {
  name?: string;
  slug?: string;
  version?: string;
  active?: boolean;
  updateAvailable?: boolean;
  newVersion?: string;
  requiresWp?: string;
  requiresPhp?: string;
  testedUpTo?: string;
  status?: PluginInfo["status"];
};

type CompanionThemePayload = CompanionPluginPayload;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function toPluginInfo(item: unknown): PluginInfo | null {
  if (!isRecord(item)) {
    return null;
  }

  const payload = item as CompanionPluginPayload;
  const name = asString(payload.name);

  if (!name) {
    return null;
  }

  return {
    name,
    slug: asString(payload.slug),
    version: asString(payload.version),
    active: asBoolean(payload.active),
    updateAvailable: asBoolean(payload.updateAvailable) ?? false,
    newVersion: asString(payload.newVersion),
    requiresWp: asString(payload.requiresWp),
    requiresPhp: asString(payload.requiresPhp),
    testedUpTo: asString(payload.testedUpTo),
    status: payload.status,
  };
}

function toThemeInfo(item: unknown): ThemeInfo | null {
  if (!isRecord(item)) {
    return null;
  }

  const payload = item as CompanionThemePayload;
  const name = asString(payload.name);

  if (!name) {
    return null;
  }

  return {
    name,
    slug: asString(payload.slug),
    version: asString(payload.version),
    active: asBoolean(payload.active),
    updateAvailable: asBoolean(payload.updateAvailable) ?? false,
    newVersion: asString(payload.newVersion),
    status: payload.status,
  };
}

function updateListFromPayload(payload: unknown): UpdateInfo[] {
  if (!isRecord(payload)) {
    return [];
  }

  const updates: UpdateInfo[] = [];
  const pluginUpdates = isRecord(payload.plugins) ? payload.plugins : {};
  const themeUpdates = isRecord(payload.themes) ? payload.themes : {};

  for (const [slug, update] of Object.entries(pluginUpdates)) {
    const record = isRecord(update) ? update : {};
    updates.push({
      kind: "plugin",
      slug,
      currentVersion: asString(record.current_version),
      newVersion: asString(record.new_version),
      label: `Plugin ${slug}`,
    });
  }

  for (const [slug, update] of Object.entries(themeUpdates)) {
    const record = isRecord(update) ? update : {};
    updates.push({
      kind: "theme",
      slug,
      currentVersion: asString(record.current_version),
      newVersion: asString(record.new_version),
      label: `Theme ${slug}`,
    });
  }

  return updates;
}

export class CompanionPluginWordPressConnector implements WordPressConnector {
  private readonly fallback = new PublicRestWordPressConnector();

  constructor(private readonly secretProvider: SecretProvider) {}

  async checkConnection(site: ConnectorSite): Promise<ConnectionCheckResult> {
    const apiKey = await this.secretProvider.getSecret(site.connection?.secretReference ?? undefined);

    if (!apiKey) {
      const fallback = await this.fallback.checkConnection(site);
      return {
        ...fallback,
        ok: false,
        message:
          "Cle API compagnon non configuree. Renseignez WP_AGENCY_OPS_COMPANION_API_KEY ou une reference env:VARIABLE.",
      };
    }

    try {
      const response = await safeFetch(this.endpoint(site, "health"), {
        timeoutMs: 8000,
        headers: { "X-WP-Agency-Ops-Key": apiKey },
      });
      const raw = await response.json().catch(() => null);
      const detected = response.ok && isRecord(raw) && raw.detected === true;

      return {
        ok: response.ok && detected,
        detected,
        statusCode: response.status,
        message: detected
          ? "Plugin compagnon WordPress connecte."
          : "Le plugin compagnon n'a pas confirme WordPress.",
        raw,
      };
    } catch (error) {
      return {
        ok: false,
        detected: false,
        message:
          error instanceof Error
            ? error.message
            : "Connexion au plugin compagnon impossible.",
      };
    }
  }

  async scan(site: ConnectorSite): Promise<WordPressScanResult> {
    const apiKey = await this.secretProvider.getSecret(site.connection?.secretReference ?? undefined);

    if (!apiKey) {
      const fallback = await this.fallback.scan(site);
      return {
        ...fallback,
        warnings: [
          {
            code: "missing_companion_api_key",
            severity: "warning",
            message:
              "Mode plugin compagnon selectionne, mais aucune cle API n'est configuree. Fallback REST public utilise.",
          },
          ...fallback.warnings,
        ],
      };
    }

    const headers = { "X-WP-Agency-Ops-Key": apiKey };
    const [healthResponse, pluginsResponse, themesResponse, updatesResponse] =
      await Promise.all([
        safeFetch(this.endpoint(site, "health"), { timeoutMs: 8000, headers }),
        safeFetch(this.endpoint(site, "plugins"), { timeoutMs: 8000, headers }),
        safeFetch(this.endpoint(site, "themes"), { timeoutMs: 8000, headers }),
        safeFetch(this.endpoint(site, "updates"), { timeoutMs: 8000, headers }),
      ]);

    if (!healthResponse.ok) {
      throw new Error(`Plugin compagnon indisponible (${healthResponse.status}).`);
    }

    const health = await healthResponse.json();
    const pluginsRaw = await pluginsResponse.json().catch(() => []);
    const themesRaw = await themesResponse.json().catch(() => []);
    const updatesRaw = await updatesResponse.json().catch(() => ({}));
    const plugins = Array.isArray(pluginsRaw)
      ? pluginsRaw.map(toPluginInfo).filter((plugin): plugin is PluginInfo => Boolean(plugin))
      : [];
    const themes = Array.isArray(themesRaw)
      ? themesRaw.map(toThemeInfo).filter((theme): theme is ThemeInfo => Boolean(theme))
      : [];

    return {
      detected: isRecord(health) && health.detected === true,
      siteUrl: normalizeUrl(asString(isRecord(health) ? health.siteUrl : undefined) ?? site.url),
      wpVersion: asString(isRecord(health) ? health.wpVersion : undefined),
      phpVersion: asString(isRecord(health) ? health.phpVersion : undefined),
      plugins,
      themes,
      updates: updateListFromPayload(updatesRaw),
      warnings: [
        {
          code: "companion_read_only",
          severity: "info",
          message:
            "Donnees recuperees via le plugin compagnon en lecture seule. Aucune mise a jour n'a ete declenchee.",
        },
      ],
      securityHints: [],
      performanceHints: [],
      raw: {
        health,
        plugins: pluginsRaw,
        themes: themesRaw,
        updates: updatesRaw,
      },
    };
  }

  private endpoint(site: ConnectorSite, path: "health" | "plugins" | "themes" | "updates") {
    const baseUrl = site.connection?.apiBaseUrl ?? site.url;
    return joinUrl(baseUrl, `/wp-json/wp-agency-ops/v1/${path}`);
  }
}
