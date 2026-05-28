import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBackup,
  updateBackup,
  updateBackupStatus,
} from "@/features/backups/services/backup-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    backupRecord: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("backup service", () => {
  beforeEach(() => {
    prismaMock.backupRecord.create.mockReset();
    prismaMock.backupRecord.update.mockReset();
  });

  it("creates a manual backup record through the validated schema", async () => {
    prismaMock.backupRecord.create.mockResolvedValue({ id: "backup_1" });

    await createBackup({
      siteId: "site_1",
      interventionId: "intervention_1",
      type: "full",
      status: "done",
      performedAt: "2026-05-28T08:30",
      provider: "Hebergeur Demo",
      storageLocation: "Stockage distant",
      notes: "Sauvegarde documentee.",
    });

    expect(prismaMock.backupRecord.create).toHaveBeenCalledWith({
      data: {
        siteId: "site_1",
        interventionId: "intervention_1",
        type: "full",
        status: "done",
        performedAt: new Date("2026-05-28T08:30"),
        provider: "Hebergeur Demo",
        storageLocation: "Stockage distant",
        notes: "Sauvegarde documentee.",
      },
    });
  });

  it("updates backup status without executing a backup", async () => {
    prismaMock.backupRecord.update.mockResolvedValue({
      id: "backup_1",
      status: "failed",
    });

    await updateBackupStatus("backup_1", "failed");

    expect(prismaMock.backupRecord.update).toHaveBeenCalledWith({
      where: { id: "backup_1" },
      data: {
        status: "failed",
      },
    });
  });

  it("rejects unexpected plugin-specific fields", async () => {
    await expect(
      updateBackup("backup_1", {
        status: "done",
        pluginSlug: "example-plugin",
      } as never),
    ).rejects.toThrow();

    expect(prismaMock.backupRecord.update).not.toHaveBeenCalled();
  });
});
