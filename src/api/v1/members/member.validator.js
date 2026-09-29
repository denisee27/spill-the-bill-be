import { z } from 'zod';

export const updateMemberSettingsSchema = z.object({
  minMonthlyAmount: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  hasFreeShipping: z.boolean().optional(),
  freeShippingMinAmount: z.number().min(0).optional(),
  renewalPeriodDays: z.number().int().min(1).max(365).optional(),
});
