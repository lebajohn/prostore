import "dotenv/config";
import { prisma } from "@/db/prisma"; // relative path from db/ to lib/prisma.ts
import sampleData from "./sample-data";

async function main() {
  // Clear existing products
  await prisma.product.deleteMany();

  // Insert sample products
  await prisma.product.createMany({
    data: sampleData.products,
  });

  console.log("✅ Database seeded successfully!");
}

main();
