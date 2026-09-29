import { Router } from 'express';
import { makeUserController } from './user.controller.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { updateRoleSchema, userQuerySchema } from './user.validator.js';

export const makeUserRouter = (container) => {
  const router = Router();
  const userService = container.resolve('userService');
  const { listUsers, getUserDetail, updateRole } = makeUserController({ userService });

  router.use(requireAuth, requireAdmin);

  router.get('/', validateQuery(userQuerySchema), listUsers);
  router.get('/:id', getUserDetail);
  router.patch('/:id/role', validate(updateRoleSchema), updateRole);

  return router;
};
