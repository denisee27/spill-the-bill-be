import { Router } from 'express';
import { makeProductTypeController } from './product-type.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { createProductTypeSchema, updateProductTypeSchema } from './product-type.validator.js';

export const makeProductTypeRouter = (container) => {
  const router = Router();
  const productTypeService = container.resolve('productTypeService');
  const { listTypes, createType, updateType, deleteType } =
    makeProductTypeController({ productTypeService });

  router.get('/', listTypes);
  router.post('/', requireAuth, requireAdmin, validate(createProductTypeSchema), createType);
  router.patch('/:id', requireAuth, requireAdmin, validate(updateProductTypeSchema), updateType);
  router.delete('/:id', requireAuth, requireAdmin, deleteType);

  return router;
};
