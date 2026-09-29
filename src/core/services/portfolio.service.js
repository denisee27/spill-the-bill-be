import { NotFoundError } from '../errors/http-errors.js';

const parseImages = (portfolio) => {
  if (!portfolio) return portfolio;
  return {
    ...portfolio,
    images: (() => {
      try {
        return JSON.parse(portfolio.images);
      } catch {
        return [];
      }
    })(),
  };
};

export const makePortfolioService = ({ portfolioRepository }) => {
  const listPortfolios = async (options = {}) => {
    const portfolios = await portfolioRepository.findAll(options);
    return portfolios.map(parseImages);
  };

  const createPortfolio = async ({ images = [], ...data }) => {
    const portfolio = await portfolioRepository.create({
      ...data,
      images: JSON.stringify(images),
    });
    return parseImages(portfolio);
  };

  const updatePortfolio = async (id, { images, ...data }) => {
    const existing = await portfolioRepository.findById(id);
    if (!existing) throw new NotFoundError('Portfolio not found');

    const updateData = { ...data };
    if (images !== undefined) updateData.images = JSON.stringify(images);

    const portfolio = await portfolioRepository.update(id, updateData);
    return parseImages(portfolio);
  };

  const deletePortfolio = async (id) => {
    const existing = await portfolioRepository.findById(id);
    if (!existing) throw new NotFoundError('Portfolio not found');
    return portfolioRepository.remove(id);
  };

  return { listPortfolios, createPortfolio, updatePortfolio, deletePortfolio };
};
