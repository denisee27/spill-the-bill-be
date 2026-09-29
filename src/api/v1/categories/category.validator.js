import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  type: z.enum(['JASTIP', 'PRELOVED', 'ALL']).default('ALL'),
});

export const updateCategorySchema = createCategorySchema.partial();
