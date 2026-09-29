export const makeCartRepository = ({ prisma }) => {
  const findByUserId = async (userId) => {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { variants: true } },
            variant: true,
          },
        },
      },
    });
  };

  const findOrCreate = async (userId) => {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    return cart;
  };

  const findItemById = async (itemId) => {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
  };

  const findItemByProductAndVariant = async (cartId, productId, variantId) => {
    return prisma.cartItem.findFirst({
      where: { cartId, productId, variantId: variantId ?? null },
    });
  };

  const addItem = async (cartId, productId, variantId, quantity) => {
    return prisma.cartItem.create({
      data: { cartId, productId, variantId: variantId ?? null, quantity },
    });
  };

  const updateItemQuantity = async (itemId, quantity) => {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  };

  const removeItem = async (itemId) => {
    return prisma.cartItem.delete({ where: { id: itemId } });
  };

  const clearCart = async (cartId) => {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  };

  return {
    findByUserId,
    findOrCreate,
    findItemById,
    findItemByProductAndVariant,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
  };
};
