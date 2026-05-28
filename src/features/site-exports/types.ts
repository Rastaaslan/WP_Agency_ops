export type SiteTechnicalExport = {
  exportedAt: string;
  client: {
    id: string;
    name: string;
    companyName: string | null;
    status: string;
  };
  site: {
    id: string;
    name: string;
    url: string;
    environment: string;
    status: string;
    connectionType: string;
    connectionStatus: string;
    lastScanAt: string | null;
    notes: string | null;
  };
  latestSecurityCheck: unknown | null;
  latestPerformanceCheck: unknown | null;
  forms: unknown[];
  backups: unknown[];
  interventions: unknown[];
  latestWpurImport: unknown | null;
};

export interface SiteTechnicalExportService {
  exportSiteTechnicalState(siteId: string): Promise<SiteTechnicalExport>;
}

