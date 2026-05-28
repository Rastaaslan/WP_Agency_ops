-- CreateTable
CREATE TABLE "PerformanceCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "responseTimeMs" INTEGER,
    "contentLengthBytes" INTEGER,
    "summary" TEXT,
    "notes" TEXT,
    "rawJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceCheck_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PerformanceCheck_siteId_checkedAt_idx" ON "PerformanceCheck"("siteId", "checkedAt");

-- CreateIndex
CREATE INDEX "PerformanceCheck_status_idx" ON "PerformanceCheck"("status");
