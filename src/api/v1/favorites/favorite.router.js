import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';

export const makeFavoriteRouter = (container) => {
  const router = Router();
  const favoriteRepository = container.resolve('favoriteRepository');

  const parseImages = (product) => {
    if (!product) return product;
    try {
      return { ...product, images: JSON.parse(product.images) };
    } catch {
      return { ...product, images: [] };
    }
  };

  router.post('/:productId/toggle', requireAuth, async (req, res, next) => {
    try {
      const result = await favoriteRepository.toggle(req.user.id, req.params.productId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  });

  router.get('/my', requireAuth, async (req, res, next) => {
    try {
      const favorites = await favoriteRepository.findByUser(req.user.id);
      res.json({
        success: true,
        data: favorites.map((f) => ({ ...f, product: parseImages(f.product) })),
      });
    } catch (err) { next(err); }
  });

  router.get('/:productId/status', requireAuth, async (req, res, next) => {
    try {
      const favorited = await favoriteRepository.isFavorited(req.user.id, req.params.productId);
      res.json({ success: true, data: { favorited } });
    } catch (err) { next(err); }
  });

  return router;
};
