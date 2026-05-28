-- CreateTable
CREATE TABLE "SecurityCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "httpsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "hstsHeader" BOOLEAN NOT NULL DEFAULT false,
    "cspHeader" BOOLEAN NOT NULL DEFAULT false,
    "xFrameOptionsHeader" BOOLEAN NOT NULL DEFAULT false,
    "xContentTypeOptionsHeader" BOOLEAN NOT NULL DEFAULT false,
    "xmlrpcAccessible" BOOLEAN NOT NULL DEFAULT false,
    "readmeAccessible" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "notes" TEXT,
    "rawJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityCheck_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SecurityCheck_siteId_checkedAt_idx" ON "SecurityCheck"("siteId", "checkedAt");

-- CreateIndex
CREATE INDEX "SecurityCheck_status_idx" ON "SecurityCheck"("status");
