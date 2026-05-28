export type StaticCompatibilityResult = {
  status: "unknown" | "promising" | "needs_review" | "not_recommended";
  score: number;
  recommendations: string;
};

export type StaticBuildResult = {
  status: "not_implemented";
  message: string;
};

export interface StaticPublisher {
  analyzeCompatibility(siteId: string): Promise<StaticCompatibilityResult>;
  generateStaticBuild(siteId: string): Promise<StaticBuildResult>;
}
