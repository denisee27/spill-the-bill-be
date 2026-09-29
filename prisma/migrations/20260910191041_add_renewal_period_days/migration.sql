-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MemberSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "minMonthlyAmount" REAL NOT NULL DEFAULT 500000,
    "discountPercent" REAL NOT NULL DEFAULT 10,
    "hasFreeShipping" BOOLEAN NOT NULL DEFAULT false,
    "freeShippingMinAmount" REAL NOT NULL DEFAULT 0,
    "renewalPeriodDays" INTEGER NOT NULL DEFAULT 30
);
INSERT INTO "new_MemberSetting" ("discountPercent", "freeShippingMinAmount", "hasFreeShipping", "id", "minMonthlyAmount") SELECT "discountPercent", "freeShippingMinAmount", "hasFreeShipping", "id", "minMonthlyAmount" FROM "MemberSetting";
DROP TABLE "MemberSetting";
ALTER TABLE "new_MemberSetting" RENAME TO "MemberSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
