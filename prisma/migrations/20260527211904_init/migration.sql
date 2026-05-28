-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WordPressSite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "adminUrl" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "status" TEXT NOT NULL DEFAULT 'active',
    "connectionType" TEXT NOT NULL DEFAULT 'public_rest',
    "connectionStatus" TEXT NOT NULL DEFAULT 'unknown',
    "lastScanAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WordPressSite_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordPressConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "apiBaseUrl" TEXT,
    "username" TEXT,
    "secretReference" TEXT,
    "lastConnectionCheckAt" DATETIME,
    "lastConnectionStatus" TEXT NOT NULL DEFAULT 'unknown',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WordPressConnection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SiteScan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" DATETIME NOT NULL,
    "finishedAt" DATETIME,
    "summaryJson" JSONB,
    "rawJson" JSONB,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteScan_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordPressPlugin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "version" TEXT,
    "updateAvailable" BOOLEAN NOT NULL DEFAULT false,
    "newVersion" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "requiresWp" TEXT,
    "requiresPhp" TEXT,
    "testedUpTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    CONSTRAINT "WordPressPlugin_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "SiteScan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordPressTheme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "version" TEXT,
    "updateAvailable" BOOLEAN NOT NULL DEFAULT false,
    "newVersion" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    CONSTRAINT "WordPressTheme_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "SiteScan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceIntervention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "description" TEXT,
    "technicalNotes" TEXT,
    "clientSummary" TEXT,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceIntervention_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterventionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interventionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'done',
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterventionItem_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "MaintenanceIntervention" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "markdownContent" TEXT NOT NULL,
    "htmlContent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Report_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pageUrl" TEXT,
    "endpointSlug" TEXT,
    "expectedFieldsJson" JSONB,
    "recipientsJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'untested',
    "spamProtectionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormEndpoint_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formEndpointId" TEXT NOT NULL,
    "payloadJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'received',
    "spamScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormSubmission_formEndpointId_fkey" FOREIGN KEY ("formEndpointId") REFERENCES "FormEndpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "httpStatusCode" INTEGER,
    "responseTimeMs" INTEGER,
    "pageWeightKb" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceCheck_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "httpsEnabled" BOOLEAN NOT NULL,
    "hasSecurityHeaders" BOOLEAN NOT NULL,
    "hstsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "contentSecurityPolicy" BOOLEAN NOT NULL DEFAULT false,
    "xFrameOptions" BOOLEAN NOT NULL DEFAULT false,
    "xContentTypeOptions" BOOLEAN NOT NULL DEFAULT false,
    "xmlrpcExposed" BOOLEAN,
    "readmeExposed" BOOLEAN,
    "directoryListingDetected" BOOLEAN,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityCheck_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaticCompatibilityReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "score" INTEGER,
    "isBrochureSite" BOOLEAN NOT NULL DEFAULT false,
    "noDynamicCommerce" BOOLEAN NOT NULL DEFAULT false,
    "noMemberArea" BOOLEAN NOT NULL DEFAULT false,
    "formsIdentified" BOOLEAN NOT NULL DEFAULT false,
    "searchIdentified" BOOLEAN NOT NULL DEFAULT false,
    "commentsIdentified" BOOLEAN NOT NULL DEFAULT false,
    "recommendations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StaticCompatibilityReview_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WordPressSite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE INDEX "WordPressSite_clientId_idx" ON "WordPressSite"("clientId");

-- CreateIndex
CREATE INDEX "WordPressSite_status_idx" ON "WordPressSite"("status");

-- CreateIndex
CREATE INDEX "WordPressSite_connectionStatus_idx" ON "WordPressSite"("connectionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "WordPressConnection_siteId_key" ON "WordPressConnection"("siteId");

-- CreateIndex
CREATE INDEX "SiteScan_siteId_createdAt_idx" ON "SiteScan"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "SiteScan_status_idx" ON "SiteScan"("status");

-- CreateIndex
CREATE INDEX "WordPressPlugin_scanId_idx" ON "WordPressPlugin"("scanId");

-- CreateIndex
CREATE INDEX "WordPressTheme_scanId_idx" ON "WordPressTheme"("scanId");

-- CreateIndex
CREATE INDEX "MaintenanceIntervention_siteId_createdAt_idx" ON "MaintenanceIntervention"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "MaintenanceIntervention_status_idx" ON "MaintenanceIntervention"("status");

-- CreateIndex
CREATE INDEX "InterventionItem_interventionId_idx" ON "InterventionItem"("interventionId");

-- CreateIndex
CREATE INDEX "Report_siteId_createdAt_idx" ON "Report"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_clientId_idx" ON "Report"("clientId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "FormEndpoint_siteId_idx" ON "FormEndpoint"("siteId");

-- CreateIndex
CREATE INDEX "FormEndpoint_status_idx" ON "FormEndpoint"("status");

-- CreateIndex
CREATE INDEX "FormSubmission_formEndpointId_createdAt_idx" ON "FormSubmission"("formEndpointId", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceCheck_siteId_createdAt_idx" ON "PerformanceCheck"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceCheck_status_idx" ON "PerformanceCheck"("status");

-- CreateIndex
CREATE INDEX "SecurityCheck_siteId_createdAt_idx" ON "SecurityCheck"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityCheck_status_idx" ON "SecurityCheck"("status");

-- CreateIndex
CREATE INDEX "StaticCompatibilityReview_siteId_createdAt_idx" ON "StaticCompatibilityReview"("siteId", "createdAt");
