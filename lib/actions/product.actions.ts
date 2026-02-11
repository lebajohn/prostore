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
import { convertToPlainObject, formatError } from "../utils"
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants"
import { revalidatePath } from "next/cache"
import { insertProductSchema, updateProductSchema } from "../validators"
import z from "zod"

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

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
}) {
  const data = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit)
  };
}

// delete a product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id }
    });

    if(!productExists) throw new Error('Product not found');

    await prisma.product.delete({ where: { id }});

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product deleted successfully'
    }
  } catch (error) {
    return {success: false, message: formatError(error)}
    
  }
}

// create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({data: product});

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product created successful'
    }
  } catch (error) {
    return { success: false, message: formatError(error)}
  }
}

// update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id }
    });

    if(!productExists) throw new Error('Product not found');

    await prisma.product.update({
      where: { id: product.id },
      data: product
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product updated successful',
    }
  } catch (error) {
    return { success: false, message: formatError(error)}
  }
}