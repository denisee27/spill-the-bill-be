import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  categoryId: z.string().optional(),
  originalPrice: z.coerce.number().positive().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  stock: z.coerce.number().int().min(0).default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  isFeatured: z.coerce.boolean().default(false),
  freeShipping: z.coerce.boolean().default(false),
  condition: z.enum(['New', 'Good', 'Well Used']).optional(),
  weight: z.coerce.number().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  type: z.string().optional(),
  categoryId: z.string().optional(),
  categoryIds: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: z.enum(['New', 'Good', 'Well Used']).optional(),
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'name_asc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
