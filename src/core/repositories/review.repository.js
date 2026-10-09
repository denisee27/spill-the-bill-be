export const makeReviewRepository = ({ prisma }) => {
  const upsert = (userId, productId, data) =>
    prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      update: { ...data, updatedAt: new Date() },
      create: { userId, productId, ...data },
      include: { user: { select: { id: true, name: true } } },
    });

  const findByProduct = (productId) =>
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

  const findByUser = (userId) =>
    prisma.review.findMany({
      where: { userId },
      include: { product: { select: { id: true, name: true, images: true } } },
      orderBy: { createdAt: 'desc' },
    });

  const remove = (userId, productId) =>
    prisma.review.delete({ where: { userId_productId: { userId, productId } } });

  const avgRating = async (productId) => {
    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { avg: agg._avg.rating || 0, count: agg._count.rating };
  };

  return { upsert, findByProduct, findByUser, remove, avgRating };
};
