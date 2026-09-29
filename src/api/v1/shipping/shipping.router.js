import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';

export const makeShippingRouter = (container) => {
  const router = Router();
  const shippingService = container.resolve('shippingService');

  router.post('/cost', requireAuth, async (req, res, next) => {
    try {
      const { originCityId, destinationCityId, weight, couriers } = req.body;
      if (!originCityId || !destinationCityId) {
        return res.status(400).json({ success: false, error: 'originCityId and destinationCityId are required' });
      }
      const result = await shippingService.getCost({ originCityId, destinationCityId, weight, couriers });
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  });

  router.get('/cities', requireAuth, async (req, res, next) => {
    try {
      const cities = await shippingService.searchCity(req.query.name || '');
      return res.json({ success: true, data: cities });
    } catch (err) { next(err); }
  });

  return router;
};
