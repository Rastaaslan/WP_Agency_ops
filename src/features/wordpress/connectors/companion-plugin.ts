import { joinUrl, normalizeUrl } from "@/lib/urls";
import { safeFetch } from "@/server/http/fetch";
import type { SecretProvider } from "../secret-provider";
import { enrichScanResult } from "../services/scan-insights";
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
  pluginUrl?: string;
  author?: string;
};

type CompanionThemePayload = CompanionPluginPayload & {
  parentTheme?: string;
  isChildTheme?: boolean;
};

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
  const coreUpdates = Array.isArray(payload.core)
    ? payload.core
    : isRecord(payload.core) && Array.isArray(payload.core.updates)
      ? payload.core.updates
      : [];
  const pluginUpdates = Array.isArray(payload.plugins)
    ? payload.plugins
    : isRecord(payload.plugins)
      ? Object.entries(payload.plugins).map(([slug, update]) => ({
          ...(isRecord(update) ? update : {}),
          slug,
        }))
      : [];
  const themeUpdates = Array.isArray(payload.themes)
    ? payload.themes
    : isRecord(payload.themes)
      ? Object.entries(payload.themes).map(([slug, update]) => ({
          ...(isRecord(update) ? update : {}),
          slug,
        }))
      : [];
  const translationUpdates = Array.isArray(payload.translations)
    ? payload.translations
    : [];

  for (const update of coreUpdates) {
    const record = isRecord(update) ? update : {};
    const currentVersion = asString(record.current_version) ?? asString(record.currentVersion);
    const newVersion =
      asString(record.version) ??
      asString(record.new_version) ??
      asString(record.newVersion);

    updates.push({
      kind: "core",
      currentVersion,
      newVersion,
      label: newVersion
        ? `WordPress ${newVersion}`
        : "Mise a jour WordPress disponible",
    });
  }

  for (const update of pluginUpdates) {
    const record = isRecord(update) ? update : {};
    const slug = asString(record.slug) ?? asString(record.plugin) ?? "plugin";
    updates.push({
      kind: "plugin",
      slug,
      currentVersion:
        asString(record.currentVersion) ?? asString(record.current_version),
      newVersion: asString(record.newVersion) ?? asString(record.new_version),
      label: `Plugin ${slug}`,
    });
  }

  for (const update of themeUpdates) {
    const record = isRecord(update) ? update : {};
    const slug = asString(record.slug) ?? asString(record.theme) ?? "theme";
    updates.push({
      kind: "theme",
      slug,
      currentVersion:
        asString(record.currentVersion) ?? asString(record.current_version),
      newVersion: asString(record.newVersion) ?? asString(record.new_version),
      label: `Theme ${slug}`,
    });
  }

  for (const update of translationUpdates) {
    const record = isRecord(update) ? update : {};
    const slug = asString(record.slug) ?? asString(record.language) ?? "translation";
    updates.push({
      kind: "translation",
      slug,
      newVersion: asString(record.version),
      label: `Traduction ${slug}`,
    });
  }

  return updates;
}

function activeThemeName(payload: unknown) {
  if (!isRecord(payload)) {
    return undefined;
  }

  const activeTheme = payload.activeTheme;

  if (typeof activeTheme === "string") {
    return activeTheme;
  }

  if (isRecord(activeTheme)) {
    return asString(activeTheme.name) ?? asString(activeTheme.slug);
  }

  return asString(payload.activeThemeName);
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
    const [healthResponse, pluginsResponse, themesResponse, updatesResponse, siteInfoResponse] =
      await Promise.all([
        safeFetch(this.endpoint(site, "health"), { timeoutMs: 8000, headers }),
        safeFetch(this.endpoint(site, "plugins"), { timeoutMs: 8000, headers }),
        safeFetch(this.endpoint(site, "themes"), { timeoutMs: 8000, headers }),
        safeFetch(this.endpoint(site, "updates"), { timeoutMs: 8000, headers }),
        safeFetch(this.endpoint(site, "site-info"), {
          timeoutMs: 8000,
          headers,
        }).catch(() => null),
      ]);

    if (!healthResponse.ok) {
      throw new Error(`Plugin compagnon indisponible (${healthResponse.status}).`);
    }

    const health = await healthResponse.json();
    const pluginsRaw = await pluginsResponse.json().catch(() => []);
    const themesRaw = await themesResponse.json().catch(() => []);
    const updatesRaw = await updatesResponse.json().catch(() => ({}));
    const siteInfo = await siteInfoResponse?.json().catch(() => null);
    const plugins = Array.isArray(pluginsRaw)
      ? pluginsRaw.map(toPluginInfo).filter((plugin): plugin is PluginInfo => Boolean(plugin))
      : [];
    const themes = Array.isArray(themesRaw)
      ? themesRaw.map(toThemeInfo).filter((theme): theme is ThemeInfo => Boolean(theme))
      : [];

    const healthRecord = isRecord(health) ? health : {};
    const siteInfoRecord = isRecord(siteInfo) ? siteInfo : {};
    const environment =
      asString(healthRecord.environmentType) ??
      asString(healthRecord.environment) ??
      asString(siteInfoRecord.environmentType) ??
      asString(siteInfoRecord.environment);

    return enrichScanResult({
      detected: isRecord(health) && health.detected === true,
      connectionType: "companion_plugin",
      siteUrl: normalizeUrl(asString(isRecord(health) ? health.siteUrl : undefined) ?? site.url),
      wpVersion:
        asString(healthRecord.wpVersion) ?? asString(siteInfoRecord.wpVersion),
      phpVersion:
        asString(healthRecord.phpVersion) ?? asString(siteInfoRecord.phpVersion),
      activeTheme: activeThemeName(healthRecord) ?? activeThemeName(siteInfoRecord),
      environment,
      debugEnabled:
        asBoolean(healthRecord.debugEnabled) ??
        asBoolean(siteInfoRecord.debugEnabled),
      multisite:
        asBoolean(healthRecord.isMultisite) ??
        asBoolean(siteInfoRecord.isMultisite) ??
        asBoolean(siteInfoRecord.multisite),
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
        ...(siteInfoResponse
          ? []
          : [
              {
                code: "site_info_unavailable",
                severity: "info" as const,
                message:
                  "Endpoint site-info indisponible. Le scan utilise les endpoints compagnon principaux.",
              },
            ]),
      ],
      recommendations: [],
      securityHints: [],
      performanceHints: [],
      raw: {
        health,
        siteInfo,
        plugins: pluginsRaw,
        themes: themesRaw,
        updates: updatesRaw,
      },
    });
  }

  private endpoint(
    site: ConnectorSite,
    path: "health" | "plugins" | "themes" | "updates" | "site-info",
  ) {
    const baseUrl = site.connection?.apiBaseUrl ?? site.url;
    return joinUrl(baseUrl, `/wp-json/wp-agency-ops/v1/${path}`);
  }
}
