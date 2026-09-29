export const makePortfolioController = ({ portfolioService }) => {
  const listPortfolios = async (req, res, next) => {
    try {
      const portfolios = await portfolioService.listPortfolios({ isActive: true });
      return res.status(200).json({ success: true, data: portfolios });
    } catch (err) {
      next(err);
    }
  };

  const createPortfolio = async (req, res, next) => {
    try {
      const filenames = req.files ? req.files.map((f) => f.filename) : [];
      const portfolio = await portfolioService.createPortfolio({
        ...req.body,
        images: filenames,
      });
      return res.status(201).json({ success: true, data: portfolio });
    } catch (err) {
      next(err);
    }
  };

  const updatePortfolio = async (req, res, next) => {
    try {
      const filenames = req.files && req.files.length > 0
        ? req.files.map((f) => f.filename)
        : undefined;

      const portfolio = await portfolioService.updatePortfolio(req.params.id, {
        ...req.body,
        ...(filenames !== undefined && { images: filenames }),
      });
      return res.status(200).json({ success: true, data: portfolio });
    } catch (err) {
      next(err);
    }
  };

  const deletePortfolio = async (req, res, next) => {
    try {
      await portfolioService.deletePortfolio(req.params.id);
      return res.status(200).json({ success: true, data: { message: 'Portfolio deleted' } });
    } catch (err) {
      next(err);
    }
  };

  return { listPortfolios, createPortfolio, updatePortfolio, deletePortfolio };
};
