export const makeCategoryRepository = ({ prisma }) => {
  const findAll = async () => {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  };

  const findById = async (id) => {
    return prisma.category.findUnique({ where: { id } });
  };

  const findBySlug = async (slug) => {
    return prisma.category.findUnique({ where: { slug } });
  };

  const create = async (data) => {
    return prisma.category.create({ data });
  };

  const update = async (id, data) => {
    return prisma.category.update({ where: { id }, data });
  };

  const remove = async (id) => {
    return prisma.category.delete({ where: { id } });
  };

  return { findAll, findById, findBySlug, create, update, remove };
};
