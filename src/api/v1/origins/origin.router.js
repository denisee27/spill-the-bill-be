import { Router } from 'express';
import { makeOriginController } from './origin.controller.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';

export const makeOriginRouter = (container) => {
  const router = Router();
  const originService = container.resolve('originService');
  const { list, create, update, remove } = makeOriginController({ originService });

  router.get('/', list);
  router.post('/', requireAuth, requireAdmin, create);
  router.patch('/:id', requireAuth, requireAdmin, update);
  router.delete('/:id', requireAuth, requireAdmin, remove);

  return router;
};
