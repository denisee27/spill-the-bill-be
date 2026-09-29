export const makeCategoryController = ({ categoryService }) => {
  const listCategories = async (req, res, next) => {
    try {
      const categories = await categoryService.listCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  };

  const createCategory = async (req, res, next) => {
    try {
      const category = await categoryService.createCategory(req.body);
      return res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  };

  const updateCategory = async (req, res, next) => {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      return res.status(200).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  };

  const deleteCategory = async (req, res, next) => {
    try {
      await categoryService.deleteCategory(req.params.id);
      return res.status(200).json({ success: true, data: { message: 'Category deleted' } });
    } catch (err) {
      next(err);
    }
  };

  return { listCategories, createCategory, updateCategory, deleteCategory };
};
