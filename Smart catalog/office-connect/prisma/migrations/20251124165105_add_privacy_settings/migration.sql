-- CreateTable
CREATE TABLE "PrivacySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "showFullName" BOOLEAN NOT NULL DEFAULT true,
    "showGender" BOOLEAN NOT NULL DEFAULT true,
    "showAge" BOOLEAN NOT NULL DEFAULT true,
    "showWorkUnit" BOOLEAN NOT NULL DEFAULT true,
    "showMaritalStatus" BOOLEAN NOT NULL DEFAULT false,
    "showHomeAddress" BOOLEAN NOT NULL DEFAULT false,
    "showOfficeAddress" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);
