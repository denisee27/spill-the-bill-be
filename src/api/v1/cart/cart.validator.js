import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be 0 or more'),
});
