import type {
  ConnectionCheckResult,
  ConnectorSite,
  WordPressConnector,
  WordPressScanResult,
} from "../types";
import { PublicRestWordPressConnector } from "./public-rest";

abstract class FutureConnector implements WordPressConnector {
  protected readonly fallback = new PublicRestWordPressConnector();

  abstract readonly modeLabel: string;

  async checkConnection(site: ConnectorSite): Promise<ConnectionCheckResult> {
    const result = await this.fallback.checkConnection(site);
    return {
      ...result,
      message: `${this.modeLabel} n'est pas encore implemente. Fallback REST public : ${result.message}`,
    };
  }

  async scan(site: ConnectorSite): Promise<WordPressScanResult> {
    const result = await this.fallback.scan(site);
    return {
      ...result,
      warnings: [
        {
          code: "connector_not_implemented",
          severity: "info",
          message: `${this.modeLabel} est prepare dans l'architecture, mais pas active dans le MVP.`,
        },
        ...result.warnings,
      ],
    };
  }
}

export class ApplicationPasswordWordPressConnector extends FutureConnector {
  readonly modeLabel = "La connexion application password";
}
