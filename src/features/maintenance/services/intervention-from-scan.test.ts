import { describe, expect, it } from "vitest";
import { generateInterventionItemsFromScan } from "./intervention-from-scan";

describe("generateInterventionItemsFromScan", () => {
  it("creates planned maintenance items from scan updates", () => {
    const items = generateInterventionItemsFromScan({
      id: "scan_1",
      plugins: [
        {
          name: "Contact Forms Pro",
          version: "2.9.1",
          newVersion: "2.10.0",
          updateAvailable: true,
          active: true,
        },
        {
          name: "Old Gallery",
          version: "1.0.0",
          newVersion: null,
          updateAvailable: false,
          active: false,
        },
      ],
      themes: [
        {
          name: "Client Theme",
          version: "1.0.0",
          newVersion: "1.1.0",
          updateAvailable: true,
          active: true,
        },
      ],
      rawJson: {
        updates: [
          {
            kind: "core",
            label: "WordPress 6.8.2",
            newVersion: "6.8.2",
          },
        ],
        recommendations: [
          {
            message: "Prevoir une mise a jour des extensions.",
            priority: "warning",
          },
        ],
      },
    });

    expect(items.every((item) => item.status === "planned")).toBe(true);
    expect(items.map((item) => item.label)).toContain(
      "Mettre a jour WordPress vers 6.8.2.",
    );
    expect(items.map((item) => item.label)).toContain(
      "Mettre a jour le plugin Contact Forms Pro de 2.9.1 vers 2.10.0.",
    );
    expect(items.map((item) => item.label)).toContain(
      "Verifier les plugins inactifs.",
    );
    expect(items[0]?.details).toContain("Source: scan");
  });
});
