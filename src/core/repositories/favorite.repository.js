export const makeFavoriteRepository = ({ prisma }) => {
  const toggle = async (userId, productId) => {
    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }
    await prisma.favorite.create({ data: { userId, productId } });
    return { favorited: true };
  };

  const findByUser = (userId) =>
    prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { variants: true, category: true, origin: true } } },
      orderBy: { createdAt: 'desc' },
    });

  const isFavorited = async (userId, productId) => {
    const fav = await prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!fav;
  };

  const countByProduct = (productId) => prisma.favorite.count({ where: { productId } });

  return { toggle, findByUser, isFavorited, countByProduct };
};
