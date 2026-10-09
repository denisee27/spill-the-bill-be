export const makeProductRepository = ({ prisma }) => {
  const findAll = async ({ type, categoryId, categoryIds, search, minPrice, maxPrice, condition, inStock, isFeatured, sortBy, page = 1, limit = 20, status, adminMode = false } = {}) => {
    const skip = (page - 1) * limit;
    const conditions = adminMode ? [] : [{ status: status || 'ACTIVE' }];
    if (!adminMode && status) conditions[0] = { status };
    if (type) conditions.push({ type });
    if (categoryIds) {
      conditions.push({ categoryId: { in: categoryIds.split(',').filter(Boolean) } });
    } else if (categoryId) {
      conditions.push({ categoryId });
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      conditions.push({
        price: {
          ...(minPrice !== undefined ? { gte: parseFloat(minPrice) } : {}),
          ...(maxPrice !== undefined ? { lte: parseFloat(maxPrice) } : {}),
        },
      });
    }
    if (condition) conditions.push({ condition });
    if (inStock) conditions.push({ stock: { gt: 0 } });
    if (isFeatured) conditions.push({ isFeatured: true });
    if (search) {
      conditions.push({ OR: [{ name: { contains: search } }, { description: { contains: search } }] });
    }

    const orderByMap = {
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      newest: { createdAt: 'desc' },
      name_asc: { name: 'asc' },
    };
    const orderBy = orderByMap[sortBy] || { createdAt: 'desc' };
    const where = { AND: conditions };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { variants: true, category: true, origin: true },
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  };

  const findFeatured = async () => {
    return prisma.product.findMany({
      where: { isFeatured: true, status: 'ACTIVE' },
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
      data: { status: 'INACTIVE' },
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

  const searchSuggestions = async (q) =>
    prisma.product.findMany({
      where: { status: 'ACTIVE', name: { contains: q, mode: 'insensitive' } },
      select: { id: true, name: true, price: true, type: true, slug: true, images: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

  const incrementViewCount = (id) =>
    prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  return { findAll, findFeatured, findById, findBySlug, create, update, softDelete, decrementStock, decrementVariantStock, incrementStock, incrementVariantStock, updateStock, bulkSoldOut, bulkSoldIn, searchSuggestions, incrementViewCount };
};
