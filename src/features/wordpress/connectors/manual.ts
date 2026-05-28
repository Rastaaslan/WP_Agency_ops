import { normalizeUrl } from "@/lib/urls";
import { parseLines } from "@/lib/utils";
import type {
  ConnectionCheckResult,
  ConnectorSite,
  PluginInfo,
  ThemeInfo,
  WordPressConnector,
  WordPressScanResult,
} from "../types";

export type ManualScanInput = {
  wpVersion?: string;
  phpVersion?: string;
  pluginsText?: string;
  themesText?: string;
  notes?: string;
};

function parseAssetLine(line: string): PluginInfo {
  const [namePart, versionPart] = line.split("@").map((part) => part.trim());

  return {
    name: namePart,
    slug: namePart.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    version: versionPart || undefined,
    active: true,
    updateAvailable: false,
    status: "healthy",
  };
}

export class ManualWordPressConnector implements WordPressConnector {
  constructor(private readonly input: ManualScanInput = {}) {}

  async checkConnection(site: ConnectorSite): Promise<ConnectionCheckResult> {
    return {
      ok: true,
      detected: true,
      message: `Snapshot manuel prepare pour ${site.name}.`,
    };
  }

  async scan(site: ConnectorSite): Promise<WordPressScanResult> {
    const plugins = parseLines(this.input.pluginsText).map(parseAssetLine);
    const themes = parseLines(this.input.themesText).map(parseAssetLine) as ThemeInfo[];

    return {
      detected: true,
      siteUrl: normalizeUrl(site.url),
      wpVersion: this.input.wpVersion,
      phpVersion: this.input.phpVersion,
      plugins,
      themes,
      updates: [],
      warnings: [
        {
          code: "manual_snapshot",
          severity: "info",
          message:
            "Ces donnees proviennent d'une saisie manuelle et doivent etre verifiees lors de la prochaine intervention.",
        },
      ],
      securityHints: [],
      performanceHints: [],
      raw: {
        mode: "manual",
        notes: this.input.notes,
      },
    };
  }
}
