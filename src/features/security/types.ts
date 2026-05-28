export type SecurityCheckResult = {
  siteId: string;
  status: "ok" | "warning" | "issue" | "failed";
  httpsEnabled: boolean;
  hasSecurityHeaders: boolean;
  hstsEnabled: boolean;
  contentSecurityPolicy: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  xmlrpcExposed?: boolean;
  readmeExposed?: boolean;
  directoryListingDetected?: boolean;
  notes?: string;
};

export interface SecurityCheckProvider {
  runCheck(siteId: string): Promise<SecurityCheckResult>;
}
