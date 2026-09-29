import { NotFoundError, BadRequestError, ForbiddenError } from '../errors/http-errors.js';

const parseCartImages = (cart) => {
  if (!cart) return cart;
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: item.product
        ? {
            ...item.product,
            images: (() => {
              try {
                return JSON.parse(item.product.images);
              } catch {
                return [];
              }
            })(),
          }
        : null,
    })),
  };
};

export const makeCartService = ({ cartRepository, productRepository }) => {
  const getCart = async (userId) => {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      const newCart = await cartRepository.findOrCreate(userId);
      return { ...newCart, items: [] };
    }
    return parseCartImages(cart);
  };

  const addItem = async (userId, { productId, variantId, quantity }) => {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) throw new NotFoundError('Product not found');

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) throw new NotFoundError('Variant not found');
      if (variant.stock < quantity) throw new BadRequestError('Insufficient stock');
    } else {
      if (product.stock < quantity) throw new BadRequestError('Insufficient stock');
    }

    const cart = await cartRepository.findOrCreate(userId);

    const existingItem = await cartRepository.findItemByProductAndVariant(
      cart.id,
      productId,
      variantId
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      const stockAvail = variantId
        ? product.variants.find((v) => v.id === variantId)?.stock
        : product.stock;
      if (newQty > stockAvail) throw new BadRequestError('Insufficient stock');
      return cartRepository.updateItemQuantity(existingItem.id, newQty);
    }

    return cartRepository.addItem(cart.id, productId, variantId, quantity);
  };

  const updateItem = async (userId, itemId, { quantity }) => {
    const item = await cartRepository.findItemById(itemId);
    if (!item) throw new NotFoundError('Cart item not found');
    if (item.cart.userId !== userId) throw new ForbiddenError('Not your cart item');

    if (quantity <= 0) {
      return cartRepository.removeItem(itemId);
    }

    return cartRepository.updateItemQuantity(itemId, quantity);
  };

  const removeItem = async (userId, itemId) => {
    const item = await cartRepository.findItemById(itemId);
    if (!item) throw new NotFoundError('Cart item not found');
    if (item.cart.userId !== userId) throw new ForbiddenError('Not your cart item');
    return cartRepository.removeItem(itemId);
  };

  const clearCart = async (userId) => {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) return null;
    return cartRepository.clearCart(cart.id);
  };

  return { getCart, addItem, updateItem, removeItem, clearCart };
};
