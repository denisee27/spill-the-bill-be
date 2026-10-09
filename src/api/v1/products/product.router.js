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
  const { listProducts, listProductsAdmin, getFeatured, getProduct, getProductAdmin, createProduct, updateProduct, deleteProduct, updateStock, bulkSoldOut, getSearchSuggestions, duplicateProduct } =
    makeProductController({ productService });

  router.get('/', validateQuery(productQuerySchema), listProducts);
  router.get('/admin-list', requireAuth, requireAdmin, listProductsAdmin);
  router.get('/featured', getFeatured);
  router.get('/search-suggestions', getSearchSuggestions);

  // View tracking
  router.post('/:id/view', async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id ?? null;
      await Promise.all([
        productService.incrementViewCount(id),
        container.resolve('prisma').productView.create({ data: { productId: id, userId } }),
      ]);
      res.json({ success: true });
    } catch (err) { next(err); }
  });
  router.patch('/bulk-soldout', requireAuth, requireAdmin, bulkSoldOut);
  router.get('/admin/:id', requireAuth, requireAdmin, getProductAdmin);
  router.get('/:id', getProduct);
  router.post('/', requireAuth, requireAdmin, uploadAny(), createProduct);
  router.patch('/:id/stock', requireAuth, requireAdmin, updateStock);
  router.post('/:id/duplicate', requireAuth, requireAdmin, duplicateProduct);
  router.patch('/:id', requireAuth, requireAdmin, uploadAny(), updateProduct);
  router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

  return router;
};
