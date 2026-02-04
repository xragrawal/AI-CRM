-- CreateTable
CREATE TABLE "ProductTagFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rawTextSnippet" TEXT NOT NULL,
    "aiSuggestedTags" JSONB NOT NULL,
    "userFinalTags" JSONB NOT NULL,
    "dealId" TEXT,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
