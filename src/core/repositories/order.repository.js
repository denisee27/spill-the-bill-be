export const makeOrderRepository = ({ prisma }) => {
  const create = async (data) => {
    return prisma.order.create({
      data,
      include: {
        items: true,
        address: true,
        paymentProofs: true,
      },
    });
  };

  const findByUserId = async (userId, { page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: true,
          address: true,
          paymentProofs: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { orders, total, page, limit };
  };

  const findById = async (id) => {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        address: true,
        paymentProofs: true,
        refundRequest: { include: { images: true } },
        refundDetail: true,
      },
    });
  };

  const findAll = async ({ status, search, dateFrom, dateTo, page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: true,
          address: true,
          paymentProofs: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, total, page, limit };
  };

  const updateStatus = async (id, status) => {
    return prisma.order.update({ where: { id }, data: { status } });
  };

  const updateRejection = async (id, rejectionNotes) => {
    return prisma.order.update({
      where: { id },
      data: { status: 'PAYMENT_REJECTED', rejectionNotes: rejectionNotes ?? null },
    });
  };

  const addPaymentProof = async (orderId, imageUrl) => {
    return prisma.paymentProof.create({ data: { orderId, imageUrl } });
  };

  const createRefundRequest = async (orderId, reason, images) => {
    return prisma.refundRequest.create({
      data: {
        orderId,
        reason,
        images: {
          create: images.map((imageUrl) => ({ imageUrl })),
        },
      },
      include: { images: true },
    });
  };

  const findRefundByOrderId = async (orderId) => {
    return prisma.refundRequest.findUnique({ where: { orderId } });
  };

  const approveRefund = async (orderId, { adminNotes, adminProofImages }) => {
    return prisma.refundRequest.update({
      where: { orderId },
      data: {
        status: 'APPROVED',
        adminNotes: adminNotes || null,
        adminProofImages: JSON.stringify(adminProofImages || []),
      },
      include: { images: true },
    });
  };

  const updateWithDeliveryProof = async (id, { notes, filenames, estimatedDeliveryDate }) => {
    return prisma.order.update({
      where: { id },
      data: {
        status: 'SHIPPED',
        deliveryProofImages: JSON.stringify(filenames || []),
        deliveryNotes: notes || null,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
      },
    });
  };

  const confirmDelivery = async (id) => {
    return prisma.order.update({
      where: { id },
      data: { status: 'DELIVERED' },
    });
  };

  const createRefundDetail = async (orderId, data) => {
    return prisma.refundDetail.create({ data: { orderId, ...data } });
  };

  const findRefundDetailByOrderId = async (orderId) => {
    return prisma.refundDetail.findUnique({ where: { orderId } });
  };

  const findExpiredPendingOrders = async (cutoffDate) => {
    return prisma.order.findMany({
      where: { status: 'PENDING_PAYMENT', createdAt: { lt: cutoffDate } },
      include: { items: true },
    });
  };

  const buildDateWhere = (startDate, endDate) => {
    if (!startDate && !endDate) return {};
    const createdAt = {};
    if (startDate) createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    return { createdAt };
  };

  const countAll = async ({ startDate, endDate } = {}) =>
    prisma.order.count({ where: buildDateWhere(startDate, endDate) });

  const sumRevenue = async ({ startDate, endDate } = {}) => {
    const result = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['PAYMENT_APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        ...buildDateWhere(startDate, endDate),
      },
    });
    return result._sum.total ?? 0;
  };

  const countByStatus = async (status) => prisma.order.count({ where: { status } });

  const PAID_STATUSES = ['PAYMENT_APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  const getRevenueByDay = async (days = 30) => {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { in: PAID_STATUSES } },
      select: { createdAt: true, total: true },
    });

    const map = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { date: key, revenue: 0, orders: 0 };
    }
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (map[key]) { map[key].revenue += o.total; map[key].orders += 1; }
    }
    return Object.values(map);
  };

  const getStatusDistribution = async () => {
    const rows = await prisma.order.groupBy({ by: ['status'], _count: { status: true } });
    return rows.map((r) => ({ status: r.status, count: r._count.status }));
  };

  const getTopProducts = async (limit = 5) => {
    const rows = await prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
    return rows.map((r) => ({ name: r.productName, qty: r._sum.quantity ?? 0 }));
  };

  const getTypeRevenue = async () => {
    const items = await prisma.orderItem.findMany({
      where: { order: { status: { in: PAID_STATUSES } } },
      include: { product: { select: { type: true } } },
    });
    const acc = {};
    for (const item of items) {
      const type = item.product?.type ?? 'OTHER';
      acc[type] = (acc[type] ?? 0) + item.price * item.quantity;
    }
    return Object.entries(acc).map(([type, revenue]) => ({ type, revenue }));
  };

  return {
    create,
    findByUserId,
    findById,
    findAll,
    updateStatus,
    updateRejection,
    updateWithDeliveryProof,
    confirmDelivery,
    addPaymentProof,
    createRefundRequest,
    approveRefund,
    findRefundByOrderId,
    createRefundDetail,
    findRefundDetailByOrderId,
    countAll,
    sumRevenue,
    countByStatus,
    getRevenueByDay,
    getStatusDistribution,
    getTopProducts,
    getTypeRevenue,
    findExpiredPendingOrders,
  };
};
