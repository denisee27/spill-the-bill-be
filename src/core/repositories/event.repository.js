export const makeEventRepository = ({ prisma }) => {
  const include = {
    products: {
      include: {
        product: {
          include: { variants: true, category: true },
        },
      },
    },
  };

  const findAllPublic = async () => {
    return prisma.event.findMany({
      where: { status: 'ACTIVE' },
      include: { _count: { select: { products: true } } },
      orderBy: { startDate: 'asc' },
    });
  };

  const findAll = async ({ status, page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total, page, limit };
  };

  const findById = async (id) => {
    return prisma.event.findUnique({ where: { id }, include });
  };

  const create = async (data) => {
    return prisma.event.create({ data, include });
  };

  const update = async (id, data) => {
    return prisma.event.update({ where: { id }, data, include });
  };

  const remove = async (id) => {
    return prisma.event.delete({ where: { id } });
  };

  const addProducts = async (eventId, productIds) => {
    const existing = await prisma.eventProduct.findMany({
      where: { eventId, productId: { in: productIds } },
      select: { productId: true },
    });
    const existingSet = new Set(existing.map((ep) => ep.productId));
    const newIds = productIds.filter((id) => !existingSet.has(id));
    if (newIds.length > 0) {
      await prisma.eventProduct.createMany({
        data: newIds.map((productId) => ({ eventId, productId })),
      });
    }
    return findById(eventId);
  };

  const removeProduct = async (eventId, productId) => {
    await prisma.eventProduct.delete({
      where: { eventId_productId: { eventId, productId } },
    });
    return findById(eventId);
  };

  return { findAll, findAllPublic, findById, create, update, remove, addProducts, removeProduct };
};
