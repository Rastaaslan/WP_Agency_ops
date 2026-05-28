export interface SecretProvider {
  getSecret(reference?: string): Promise<string | null>;
  setSecret(reference: string, value: string): Promise<void>;
}

export class UnconfiguredSecretProvider implements SecretProvider {
  async getSecret() {
    return null;
  }

  async setSecret() {
    throw new Error(
      "Le stockage de secrets chiffres n'est pas encore configure dans ce MVP.",
    );
  }
}

export class EnvironmentSecretProvider implements SecretProvider {
  async getSecret(reference?: string) {
    if (reference?.startsWith("env:")) {
      return process.env[reference.slice(4)] ?? null;
    }

    if (reference) {
      return process.env[reference] ?? null;
    }

    return process.env.WP_AGENCY_OPS_COMPANION_API_KEY ?? null;
  }

  async setSecret() {
    throw new Error(
      "Les secrets compagnon doivent etre fournis via variables d'environnement pour ce MVP.",
    );
  }
}
