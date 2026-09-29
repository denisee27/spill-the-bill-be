import { NotFoundError, BadRequestError, ConflictError } from '../errors/http-errors.js';

export const makeVoucherService = ({ voucherRepository }) => {
  const validateVoucher = async (code, cartSubtotal) => {
    const voucher = await voucherRepository.findByCode(code);
    if (!voucher || !voucher.isActive) throw new NotFoundError('Voucher not found or inactive');

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      throw new BadRequestError('Voucher has expired');
    }

    if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
      throw new BadRequestError('Voucher usage limit reached');
    }

    if (cartSubtotal !== undefined && cartSubtotal < voucher.minOrderAmount) {
      throw new BadRequestError(
        `Minimum order amount for this voucher is Rp${voucher.minOrderAmount.toLocaleString()}`
      );
    }

    let discountAmount = 0;
    if (cartSubtotal !== undefined) {
      if (voucher.type === 'PERCENTAGE') {
        discountAmount = (cartSubtotal * voucher.value) / 100;
      } else {
        discountAmount = Math.min(voucher.value, cartSubtotal);
      }
    }

    return { voucher, discountAmount };
  };

  const listVouchers = async (filters) => {
    return voucherRepository.findAll(filters);
  };

  const createVoucher = async (data) => {
    const existing = await voucherRepository.findByCode(data.code);
    if (existing) throw new ConflictError('Voucher code already exists');
    return voucherRepository.create(data);
  };

  const updateVoucher = async (id, data) => {
    const existing = await voucherRepository.findById(id);
    if (!existing) throw new NotFoundError('Voucher not found');

    if (data.code && data.code !== existing.code) {
      const dup = await voucherRepository.findByCode(data.code);
      if (dup) throw new ConflictError('Voucher code already exists');
    }

    return voucherRepository.update(id, data);
  };

  const deleteVoucher = async (id) => {
    const existing = await voucherRepository.findById(id);
    if (!existing) throw new NotFoundError('Voucher not found');
    return voucherRepository.remove(id);
  };

  const getVoucherUsage = async (id) => {
    const existing = await voucherRepository.findById(id);
    if (!existing) throw new NotFoundError('Voucher not found');
    return voucherRepository.getUsage(id);
  };

  return { validateVoucher, listVouchers, createVoucher, updateVoucher, deleteVoucher, getVoucherUsage };
};
