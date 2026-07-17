-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "essencePercentage" REAL NOT NULL,
    "essenceIngredientId" TEXT NOT NULL,
    "hedionePercentage" REAL NOT NULL DEFAULT 0,
    "hedioneIngredientId" TEXT,
    "baseId" TEXT NOT NULL,
    "bottleId" TEXT,
    "volumeMl" REAL NOT NULL DEFAULT 30,
    "marginTarget" REAL NOT NULL DEFAULT 0.65,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "promotedPerfumeId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_essenceIngredientId_fkey" FOREIGN KEY ("essenceIngredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_hedioneIngredientId_fkey" FOREIGN KEY ("hedioneIngredientId") REFERENCES "Ingredient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Project_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectMaterialCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "useSystemPrice" BOOLEAN NOT NULL DEFAULT true,
    "manualUnitCost" REAL,
    CONSTRAINT "ProjectMaterialCost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectMaterialCost_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMaterialCost_projectId_ingredientId_key" ON "ProjectMaterialCost"("projectId", "ingredientId");
