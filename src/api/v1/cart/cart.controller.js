export const makeCartController = ({ cartService }) => {
  const getCart = async (req, res, next) => {
    try {
      const cart = await cartService.getCart(req.user.id);
      return res.status(200).json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  };

  const addItem = async (req, res, next) => {
    try {
      const item = await cartService.addItem(req.user.id, req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  const updateItem = async (req, res, next) => {
    try {
      const result = await cartService.updateItem(req.user.id, req.params.itemId, req.body);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const removeItem = async (req, res, next) => {
    try {
      await cartService.removeItem(req.user.id, req.params.itemId);
      return res.status(200).json({ success: true, data: { message: 'Item removed' } });
    } catch (err) {
      next(err);
    }
  };

  const clearCart = async (req, res, next) => {
    try {
      await cartService.clearCart(req.user.id);
      return res.status(200).json({ success: true, data: { message: 'Cart cleared' } });
    } catch (err) {
      next(err);
    }
  };

  return { getCart, addItem, updateItem, removeItem, clearCart };
};
