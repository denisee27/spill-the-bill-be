import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().optional(),
  voucherCode: z.string().optional(),
  notes: z.string().optional(),
  itemIds: z.array(z.string()).optional(),
});

export const refundSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'CHECKING_PAYMENT',
    'PAYMENT_APPROVED',
    'PAYMENT_REJECTED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUND_REQUESTED',
    'REFUNDED',
  ]),
});

export const orderQuerySchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z
    .enum([
      'PENDING_PAYMENT',
      'CHECKING_PAYMENT',
      'PAYMENT_APPROVED',
      'PAYMENT_REJECTED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUND_REQUESTED',
      'REFUNDED',
    ])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
