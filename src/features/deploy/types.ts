export type DeployInput = {
  siteId: string;
  provider: "cloudflare_pages" | "netlify" | "vercel" | "ftp_sftp" | "github_pages";
  artifactPath?: string;
};

export type DeployResult = {
  status: "queued" | "success" | "failed" | "not_implemented";
  message: string;
  deploymentUrl?: string;
};

export interface DeployProvider {
  deploy(input: DeployInput): Promise<DeployResult>;
}
