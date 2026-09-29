export const makeProductRepository = ({ prisma }) => {
  const findAll = async ({ type, categoryId, search, page = 1, limit = 20, isActive = true } = {}) => {
    const skip = (page - 1) * limit;
    const now = new Date();

    const eventVisibilityFilter = {
      OR: [
        { eventProducts: { none: {} } },
        {
          eventProducts: {
            some: {
              event: {
                status: 'ACTIVE',
                OR: [{ endDate: null }, { endDate: { gt: now } }],
              },
            },
          },
        },
      ],
    };

    const conditions = [{ isActive }, eventVisibilityFilter];
    if (type) conditions.push({ type });
    if (categoryId) conditions.push({ categoryId });
    if (search) {
      conditions.push({ OR: [{ name: { contains: search } }, { description: { contains: search } }] });
    }

    const where = { AND: conditions };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { variants: true, category: true, origin: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  };

  const findFeatured = async () => {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { variants: true, category: true, origin: true },
    });
  };

  const findById = async (id) => {
    return prisma.product.findUnique({
      where: { id },
      include: { variants: true, category: true, origin: true },
    });
  };

  const findBySlug = async (slug) => {
    return prisma.product.findUnique({
      where: { slug },
      include: { variants: true, category: true, origin: true },
    });
  };

  const create = async (data) => {
    return prisma.product.create({
      data,
      include: { variants: true, category: true, origin: true },
    });
  };

  const update = async (id, data) => {
    return prisma.product.update({
      where: { id },
      data,
      include: { variants: true, category: true, origin: true },
    });
  };

  const softDelete = async (id) => {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  };

  const decrementStock = async (id, quantity) => {
    return prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  };

  const decrementVariantStock = async (variantId, quantity) => {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { decrement: quantity } },
    });
  };

  const incrementStock = async (id, quantity) => {
    return prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  };

  const incrementVariantStock = async (variantId, quantity) => {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: quantity } },
    });
  };

  const updateStock = (id, stock) =>
    prisma.product.update({
      where: { id },
      data: { stock: Number(stock) },
      include: { variants: true, category: true, origin: true },
    });

  const bulkSoldOut = (ids) =>
    prisma.product.updateMany({ where: { id: { in: ids } }, data: { isSoldOut: true } });

  const bulkSoldIn = (ids) =>
    prisma.product.updateMany({ where: { id: { in: ids } }, data: { isSoldOut: false } });

  return { findAll, findFeatured, findById, findBySlug, create, update, softDelete, decrementStock, decrementVariantStock, incrementStock, incrementVariantStock, updateStock, bulkSoldOut, bulkSoldIn };
};
