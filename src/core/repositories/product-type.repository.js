export const makeProductTypeRepository = ({ prisma }) => {
  const findAll = async () => {
    return prisma.productType.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] });
  };

  const findActive = async () => {
    return prisma.productType.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  };

  const findById = async (id) => {
    return prisma.productType.findUnique({ where: { id } });
  };

  const findBySlug = async (slug) => {
    return prisma.productType.findUnique({ where: { slug } });
  };

  const create = async (data) => {
    return prisma.productType.create({ data });
  };

  const update = async (id, data) => {
    return prisma.productType.update({ where: { id }, data });
  };

  const remove = async (id) => {
    return prisma.productType.delete({ where: { id } });
  };

  return { findAll, findActive, findById, findBySlug, create, update, remove };
};
