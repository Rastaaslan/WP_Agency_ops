import { describe, expect, it } from "vitest";
import { backupRecordFormSchema } from "./schemas";

describe("backupRecordFormSchema", () => {
  it("validates a manual backup record", () => {
    const parsed = backupRecordFormSchema.parse({
      checkedAt: "2026-05-20",
      status: "ok",
      filesBackedUp: true,
      databaseBackedUp: true,
      interventionId: "",
      notes: "Archive fichiers et dump SQL verifies.",
    });

    expect(parsed.status).toBe("ok");
    expect(parsed.interventionId).toBeUndefined();
  });
});

