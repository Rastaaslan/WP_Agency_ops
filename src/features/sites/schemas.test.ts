import { describe, expect, it } from "vitest";
import { siteFormSchema } from "./schemas";

describe("siteFormSchema", () => {
  it("normalizes site URLs", () => {
    const site = siteFormSchema.parse({
      clientId: "client_1",
      name: "Site Demo",
      url: "example.com",
      environment: "production",
      connectionType: "public_rest",
    });

    expect(site.url).toBe("https://example.com");
  });

  it("requires a client", () => {
    expect(() =>
      siteFormSchema.parse({
        clientId: "",
        name: "Site Demo",
        url: "https://example.com",
        environment: "production",
        connectionType: "public_rest",
      }),
    ).toThrow();
  });
});
