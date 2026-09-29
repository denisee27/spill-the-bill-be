export const makeAddressRepository = ({ prisma }) => {
  const findByUserId = async (userId) => {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    });
  };

  const findById = async (id) => {
    return prisma.address.findUnique({ where: { id } });
  };

  const create = async (data) => {
    return prisma.address.create({ data });
  };

  const update = async (id, data) => {
    return prisma.address.update({ where: { id }, data });
  };

  const remove = async (id) => {
    return prisma.address.delete({ where: { id } });
  };

  const clearDefault = async (userId) => {
    return prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  };

  const setDefault = async (id) => {
    return prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  };

  return { findByUserId, findById, create, update, remove, clearDefault, setDefault };
};
