// import "dotenv/config";
// import { prisma } from "./prisma"; // relative path from db/ to lib/prisma.ts
// import sampleData from "./sample-data";

// async function main() {
//   // Clear existing products
//   await prisma.product.deleteMany();
//   await prisma.account.deleteMany();
//   await prisma.session.deleteMany();
//   await prisma.verificationToken.deleteMany();
//   await prisma.user.deleteMany();


//   // Insert sample products
//   await prisma.product.createMany({ data: sampleData.products });
//    await prisma.user.createMany({ data: sampleData.users });
   

//   console.log("✅ Database seeded successfully!");
// }

// main();


import { PrismaClient } from '../src/generated/prisma/client';
import sampleData from './sample-data';
import { hash } from '@/lib/encrypt';

async function main() {
  const prisma = new PrismaClient();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.product.createMany({ data: sampleData.products });
  const users = [];
  for (let i = 0; i < sampleData.users.length; i++) {
    users.push({
      ...sampleData.users[i],
      password: await hash(sampleData.users[i].password),
    });
    console.log(
      sampleData.users[i].password,
      await hash(sampleData.users[i].password)
    );
  }
  await prisma.user.createMany({ data: users });

  console.log('Database seeded successfully!');
}

main();