import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });
console.log("Bases:", await prisma.base.count());
console.log("Ingredientes:", await prisma.ingredient.count());
console.log("Perfumes:", await prisma.perfume.count());
await prisma.$disconnect();
