export const makeAddressController = ({ addressService, userRepository }) => {
  const listAddresses = async (req, res, next) => {
    try {
      const addresses = await addressService.listAddresses(req.user.id);
      return res.status(200).json({ success: true, data: addresses });
    } catch (err) {
      next(err);
    }
  };

  const createAddress = async (req, res, next) => {
    try {
      const user = await userRepository.findById(req.user.id);
      const address = await addressService.createAddress(req.user.id, {
        ...req.body,
        phone: user?.phone || '',
      });
      return res.status(201).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  };

  const updateAddress = async (req, res, next) => {
    try {
      const user = await userRepository.findById(req.user.id);
      const address = await addressService.updateAddress(req.user.id, req.params.id, {
        ...req.body,
        phone: user?.phone || '',
      });
      return res.status(200).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  };

  const deleteAddress = async (req, res, next) => {
    try {
      await addressService.deleteAddress(req.user.id, req.params.id);
      return res.status(200).json({ success: true, data: { message: 'Address deleted' } });
    } catch (err) {
      next(err);
    }
  };

  const setDefault = async (req, res, next) => {
    try {
      const address = await addressService.setDefaultAddress(req.user.id, req.params.id);
      return res.status(200).json({ success: true, data: address });
    } catch (err) {
      next(err);
    }
  };

  return { listAddresses, createAddress, updateAddress, deleteAddress, setDefault };
};
