import { NotFoundError, ForbiddenError } from '../errors/http-errors.js';

export const makeAddressService = ({ addressRepository }) => {
  const listAddresses = async (userId) => {
    return addressRepository.findByUserId(userId);
  };

  const createAddress = async (userId, data) => {
    const addresses = await addressRepository.findByUserId(userId);
    const isFirstAddress = addresses.length === 0;

    if (data.isDefault || isFirstAddress) {
      await addressRepository.clearDefault(userId);
    }

    return addressRepository.create({
      ...data,
      userId,
      isDefault: data.isDefault || isFirstAddress,
    });
  };

  const updateAddress = async (userId, addressId, data) => {
    const address = await addressRepository.findById(addressId);
    if (!address) throw new NotFoundError('Address not found');
    if (address.userId !== userId) throw new ForbiddenError('Access denied');

    if (data.isDefault) {
      await addressRepository.clearDefault(userId);
    }

    return addressRepository.update(addressId, data);
  };

  const deleteAddress = async (userId, addressId) => {
    const address = await addressRepository.findById(addressId);
    if (!address) throw new NotFoundError('Address not found');
    if (address.userId !== userId) throw new ForbiddenError('Access denied');
    return addressRepository.remove(addressId);
  };

  const setDefaultAddress = async (userId, addressId) => {
    const address = await addressRepository.findById(addressId);
    if (!address) throw new NotFoundError('Address not found');
    if (address.userId !== userId) throw new ForbiddenError('Access denied');

    await addressRepository.clearDefault(userId);
    return addressRepository.setDefault(addressId);
  };

  return { listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress };
};
