export const makeOriginController = ({ originService }) => {
  const list = async (req, res, next) => {
    try {
      const origins = await originService.listOrigins();
      return res.json({ success: true, data: origins });
    } catch (err) { next(err); }
  };

  const create = async (req, res, next) => {
    try {
      const origin = await originService.createOrigin(req.body);
      return res.status(201).json({ success: true, data: origin });
    } catch (err) { next(err); }
  };

  const update = async (req, res, next) => {
    try {
      const origin = await originService.updateOrigin(req.params.id, req.body);
      return res.json({ success: true, data: origin });
    } catch (err) { next(err); }
  };

  const remove = async (req, res, next) => {
    try {
      await originService.deleteOrigin(req.params.id);
      return res.json({ success: true, data: { message: 'Origin deleted' } });
    } catch (err) { next(err); }
  };

  return { list, create, update, remove };
};
