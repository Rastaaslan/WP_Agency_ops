export type UptimeCheckResult = {
  siteId: string;
  status: "ok" | "warning" | "failed";
  responseTimeMs?: number;
  httpStatusCode?: number;
  checkedAt: Date;
};

export interface MonitoringProvider {
  runUptimeCheck(siteId: string): Promise<UptimeCheckResult>;
}
