import { Router } from 'express';
import { makeProductController } from './product.controller.js';
import { validateQuery } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { uploadAny } from '../../middleware/handle-upload.js';
import { productQuerySchema } from './product.validator.js';

export const makeProductRouter = (container) => {
  const router = Router();
  const productService = container.resolve('productService');
  const { listProducts, getFeatured, getProduct, getProductAdmin, createProduct, updateProduct, deleteProduct, updateStock, bulkSoldOut } =
    makeProductController({ productService });

  router.get('/', validateQuery(productQuerySchema), listProducts);
  router.get('/featured', getFeatured);
  router.patch('/bulk-soldout', requireAuth, requireAdmin, bulkSoldOut);
  router.get('/admin/:id', requireAuth, requireAdmin, getProductAdmin);
  router.get('/:id', getProduct);
  router.post('/', requireAuth, requireAdmin, uploadAny(), createProduct);
  router.patch('/:id/stock', requireAuth, requireAdmin, updateStock);
  router.patch('/:id', requireAuth, requireAdmin, uploadAny(), updateProduct);
  router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

  return router;
};
