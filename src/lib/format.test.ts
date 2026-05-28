import { describe, expect, it } from "vitest";
import {
  formatEnumLabel,
  formatNullable,
  readWpurSummary,
} from "@/lib/format";

describe("format helpers", () => {
  it("formats empty text with a fallback", () => {
    expect(formatNullable("")).toBe("Non renseigné");
    expect(formatNullable("Agence Demo")).toBe("Agence Demo");
  });

  it("formats known enum values with readable labels", () => {
    expect(formatEnumLabel("wpur_plugin_maintenance")).toBe(
      "Maintenance plugins via WPUR",
    );
    expect(formatEnumLabel("custom_status")).toBe("Custom Status");
  });

  it("reads a light WPUR summary without requiring detailed plugin data", () => {
    expect(
      readWpurSummary(
        {
          periodMonth: "2026-05",
          maintenanceDateCount: 2,
          sectionCount: 3,
          totalLineCount: 8,
          alertCount: 1,
        },
        "2026-04",
      ),
    ).toEqual({
      periodMonth: "2026-05",
      maintenanceDateCount: 2,
      sectionCount: 3,
      totalLineCount: 8,
      alertCount: 1,
    });
  });

  it("falls back safely when a WPUR summary is missing", () => {
    expect(readWpurSummary(null, "2026-05")).toEqual({
      periodMonth: "2026-05",
      maintenanceDateCount: 0,
      sectionCount: 0,
      totalLineCount: 0,
      alertCount: 0,
    });
  });
});
