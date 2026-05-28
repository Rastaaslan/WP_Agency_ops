import { afterEach, describe, expect, it } from "vitest";
import {
  EnvironmentSecretProvider,
  UnconfiguredSecretProvider,
} from "./secret-provider";

const originalEnv = process.env;

describe("EnvironmentSecretProvider", () => {
  afterEach(() => {
    process.env = originalEnv;
  });

  it("resolves explicit env references", async () => {
    process.env = {
      ...originalEnv,
      CLIENT_SITE_API_KEY: "client-key",
    };

    const provider = new EnvironmentSecretProvider();

    await expect(provider.getSecret("env:CLIENT_SITE_API_KEY")).resolves.toBe(
      "client-key",
    );
  });

  it("resolves direct environment variable names", async () => {
    process.env = {
      ...originalEnv,
      DIRECT_API_KEY: "direct-key",
    };

    const provider = new EnvironmentSecretProvider();

    await expect(provider.getSecret("DIRECT_API_KEY")).resolves.toBe(
      "direct-key",
    );
  });

  it("falls back to the default companion API key variable", async () => {
    process.env = {
      ...originalEnv,
      WP_AGENCY_OPS_COMPANION_API_KEY: "default-key",
    };

    const provider = new EnvironmentSecretProvider();

    await expect(provider.getSecret()).resolves.toBe("default-key");
  });

  it("does not store secrets in the MVP", async () => {
    const provider = new EnvironmentSecretProvider();

    await expect(provider.setSecret("env:ANY_KEY", "secret")).rejects.toThrow(
      "variables d'environnement",
    );
  });
});

describe("UnconfiguredSecretProvider", () => {
  it("always returns null and rejects writes", async () => {
    const provider = new UnconfiguredSecretProvider();

    await expect(provider.getSecret("env:ANY_KEY")).resolves.toBeNull();
    await expect(provider.setSecret("env:ANY_KEY", "secret")).rejects.toThrow(
      "pas encore configure",
    );
  });
});
