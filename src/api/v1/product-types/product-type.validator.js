import { z } from 'zod';

export const createProductTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const updateProductTypeSchema = createProductTypeSchema.partial();
