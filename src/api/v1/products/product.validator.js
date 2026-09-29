import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['JASTIP', 'PRELOVED']),
  categoryId: z.string().optional(),
  originalPrice: z.coerce.number().positive().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  weight: z.coerce.number().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  type: z.enum(['JASTIP', 'PRELOVED']).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
