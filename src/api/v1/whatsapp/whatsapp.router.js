import { Router } from 'express';
import { makeWhatsappController } from './whatsapp.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { updateWhatsappSchema } from './whatsapp.validator.js';

export const makeWhatsappRouter = (container) => {
  const router = Router();
  const whatsappService = container.resolve('whatsappService');
  const { getSettings, updateSettings } = makeWhatsappController({ whatsappService });

  router.get('/settings', getSettings);
  router.patch(
    '/settings',
    requireAuth,
    requireAdmin,
    validate(updateWhatsappSchema),
    updateSettings
  );

  return router;
};
