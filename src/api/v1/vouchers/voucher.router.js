import { Router } from 'express';
import { makeVoucherController } from './voucher.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { createVoucherSchema, updateVoucherSchema } from './voucher.validator.js';

export const makeVoucherRouter = (container) => {
  const router = Router();
  const voucherService = container.resolve('voucherService');
  const { validateVoucher, listVouchers, createVoucher, updateVoucher, deleteVoucher, getUsage } =
    makeVoucherController({ voucherService });

  router.get('/validate', requireAuth, validateVoucher);

  router.get('/admin/all', requireAuth, requireAdmin, listVouchers);
  router.get('/admin/:id/usage', requireAuth, requireAdmin, getUsage);
  router.post('/admin', requireAuth, requireAdmin, validate(createVoucherSchema), createVoucher);
  router.patch('/admin/:id', requireAuth, requireAdmin, validate(updateVoucherSchema), updateVoucher);
  router.delete('/admin/:id', requireAuth, requireAdmin, deleteVoucher);

  return router;
};
