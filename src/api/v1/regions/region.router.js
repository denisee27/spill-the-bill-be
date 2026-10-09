import { Router } from 'express';

export const makeRegionRouter = (container) => {
  const prisma = container.resolve('prisma');
  const router = Router();

  router.get('/provinces', async (_req, res, next) => {
    try {
      const provinces = await prisma.regProvince.findMany({ orderBy: { name: 'asc' } });
      return res.json({ success: true, data: provinces });
    } catch (err) { next(err); }
  });

  router.get('/regencies', async (req, res, next) => {
    try {
      const { provinceId } = req.query;
      const where = provinceId ? { provinceId } : {};
      const regencies = await prisma.regRegency.findMany({ where, orderBy: { name: 'asc' } });
      return res.json({ success: true, data: regencies });
    } catch (err) { next(err); }
  });

  router.get('/districts', async (req, res, next) => {
    try {
      const { regencyId } = req.query;
      if (!regencyId) return res.status(400).json({ success: false, error: 'regencyId required' });
      const districts = await prisma.regDistrict.findMany({ where: { regencyId }, orderBy: { name: 'asc' } });
      return res.json({ success: true, data: districts });
    } catch (err) { next(err); }
  });

  router.get('/villages', async (req, res, next) => {
    try {
      const { districtId } = req.query;
      if (!districtId) return res.status(400).json({ success: false, error: 'districtId required' });
      const villages = await prisma.regVillage.findMany({ where: { districtId }, orderBy: { name: 'asc' } });
      return res.json({ success: true, data: villages });
    } catch (err) { next(err); }
  });

  return router;
};
