export type PerformanceCheckResult = {
  siteId: string;
  url: string;
  status: "ok" | "warning" | "issue" | "failed";
  httpStatusCode?: number;
  responseTimeMs?: number;
  pageWeightKb?: number;
  notes?: string;
};

export interface PerformanceProvider {
  runCheck(siteId: string, url: string): Promise<PerformanceCheckResult>;
}
