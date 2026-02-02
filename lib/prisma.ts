// import { neonConfig } from '@neondatabase/serverless';
// import { PrismaNeon } from '@prisma/adapter-neon';
// import { PrismaClient } from '../lib/generated/prisma/client';
// import ws from 'ws';

// // WebSocket for Neon
// neonConfig.webSocketConstructor = ws;

// // Adapter
// const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

// // Extended Prisma client for string conversion
// export const prisma = new PrismaClient({ adapter }).$extends({
//   result: {
//     product: {
//       price: { compute(product) { return product.price.toString(); } },
//       rating: { compute(product) { return product.rating.toString(); } },
//     },
//   },
// });

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma"; // <--- correct path!
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Export single Prisma client instance
export const prisma = new PrismaClient({ adapter });
