import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  phone: z.string().optional().default(''),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().optional().default(''),
  isDefault: z.boolean().default(false),
  provinceCode: z.string().nullable().optional(),
  regencyCode: z.string().nullable().optional(),
  districtCode: z.string().nullable().optional(),
  villageCode: z.string().nullable().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();
