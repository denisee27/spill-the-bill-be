import { Router } from 'express';
import { makeMemberController } from './member.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { updateMemberSettingsSchema } from './member.validator.js';

export const makeMemberRouter = (container) => {
  const router = Router();
  const memberService = container.resolve('memberService');
  const { getSettings, updateSettings, listMembers, getMemberProgress } = makeMemberController({ memberService });

  router.get('/my-progress', requireAuth, getMemberProgress);

  router.get('/settings', requireAuth, requireAdmin, getSettings);
  router.patch(
    '/settings',
    requireAuth,
    requireAdmin,
    validate(updateMemberSettingsSchema),
    updateSettings
  );
  router.get('/list', requireAuth, requireAdmin, listMembers);

  return router;
};
