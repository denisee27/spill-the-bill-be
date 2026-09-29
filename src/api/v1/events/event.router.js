import { Router } from 'express';
import { makeEventController } from './event.controller.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { uploadSingle } from '../../middleware/handle-upload.js';

export const makeEventRouter = (container) => {
  const router = Router();
  const eventService = container.resolve('eventService');
  const { list, listAdmin, getOne, create, update, remove, addProducts, removeProduct } = makeEventController({ eventService });

  // Public routes (active + non-expired only)
  router.get('/', list);
  router.get('/:id', getOne);

  // Admin-only routes
  router.get('/admin/all', requireAuth, requireAdmin, listAdmin);
  router.post('/', requireAuth, requireAdmin, uploadSingle('banner'), create);
  router.patch('/:id', requireAuth, requireAdmin, uploadSingle('banner'), update);
  router.delete('/:id', requireAuth, requireAdmin, remove);
  router.post('/:id/products', requireAuth, requireAdmin, addProducts);
  router.delete('/:id/products/:productId', requireAuth, requireAdmin, removeProduct);

  return router;
};
