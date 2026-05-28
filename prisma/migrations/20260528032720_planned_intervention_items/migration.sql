-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InterventionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interventionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterventionItem_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "MaintenanceIntervention" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InterventionItem" ("createdAt", "details", "id", "interventionId", "label", "status") SELECT "createdAt", "details", "id", "interventionId", "label", "status" FROM "InterventionItem";
DROP TABLE "InterventionItem";
ALTER TABLE "new_InterventionItem" RENAME TO "InterventionItem";
CREATE INDEX "InterventionItem_interventionId_idx" ON "InterventionItem"("interventionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
