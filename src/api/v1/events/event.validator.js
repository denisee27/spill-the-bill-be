import { z } from 'zod';

const optionalDatetime = z.preprocess(
  (v) => (v === '' ? null : v),
  z.string().datetime().nullable().optional()
);

export const createEventSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  destination: z.string().optional(),
  bannerImage: z.string().optional(),
  startDate: optionalDatetime,
  endDate: optionalDatetime,
  status: z.enum(['ACTIVE', 'CLOSED', 'DRAFT']).optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const addProductsSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1),
});
