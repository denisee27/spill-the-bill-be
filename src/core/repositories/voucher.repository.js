export const makeVoucherRepository = ({ prisma }) => {
  const findAll = async ({ page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.voucher.count(),
    ]);
    return { vouchers, total, page, limit };
  };

  const findByCode = async (code) => {
    return prisma.voucher.findUnique({ where: { code } });
  };

  const findById = async (id) => {
    return prisma.voucher.findUnique({ where: { id } });
  };

  const create = async (data) => {
    return prisma.voucher.create({ data });
  };

  const update = async (id, data) => {
    return prisma.voucher.update({ where: { id }, data });
  };

  const remove = async (id) => {
    return prisma.voucher.delete({ where: { id } });
  };

  const incrementUsed = async (code) => {
    return prisma.voucher.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  };

  const recordUsage = async (voucherId, orderId, userId) => {
    return prisma.voucherUsage.create({ data: { voucherId, orderId, userId } });
  };

  const getUsage = async (voucherId) => {
    return prisma.voucherUsage.findMany({
      where: { voucherId },
      orderBy: { usedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: {
          select: {
            id: true,
            total: true,
            discountAmount: true,
            createdAt: true,
            items: { select: { productName: true, variantName: true, quantity: true, price: true } },
          },
        },
      },
    });
  };

  return { findAll, findByCode, findById, create, update, remove, incrementUsed, recordUsage, getUsage };
};
