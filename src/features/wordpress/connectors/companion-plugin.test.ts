import { afterEach, describe, expect, it, vi } from "vitest";
import { CompanionPluginWordPressConnector } from "./companion-plugin";
import type { SecretProvider } from "../secret-provider";

const secretProvider: SecretProvider = {
  async getSecret() {
    return "test-api-key";
  },
  async setSecret() {
    throw new Error("not needed");
  },
};

const site = {
  id: "site_1",
  name: "Demo WP",
  url: "https://example.com",
  connectionType: "companion_plugin",
  connection: {
    apiBaseUrl: "https://example.com",
    secretReference: "env:WP_AGENCY_OPS_COMPANION_API_KEY",
  },
};

describe("CompanionPluginWordPressConnector", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("checks a companion plugin connection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          detected: true,
          siteUrl: "https://example.com",
          wpVersion: "6.8.1",
        }),
      ),
    );

    const connector = new CompanionPluginWordPressConnector(secretProvider);
    const result = await connector.checkConnection(site);

    expect(result.ok).toBe(true);
    expect(result.detected).toBe(true);
    expect(result.message).toContain("connecte");
  });

  it("normalizes scan payloads from companion endpoints", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/health")) {
          return Response.json({
            detected: true,
            siteUrl: "https://example.com",
            wpVersion: "6.8.1",
            phpVersion: "8.3",
          });
        }

        if (url.endsWith("/plugins")) {
          return Response.json([
            {
              name: "Contact Forms Pro",
              slug: "contact-forms-pro",
              version: "2.9.1",
              active: true,
              updateAvailable: true,
              newVersion: "2.10.0",
              status: "update_available",
            },
          ]);
        }

        if (url.endsWith("/themes")) {
          return Response.json([
            {
              name: "Client Theme",
              slug: "client-theme",
              version: "1.0.0",
              active: true,
              updateAvailable: false,
              status: "healthy",
            },
          ]);
        }

        return Response.json({
          plugins: {
            "contact-forms-pro/contact-forms-pro.php": {
              new_version: "2.10.0",
            },
          },
          themes: {},
        });
      }),
    );

    const connector = new CompanionPluginWordPressConnector(secretProvider);
    const result = await connector.scan(site);

    expect(result.detected).toBe(true);
    expect(result.wpVersion).toBe("6.8.1");
    expect(result.phpVersion).toBe("8.3");
    expect(result.plugins).toHaveLength(1);
    expect(result.plugins[0]?.updateAvailable).toBe(true);
    expect(result.themes[0]?.name).toBe("Client Theme");
    expect(result.updates[0]?.kind).toBe("plugin");
  });
});
