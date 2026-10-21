import { z } from 'zod';

export const updateMemberSettingsSchema = z.object({
  minMonthlyAmount: z.coerce.number().min(0).optional(),
  hasFreeShipping: z.boolean().optional(),
  renewalPeriodDays: z.coerce.number().int().min(1).max(365).optional(),
});
