-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "aliases" JSONB NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'qualified',
    "productTags" JSONB NOT NULL DEFAULT [],
    "lastDecision" TEXT,
    "nextStep" TEXT,
    "rollingSummary" TEXT,
    "organizationId" TEXT,
    "mouSignedAt" DATETIME,
    "integrationCompletedAt" DATETIME,
    "coMarketingCompletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Deal" ("aliases", "coMarketingCompletedAt", "createdAt", "id", "integrationCompletedAt", "lastDecision", "mouSignedAt", "name", "nextStep", "organizationId", "rollingSummary", "stage", "updatedAt") SELECT "aliases", "coMarketingCompletedAt", "createdAt", "id", "integrationCompletedAt", "lastDecision", "mouSignedAt", "name", "nextStep", "organizationId", "rollingSummary", "stage", "updatedAt" FROM "Deal";
DROP TABLE "Deal";
ALTER TABLE "new_Deal" RENAME TO "Deal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
