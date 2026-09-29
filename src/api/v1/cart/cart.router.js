import { Router } from 'express';
import { makeCartController } from './cart.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { addItemSchema, updateItemSchema } from './cart.validator.js';

export const makeCartRouter = (container) => {
  const router = Router();
  const cartService = container.resolve('cartService');
  const { getCart, addItem, updateItem, removeItem, clearCart } = makeCartController({ cartService });

  router.use(requireAuth);

  router.get('/', getCart);
  router.post('/items', validate(addItemSchema), addItem);
  router.patch('/items/:itemId', validate(updateItemSchema), updateItem);
  router.delete('/items/:itemId', removeItem);
  router.delete('/', clearCart);

  return router;
};
