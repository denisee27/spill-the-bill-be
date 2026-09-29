import { z } from 'zod';

export const updateWhatsappSchema = z.object({
  phoneNumber: z.string().optional(),
  defaultMessage: z.string().optional(),
  isActive: z.boolean().optional(),
});
