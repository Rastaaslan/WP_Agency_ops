import { describe, expect, it } from "vitest";
import {
  backupValuesFromRecord,
  parseCreateBackupForm,
  parseUpdateBackupForm,
} from "@/features/backups/backup-form-state";

describe("backup form state", () => {
  it("returns validation errors when required backup fields are missing", () => {
    const result = parseCreateBackupForm("site_1", new FormData());

    expect(result).toEqual({
      success: false,
      state: {
        values: {
          type: "full",
          status: "done",
          performedAt: "",
          provider: "",
          storageLocation: "",
          interventionId: "",
          notes: "",
        },
        fieldErrors: {
          performedAt: ["La date de sauvegarde est obligatoire."],
        },
      },
    });
  });

  it("parses a valid manual backup creation form", () => {
    const formData = createBackupFormData({
      type: "database",
      status: "done",
      performedAt: "2026-05-28T08:30",
      provider: "Hebergeur Demo",
      storageLocation: "Stockage distant",
      interventionId: "intervention_1",
      notes: "Sauvegarde manuelle documentee.",
    });

    const result = parseCreateBackupForm("site_1", formData);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.input).toEqual({
        siteId: "site_1",
        type: "database",
        status: "done",
        performedAt: new Date("2026-05-28T08:30"),
        provider: "Hebergeur Demo",
        storageLocation: "Stockage distant",
        interventionId: "intervention_1",
        notes: "Sauvegarde manuelle documentee.",
      });
    }
  });

  it("parses an update form with optional relation cleared", () => {
    const formData = createBackupFormData({
      type: "files",
      status: "failed",
      performedAt: "2026-05-28T09:00",
      interventionId: "",
    });

    const result = parseUpdateBackupForm(formData);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.input).toMatchObject({
        type: "files",
        status: "failed",
        performedAt: new Date("2026-05-28T09:00"),
        interventionId: null,
      });
    }
  });

  it("maps a backup record to form values", () => {
    expect(
      backupValuesFromRecord({
        type: "full",
        status: "done",
        performedAt: new Date("2026-05-28T08:30:00"),
        provider: null,
        storageLocation: "Stockage distant",
        interventionId: null,
        notes: "OK",
      }),
    ).toEqual({
      type: "full",
      status: "done",
      performedAt: "2026-05-28T08:30",
      provider: "",
      storageLocation: "Stockage distant",
      interventionId: "",
      notes: "OK",
    });
  });
});

function createBackupFormData(values: Partial<Record<string, string>>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}
