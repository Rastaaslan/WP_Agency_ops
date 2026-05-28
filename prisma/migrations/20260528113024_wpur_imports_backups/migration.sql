-- CreateTable
CREATE TABLE "BackupRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "interventionId" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "filesBackedUp" BOOLEAN NOT NULL DEFAULT false,
    "databaseBackedUp" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BackupRecord_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BackupRecord_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "MaintenanceIntervention" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WpurImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodMonth" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "summaryJson" JSONB NOT NULL,
    CONSTRAINT "WpurImport_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MaintenanceIntervention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "description" TEXT,
    "technicalNotes" TEXT,
    "clientSummary" TEXT,
    "wpurImportId" TEXT,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceIntervention_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceIntervention_wpurImportId_fkey" FOREIGN KEY ("wpurImportId") REFERENCES "WpurImport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MaintenanceIntervention" ("clientSummary", "createdAt", "description", "finishedAt", "id", "siteId", "startedAt", "status", "technicalNotes", "title", "type", "updatedAt") SELECT "clientSummary", "createdAt", "description", "finishedAt", "id", "siteId", "startedAt", "status", "technicalNotes", "title", "type", "updatedAt" FROM "MaintenanceIntervention";
DROP TABLE "MaintenanceIntervention";
ALTER TABLE "new_MaintenanceIntervention" RENAME TO "MaintenanceIntervention";
CREATE INDEX "MaintenanceIntervention_siteId_createdAt_idx" ON "MaintenanceIntervention"("siteId", "createdAt");
CREATE INDEX "MaintenanceIntervention_status_idx" ON "MaintenanceIntervention"("status");
CREATE INDEX "MaintenanceIntervention_wpurImportId_idx" ON "MaintenanceIntervention"("wpurImportId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BackupRecord_siteId_checkedAt_idx" ON "BackupRecord"("siteId", "checkedAt");

-- CreateIndex
CREATE INDEX "BackupRecord_status_idx" ON "BackupRecord"("status");

-- CreateIndex
CREATE INDEX "BackupRecord_interventionId_idx" ON "BackupRecord"("interventionId");

-- CreateIndex
CREATE INDEX "WpurImport_siteId_importedAt_idx" ON "WpurImport"("siteId", "importedAt");

-- CreateIndex
CREATE INDEX "WpurImport_periodMonth_idx" ON "WpurImport"("periodMonth");
