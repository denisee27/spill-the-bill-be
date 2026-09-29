import { Router } from 'express';
import { makeAddressController } from './address.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { createAddressSchema, updateAddressSchema } from './address.validator.js';

export const makeAddressRouter = (container) => {
  const router = Router();
  const addressService = container.resolve('addressService');
  const { listAddresses, createAddress, updateAddress, deleteAddress, setDefault } =
    makeAddressController({ addressService });

  router.use(requireAuth);

  router.get('/', listAddresses);
  router.post('/', validate(createAddressSchema), createAddress);
  router.patch('/:id', validate(updateAddressSchema), updateAddress);
  router.delete('/:id', deleteAddress);
  router.patch('/:id/default', setDefault);

  return router;
};
