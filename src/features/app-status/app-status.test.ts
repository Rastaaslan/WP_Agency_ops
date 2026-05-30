import { describe, expect, it } from "vitest";
import {
  createDatabaseStatusSummary,
  formatRuntimeEnvironment,
} from "@/features/app-status/app-status";

describe("app status helpers", () => {
  it("formats runtime environments for users", () => {
    expect(formatRuntimeEnvironment("development")).toBe("Développement local");
    expect(formatRuntimeEnvironment("production")).toBe("Production");
    expect(formatRuntimeEnvironment("test")).toBe("Test");
    expect(formatRuntimeEnvironment("custom")).toBe("Non renseigné");
  });

  it("summarizes a successful database check", () => {
    expect(createDatabaseStatusSummary(2)).toEqual({
      status: "ok",
      label: "Base disponible",
      message: "La base répond correctement. 2 clients suivis dans le cockpit.",
    });
  });

  it("keeps database check failures non technical", () => {
    expect(createDatabaseStatusSummary(null)).toEqual({
      status: "warning",
      label: "Base à vérifier",
      message:
        "L'application répond, mais la base de données n'a pas pu être confirmée sur cette page.",
    });
  });
});
