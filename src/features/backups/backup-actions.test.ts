import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialBackupFormState } from "@/features/backups/backup-form-state";
import {
  createBackupAction,
  updateBackupAction,
} from "@/features/backups/backup-actions";

const { backupServiceMock, nextCacheMock, nextNavigationMock } = vi.hoisted(
  () => ({
    backupServiceMock: {
      createBackup: vi.fn(),
      updateBackup: vi.fn(),
    },
    nextCacheMock: {
      revalidatePath: vi.fn(),
    },
    nextNavigationMock: {
      redirect: vi.fn((path: string) => {
        throw new Error(`NEXT_REDIRECT:${path}`);
      }),
    },
  }),
);

vi.mock("@/features/backups/services/backup-service", () => backupServiceMock);

vi.mock("next/cache", () => ({
  revalidatePath: nextCacheMock.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: nextNavigationMock.redirect,
}));

describe("backup actions", () => {
  beforeEach(() => {
    backupServiceMock.createBackup.mockReset();
    backupServiceMock.updateBackup.mockReset();
    nextCacheMock.revalidatePath.mockReset();
    nextNavigationMock.redirect.mockClear();
  });

  it("returns validation errors without calling the service", async () => {
    const result = await createBackupAction(
      "site_1",
      createInitialBackupFormState(),
      new FormData(),
    );

    expect(backupServiceMock.createBackup).not.toHaveBeenCalled();
    expect(result.fieldErrors.performedAt).toEqual([
      "La date de sauvegarde est obligatoire.",
    ]);
  });

  it("creates a backup and redirects to the site page", async () => {
    backupServiceMock.createBackup.mockResolvedValue({ id: "backup_1" });

    await expect(
      createBackupAction(
        "site_1",
        createInitialBackupFormState(),
        createBackupFormData({
          type: "full",
          status: "done",
          performedAt: "2026-05-28T08:30",
          provider: "Hebergeur Demo",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1?notice=backup-saved");

    expect(backupServiceMock.createBackup).toHaveBeenCalledWith({
      siteId: "site_1",
      type: "full",
      status: "done",
      performedAt: new Date("2026-05-28T08:30"),
      provider: "Hebergeur Demo",
      storageLocation: undefined,
      interventionId: null,
      notes: undefined,
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites/site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/api/sites/site_1/technical-export",
    );
  });

  it("updates a backup and redirects to the site page", async () => {
    backupServiceMock.updateBackup.mockResolvedValue({ id: "backup_1" });

    await expect(
      updateBackupAction(
        "backup_1",
        "site_1",
        createInitialBackupFormState(),
        createBackupFormData({
          type: "database",
          status: "failed",
          performedAt: "2026-05-28T09:00",
          notes: "Erreur documentee.",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1?notice=backup-saved");

    expect(backupServiceMock.updateBackup).toHaveBeenCalledWith("backup_1", {
      type: "database",
      status: "failed",
      performedAt: new Date("2026-05-28T09:00"),
      provider: undefined,
      storageLocation: undefined,
      interventionId: null,
      notes: "Erreur documentee.",
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/backups/backup_1/edit",
    );
  });

  it("returns a readable error when a relation is missing", async () => {
    backupServiceMock.createBackup.mockRejectedValue({
      code: "P2003",
    });

    const result = await createBackupAction(
      "site_missing",
      createInitialBackupFormState(),
      createBackupFormData({
        type: "full",
        status: "done",
        performedAt: "2026-05-28T08:30",
      }),
    );

    expect(result.formError).toBe(
      "Site ou suivi technique introuvable. Choisissez une valeur existante puis réessayez.",
    );
  });
});

function createBackupFormData(values: Partial<Record<string, string>>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}
