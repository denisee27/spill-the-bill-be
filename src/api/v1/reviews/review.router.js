import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/require-auth.js';
import { uploadImages } from '../../middleware/handle-upload.js';
import { BadRequestError } from '../../../core/errors/http-errors.js';

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const makeReviewRouter = (container) => {
  const router = Router();
  const reviewRepository = container.resolve('reviewRepository');

  router.get('/product/:productId', async (req, res, next) => {
    try {
      const [reviews, stats] = await Promise.all([
        reviewRepository.findByProduct(req.params.productId),
        reviewRepository.avgRating(req.params.productId),
      ]);
      res.json({ success: true, data: { reviews, ...stats } });
    } catch (err) { next(err); }
  });

  router.get('/product/:productId/mine', requireAuth, async (req, res, next) => {
    try {
      const review = await reviewRepository.findByUserAndProduct(req.user.id, req.params.productId);
      res.json({ success: true, data: review ?? null });
    } catch (err) { next(err); }
  });

  router.post('/product/:productId', requireAuth, uploadImages('media', 10), async (req, res, next) => {
    try {
      const parsed = reviewSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);

      const mediaUrls = (req.files || []).map((f) => f.filename).filter(Boolean);
      const review = await reviewRepository.upsert(req.user.id, req.params.productId, {
        ...parsed.data,
        media: JSON.stringify(mediaUrls),
      });
      res.status(201).json({ success: true, data: review });
    } catch (err) { next(err); }
  });

  router.delete('/product/:productId', requireAuth, async (req, res, next) => {
    try {
      await reviewRepository.remove(req.user.id, req.params.productId);
      res.json({ success: true, data: { message: 'Review deleted' } });
    } catch (err) { next(err); }
  });

  return router;
};
