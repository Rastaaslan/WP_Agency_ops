export type ConnectorSite = {
  id: string;
  name: string;
  url: string;
  connectionType: string;
  connection?: {
    apiBaseUrl?: string | null;
    secretReference?: string | null;
    username?: string | null;
  } | null;
};

export type ConnectionCheckResult = {
  ok: boolean;
  detected: boolean;
  statusCode?: number;
  message: string;
  raw?: unknown;
};

export type PluginInfo = {
  name: string;
  slug?: string;
  version?: string;
  updateAvailable?: boolean;
  newVersion?: string;
  active?: boolean;
  requiresWp?: string;
  requiresPhp?: string;
  testedUpTo?: string;
  status?: "unknown" | "healthy" | "update_available" | "inactive" | "warning";
};

export type ThemeInfo = {
  name: string;
  slug?: string;
  version?: string;
  updateAvailable?: boolean;
  newVersion?: string;
  active?: boolean;
  status?: "unknown" | "healthy" | "update_available" | "inactive" | "warning";
};

export type UpdateInfo = {
  kind: "core" | "plugin" | "theme" | "translation";
  slug?: string;
  currentVersion?: string;
  newVersion?: string;
  label: string;
};

export type ScanWarning = {
  code: string;
  message: string;
  severity: "info" | "warning" | "issue";
};

export type SecurityHint = {
  code: string;
  message: string;
  status: "ok" | "warning" | "issue";
};

export type PerformanceHint = {
  code: string;
  message: string;
  status: "ok" | "warning" | "issue";
};

export type TechnicalRecommendation = {
  code: string;
  message: string;
  priority: "info" | "warning" | "important";
};

export type WordPressScanResult = {
  detected: boolean;
  connectionType: "public_rest" | "companion_plugin" | "manual";
  siteUrl: string;
  wpVersion?: string;
  phpVersion?: string;
  activeTheme?: string;
  environment?: string;
  debugEnabled?: boolean;
  multisite?: boolean;
  plugins: PluginInfo[];
  themes: ThemeInfo[];
  updates: UpdateInfo[];
  warnings: ScanWarning[];
  recommendations: TechnicalRecommendation[];
  securityHints: SecurityHint[];
  performanceHints: PerformanceHint[];
  raw?: unknown;
};

export interface WordPressConnector {
  checkConnection(site: ConnectorSite): Promise<ConnectionCheckResult>;
  scan(site: ConnectorSite): Promise<WordPressScanResult>;
}
