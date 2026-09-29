export const makeOriginRepository = ({ prisma }) => {
  const findAll = () => prisma.origin.findMany({ orderBy: { createdAt: 'desc' } });
  const findById = (id) => prisma.origin.findUnique({ where: { id } });
  const create = (data) => prisma.origin.create({ data });
  const update = (id, data) => prisma.origin.update({ where: { id }, data });
  const remove = (id) => prisma.origin.delete({ where: { id } });
  return { findAll, findById, create, update, remove };
};
