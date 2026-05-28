-- CreateTable
CREATE TABLE "BackupRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "interventionId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'full',
    "status" TEXT NOT NULL DEFAULT 'done',
    "performedAt" DATETIME NOT NULL,
    "provider" TEXT,
    "storageLocation" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BackupRecord_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BackupRecord_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BackupRecord_siteId_performedAt_idx" ON "BackupRecord"("siteId", "performedAt");

-- CreateIndex
CREATE INDEX "BackupRecord_interventionId_idx" ON "BackupRecord"("interventionId");

-- CreateIndex
CREATE INDEX "BackupRecord_status_idx" ON "BackupRecord"("status");

-- CreateIndex
CREATE INDEX "BackupRecord_type_idx" ON "BackupRecord"("type");
