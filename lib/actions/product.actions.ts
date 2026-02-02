// 'use server'

// import { prisma } from "@/db/prisma"
// import { convertToPlainObject } from "../utils";
// import { LATEST_PRODUCTS_LIMIT } from "../constants";

// // get latest products

// export async function getLatestProducts() {
//     const data = await prisma.product.findMany({
//         take: LATEST_PRODUCTS_LIMIT,
//         orderBy: { createdAt: 'desc'},
//     });
    
//     return convertToPlainObject(data);
// }

// // get single product by its slug
// export async function getProductBySlug(slug: string) {
//     return await prisma.product.findFirst({
//         where: {slug: slug},
//     });
    
// }

'use server'

import { prisma } from "@/db/prisma"
import { convertToPlainObject } from "../utils"
import { LATEST_PRODUCTS_LIMIT } from "../constants"

// get latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  })

  const mapped = data.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    brand: product.brand,
    description: product.description,
    stock: product.stock,
    images: product.image, // ✅ FIX: image → images
    isFeatured: product.isFeatured,
    banner: product.banner,
    price: product.price, // already string
    rating: product.rating,
    createdAt: product.createdAt,
  }))

  return convertToPlainObject(mapped)
}

// get single product by its slug
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug },
  })

  if (!product) return null

  return convertToPlainObject({
    ...product,
    images: product.image, // ✅ same fix here
  })
}
