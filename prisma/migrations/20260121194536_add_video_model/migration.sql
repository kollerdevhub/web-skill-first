-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "department" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT,
    "responsibilities" TEXT,
    "salaryRange" TEXT,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'hybrid',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("benefits", "company", "createdAt", "department", "description", "id", "location", "requirements", "responsibilities", "salaryRange", "status", "title", "updatedAt") SELECT "benefits", "company", "createdAt", "department", "description", "id", "location", "requirements", "responsibilities", "salaryRange", "status", "title", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
