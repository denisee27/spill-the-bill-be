export const makePortfolioRepository = ({ prisma }) => {
  const findAll = async ({ isActive = true } = {}) => {
    const where = {};
    if (isActive !== undefined) where.isActive = isActive;
    return prisma.portfolio.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  };

  const findById = async (id) => {
    return prisma.portfolio.findUnique({ where: { id } });
  };

  const create = async (data) => {
    return prisma.portfolio.create({ data });
  };

  const update = async (id, data) => {
    return prisma.portfolio.update({ where: { id }, data });
  };

  const remove = async (id) => {
    return prisma.portfolio.delete({ where: { id } });
  };

  return { findAll, findById, create, update, remove };
};
