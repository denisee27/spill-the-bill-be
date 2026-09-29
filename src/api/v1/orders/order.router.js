import { Router } from 'express';
import { makeOrderController } from './order.controller.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { uploadImages } from '../../middleware/handle-upload.js';
import {
  createOrderSchema,
  refundSchema,
  updateStatusSchema,
  orderQuerySchema,
} from './order.validator.js';

export const makeOrderRouter = (container) => {
  const router = Router();
  const orderService = container.resolve('orderService');
  const {
    createOrder,
    getUserOrders,
    getOrder,
    uploadPaymentProof,
    requestRefund,
    processRefund,
    getAllOrders,
    approvePayment,
    rejectPayment,
    updateOrderStatus,
    deliverOrder,
    confirmDelivery,
    adminRequestRefund,
    submitRefundDetail,
    getStats,
    getChartData,
    cancelOrder,
  } = makeOrderController({ orderService });

  router.use(requireAuth);

  // Admin routes - must come before /:id routes
  router.get('/admin/stats', requireAdmin, getStats);
  router.get('/admin/chart-data', requireAdmin, getChartData);
  router.get('/admin', requireAdmin, validateQuery(orderQuerySchema), getAllOrders);
  router.get('/admin/all', requireAdmin, validateQuery(orderQuerySchema), getAllOrders);
  router.patch('/admin/:id/approve-payment', requireAdmin, approvePayment);
  router.patch('/admin/:id/reject-payment', requireAdmin, rejectPayment);
  router.patch('/admin/:id/status', requireAdmin, validate(updateStatusSchema), updateOrderStatus);
  router.patch('/admin/:id/process-refund', requireAdmin, uploadImages('proofs'), processRefund);
  router.patch('/admin/:id/deliver', requireAdmin, uploadImages('proofs'), deliverOrder);
  router.post('/admin/:id/request-refund', requireAdmin, adminRequestRefund);

  // User routes
  router.post('/', validate(createOrderSchema), createOrder);
  router.get('/', validateQuery(orderQuerySchema), getUserOrders);
  router.get('/:id', getOrder);
  router.patch('/:id/cancel', cancelOrder);
  router.post('/:id/payment-proofs', uploadImages('proofs'), uploadPaymentProof);
  router.post('/:id/confirm-delivery', confirmDelivery);
  router.post('/:id/refund-detail', submitRefundDetail);
  router.post(
    '/:id/refund',
    uploadImages('images'),
    (req, res, next) => {
      const result = refundSchema.safeParse(req.body);
      if (!result.success) {
        const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ success: false, error: message });
      }
      req.body = result.data;
      next();
    },
    requestRefund
  );

  return router;
};
