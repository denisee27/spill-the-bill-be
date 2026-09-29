import { Router } from 'express';
import { makePortfolioController } from './portfolio.controller.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { uploadImages } from '../../middleware/handle-upload.js';

export const makePortfolioRouter = (container) => {
  const router = Router();
  const portfolioService = container.resolve('portfolioService');
  const { listPortfolios, createPortfolio, updatePortfolio, deletePortfolio } =
    makePortfolioController({ portfolioService });

  router.get('/', listPortfolios);
  router.post('/', requireAuth, requireAdmin, uploadImages('images'), createPortfolio);
  router.patch('/:id', requireAuth, requireAdmin, uploadImages('images'), updatePortfolio);
  router.delete('/:id', requireAuth, requireAdmin, deletePortfolio);

  return router;
};
