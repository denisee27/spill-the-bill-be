import { z } from 'zod';

export const createPortfolioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['JASTIP', 'PRELOVED']),
  isActive: z.coerce.boolean().default(true),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();
