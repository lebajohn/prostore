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
import { Prisma } from "@/src/generated/prisma/client"

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

// get single product by its id
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId},
  });

  return convertToPlainObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
 
   // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};

  // Category filter
  const categoryFilter = category && category !== 'all' ? { category } : {};

  // Price filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== 'all'
      ? {
          price: {
            gte: Number(price.split('-')[0]),
            lte: Number(price.split('-')[1]),
          },
        }
      : {};

  // Rating filter
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === 'lowest'
        ? { price: 'asc' }
        : sort === 'highest'
        ? { price: 'desc' }
        : sort === 'rating'
        ? { rating: 'desc' }
        : { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
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


// get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return convertToPlainObject(data);
}

// Get all categories
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ['category'],
    _count: true,
  });

  return data;
}