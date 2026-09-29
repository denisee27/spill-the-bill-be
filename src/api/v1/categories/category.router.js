import { Router } from 'express';
import { makeCategoryController } from './category.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { createCategorySchema, updateCategorySchema } from './category.validator.js';

export const makeCategoryRouter = (container) => {
  const router = Router();
  const categoryService = container.resolve('categoryService');
  const { listCategories, createCategory, updateCategory, deleteCategory } =
    makeCategoryController({ categoryService });

  router.get('/', listCategories);
  router.post('/', requireAuth, requireAdmin, validate(createCategorySchema), createCategory);
  router.patch('/:id', requireAuth, requireAdmin, validate(updateCategorySchema), updateCategory);
  router.delete('/:id', requireAuth, requireAdmin, deleteCategory);

  return router;
};
