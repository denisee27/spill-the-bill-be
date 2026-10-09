import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';

export const makeShippingRouter = (container) => {
  const router = Router();
  const shippingService = container.resolve('shippingService');

  // POST /cost-by-name — resolve city names → subdistrict IDs → calculate cost
  router.post('/cost-by-name', requireAuth, async (req, res, next) => {
    try {
      const { originCity, destinationCity, weight, couriers } = req.body;
      if (!originCity || !destinationCity) {
        return res.status(400).json({
          success: false,
          error: 'originCity and destinationCity are required',
        });
      }
      const result = await shippingService.getCostByCityName({
        originCity,
        destinationCity,
        weight,
        couriers,
      });
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  });

  // POST /cost — calculate by subdistrict IDs directly
  router.post('/cost', requireAuth, async (req, res, next) => {
    try {
      const { originSubdistrictId, destinationSubdistrictId, weight, couriers } = req.body;
      if (!originSubdistrictId || !destinationSubdistrictId) {
        return res.status(400).json({
          success: false,
          error: 'originSubdistrictId and destinationSubdistrictId are required',
        });
      }
      const result = await shippingService.getCost({
        originSubdistrictId,
        destinationSubdistrictId,
        weight,
        couriers,
      });
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  });

  // GET /search?q=xxx — search destination by name
  router.get('/search', requireAuth, async (req, res, next) => {
    try {
      const results = await shippingService.searchDestination(req.query.q || '', 15);
      return res.json({ success: true, data: results });
    } catch (err) { next(err); }
  });

  return router;
};
