export const makeVoucherController = ({ voucherService }) => {
  const validateVoucher = async (req, res, next) => {
    try {
      const { code, subtotal } = req.query;
      if (!code) {
        return res.status(400).json({ success: false, error: 'Voucher code is required' });
      }
      const result = await voucherService.validateVoucher(code, subtotal ? Number(subtotal) : undefined);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const listVouchers = async (req, res, next) => {
    try {
      const result = await voucherService.listVouchers(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const createVoucher = async (req, res, next) => {
    try {
      const voucher = await voucherService.createVoucher(req.body);
      return res.status(201).json({ success: true, data: voucher });
    } catch (err) {
      next(err);
    }
  };

  const updateVoucher = async (req, res, next) => {
    try {
      const voucher = await voucherService.updateVoucher(req.params.id, req.body);
      return res.status(200).json({ success: true, data: voucher });
    } catch (err) {
      next(err);
    }
  };

  const deleteVoucher = async (req, res, next) => {
    try {
      await voucherService.deleteVoucher(req.params.id);
      return res.status(200).json({ success: true, data: { message: 'Voucher deleted' } });
    } catch (err) {
      next(err);
    }
  };

  const getUsage = async (req, res, next) => {
    try {
      const usages = await voucherService.getVoucherUsage(req.params.id);
      return res.status(200).json({ success: true, data: usages });
    } catch (err) {
      next(err);
    }
  };

  return { validateVoucher, listVouchers, createVoucher, updateVoucher, deleteVoucher, getUsage };
};
