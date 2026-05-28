export type GenerateReportInput = {
  siteId: string;
  periodStart: Date;
  periodEnd: Date;
  title?: string;
};

export type GeneratedReport = {
  title: string;
  markdownContent: string;
  htmlContent: string;
};

export interface ReportGenerator {
  generateSiteReport(input: GenerateReportInput): Promise<GeneratedReport>;
}
