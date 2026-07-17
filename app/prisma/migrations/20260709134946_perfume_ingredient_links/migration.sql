/*
  Warnings:

  - Added the required column `essenceIngredientId` to the `Perfume` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Perfume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "inspiredBrand" TEXT,
    "family" TEXT NOT NULL,
    "concentration" TEXT NOT NULL DEFAULT 'EDP',
    "description" TEXT,
    "essencePercentage" REAL NOT NULL,
    "essenceIngredientId" TEXT NOT NULL,
    "hedionePercentage" REAL NOT NULL DEFAULT 0,
    "hedioneIngredientId" TEXT,
    "baseId" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "quantityProduced" INTEGER NOT NULL DEFAULT 1,
    "marginTarget" REAL NOT NULL,
    "supplierId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Perfume_essenceIngredientId_fkey" FOREIGN KEY ("essenceIngredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Perfume_hedioneIngredientId_fkey" FOREIGN KEY ("hedioneIngredientId") REFERENCES "Ingredient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Perfume_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Perfume_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Perfume" ("baseId", "bottleId", "concentration", "createdAt", "deletedAt", "description", "essencePercentage", "family", "hedionePercentage", "id", "imageUrl", "inspiredBrand", "marginTarget", "name", "notes", "quantityProduced", "status", "supplierId", "updatedAt") SELECT "baseId", "bottleId", "concentration", "createdAt", "deletedAt", "description", "essencePercentage", "family", "hedionePercentage", "id", "imageUrl", "inspiredBrand", "marginTarget", "name", "notes", "quantityProduced", "status", "supplierId", "updatedAt" FROM "Perfume";
DROP TABLE "Perfume";
ALTER TABLE "new_Perfume" RENAME TO "Perfume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
