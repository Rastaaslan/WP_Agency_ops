export interface SecretProvider {
  getSecret(reference: string): Promise<string | null>;
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
