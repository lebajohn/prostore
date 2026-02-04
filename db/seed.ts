import "dotenv/config";
import { prisma } from "@/db/prisma"; // relative path from db/ to lib/prisma.ts
import sampleData from "./sample-data";

async function main() {
  // Clear existing products
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();


  // Insert sample products
  await prisma.product.createMany({ data: sampleData.products });
   await prisma.user.createMany({ data: sampleData.users });
   

  console.log("✅ Database seeded successfully!");
}

main();
