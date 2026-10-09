export const makeProductTypeController = ({ productTypeService }) => {
  const listTypes = async (req, res, next) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const types = await productTypeService.listTypes({ includeInactive });
      return res.status(200).json({ success: true, data: types });
    } catch (err) {
      next(err);
    }
  };

  const createType = async (req, res, next) => {
    try {
      const type = await productTypeService.createType(req.body);
      return res.status(201).json({ success: true, data: type });
    } catch (err) {
      next(err);
    }
  };

  const updateType = async (req, res, next) => {
    try {
      const type = await productTypeService.updateType(req.params.id, req.body);
      return res.status(200).json({ success: true, data: type });
    } catch (err) {
      next(err);
    }
  };

  const deleteType = async (req, res, next) => {
    try {
      await productTypeService.deleteType(req.params.id);
      return res.status(200).json({ success: true, data: { message: 'Product type deleted' } });
    } catch (err) {
      next(err);
    }
  };

  return { listTypes, createType, updateType, deleteType };
};
