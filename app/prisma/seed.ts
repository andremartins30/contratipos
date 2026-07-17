import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient, IngredientCategory, OlfactiveFamily, Concentration } from "@prisma/client";

const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

/** Dados extraídos 1:1 da Planilha2 do contratipo.xlsx. */
async function main() {
  const supplier = await prisma.supplier.create({
    data: { name: "Fornecedor Padrão" },
  });

  const [alcool, agua, propilenoglicol, isoESuper, ambroxan, galaxolide, hedione, essencia] =
    await Promise.all([
      prisma.ingredient.create({
        data: {
          name: "Álcool Cereal",
          category: IngredientCategory.ALCOOL,
          unit: "ml",
          purchaseVolume: 1000,
          purchasePrice: 18,
          supplierId: supplier.id,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: "Água Deionizada",
          category: IngredientCategory.SOLVENTES,
          unit: "ml",
          purchaseVolume: 1000,
          purchasePrice: 18,
          supplierId: supplier.id,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: "Propilenoglicol",
          category: IngredientCategory.SOLVENTES,
          unit: "ml",
          purchaseVolume: 100,
          purchasePrice: 22.95,
          supplierId: supplier.id,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: "Iso E Super",
          category: IngredientCategory.SINTETICOS,
          unit: "ml",
          purchaseVolume: 100,
          purchasePrice: 37.49,
          supplierId: supplier.id,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: "Ambroxan 10%",
          category: IngredientCategory.SINTETICOS,
          unit: "ml",
          purchaseVolume: 100,
          purchasePrice: 68.48,
          supplierId: supplier.id,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: "Galaxolide",
          category: IngredientCategory.SINTETICOS,
          unit: "ml",
          purchaseVolume: 100,
          purchasePrice: 21.13,
          supplierId: supplier.id,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: "Hedione",
          category: IngredientCategory.SINTETICOS,
          unit: "ml",
          purchaseVolume: 100,
          purchasePrice: 28.09,
          supplierId: supplier.id,
        },
      }),
      prisma.ingredient.create({
        data: {
          name: "Essência Symrise",
          category: IngredientCategory.ESSENCIA,
          unit: "ml",
          purchaseVolume: 100,
          purchasePrice: 60,
          supplierId: supplier.id,
        },
      }),
    ]);

  const base = await prisma.base.create({
    data: {
      name: "Base Turbo",
      batchSize: 1000,
      items: {
        create: [
          { ingredientId: alcool.id, percentage: 0.9 },
          { ingredientId: agua.id, percentage: 0.05 },
          { ingredientId: propilenoglicol.id, percentage: 0.02 },
          { ingredientId: isoESuper.id, percentage: 0.015 },
          { ingredientId: ambroxan.id, percentage: 0.01 },
          { ingredientId: galaxolide.id, percentage: 0.005 },
        ],
      },
    },
  });

  const [bottle30, bottle50] = await Promise.all([
    prisma.bottle.create({
      data: { volumeMl: 30, price: 7, model: "Spray padrão", quantity: 100, supplierId: supplier.id },
    }),
    prisma.bottle.create({
      data: { volumeMl: 50, price: 7, model: "Spray padrão", quantity: 100, supplierId: supplier.id },
    }),
  ]);

  const perfumes: {
    name: string;
    family: OlfactiveFamily;
    essencePercentage: number;
    hedionePercentage: number;
  }[] = [
    { name: "Versace Pour Homme", family: OlfactiveFamily.CITRICO, essencePercentage: 0.235, hedionePercentage: 0.0025 },
    { name: "YSL Libre", family: OlfactiveFamily.FLORAL, essencePercentage: 0.235, hedionePercentage: 0.005 },
    { name: "YSL Myself", family: OlfactiveFamily.AROMATICO_FRESCO, essencePercentage: 0.235, hedionePercentage: 0.002 },
    { name: "Delina", family: OlfactiveFamily.FLORAL, essencePercentage: 0.25, hedionePercentage: 0.0045 },
    { name: "Erba Pura", family: OlfactiveFamily.ORIENTAL_GOURMAND, essencePercentage: 0.25, hedionePercentage: 0.0012 },
    { name: "Scandal", family: OlfactiveFamily.AROMATICO_GOURMAND, essencePercentage: 0.25, hedionePercentage: 0.0018 },
    { name: "Creed Aventus", family: OlfactiveFamily.CHYPRE_FRUTADO, essencePercentage: 0.25, hedionePercentage: 0.0028 },
  ];

  for (const p of perfumes) {
    await prisma.perfume.create({
      data: {
        name: p.name,
        family: p.family,
        concentration: Concentration.EDP,
        essencePercentage: p.essencePercentage,
        essenceIngredientId: essencia.id,
        hedionePercentage: p.hedionePercentage,
        hedioneIngredientId: hedione.id,
        baseId: base.id,
        bottleId: bottle30.id,
        quantityProduced: 1,
        marginTarget: 0.66,
        status: "ATIVO",
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
