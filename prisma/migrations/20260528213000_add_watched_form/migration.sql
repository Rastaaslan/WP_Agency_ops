-- CreateTable
CREATE TABLE "WatchedForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "expectedRecipients" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_tested',
    "lastCheckedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WatchedForm_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WatchedForm_siteId_idx" ON "WatchedForm"("siteId");

-- CreateIndex
CREATE INDEX "WatchedForm_status_idx" ON "WatchedForm"("status");

-- CreateIndex
CREATE INDEX "WatchedForm_lastCheckedAt_idx" ON "WatchedForm"("lastCheckedAt");
