import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../errors/http-errors.js';
import {
  sendOrderCreatedEmail,
  sendPaymentReceivedEmail,
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
  sendOrderDeliveredEmail,
  sendOrderShippedEmail,
  sendRefundRequestedEmail,
  sendRefundDetailSubmittedEmail,
} from '../../infra/mailer/index.js';
import { config } from '../../config/index.js';

export const makeOrderService = ({
  prisma,
  orderRepository,
  cartRepository,
  productRepository,
  voucherRepository,
  memberRepository,
  userRepository,
  addressRepository,
  notificationRepository,
}) => {
  const createOrder = async (userId, { addressId, voucherCode, notes, itemIds, cartItemIds, shippingFee: clientShippingFee, courierService }) => {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) throw new BadRequestError('Cart is empty');

    const resolvedItemIds = itemIds ?? cartItemIds;
    let selectedItems = cart.items;
    if (resolvedItemIds && resolvedItemIds.length > 0) {
      selectedItems = cart.items.filter((i) => resolvedItemIds.includes(i.id));
    }
    if (selectedItems.length === 0) throw new BadRequestError('No items selected');

    if (addressId) {
      const addr = await addressRepository.findById(addressId);
      if (!addr || addr.userId !== userId) throw new NotFoundError('Address not found');
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of selectedItems) {
      const product = await productRepository.findById(item.productId);
      if (!product || product.status !== 'ACTIVE') {
        throw new BadRequestError(`Product "${item.product?.name}" is no longer available`);
      }

      let price = product.price + (product.fee || 0);
      let variantName = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) throw new BadRequestError('Variant not found');
        if (variant.stock < item.quantity) {
          throw new BadRequestError(`Insufficient stock for "${product.name}"`);
        }
        price = variant.price + (variant.fee || 0);
        variantName = variant.name;
      } else {
        const effectiveStock = product.variants?.length > 0
          ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
          : product.stock;
        if (effectiveStock < item.quantity) {
          throw new BadRequestError(`Insufficient stock for "${product.name}"`);
        }
      }

      subtotal += price * item.quantity;
      orderItems.push({
        productId: product.id,
        variantId: item.variantId ?? null,
        productName: product.name,
        variantName,
        price,
        quantity: item.quantity,
      });
    }

    let discountAmount = 0;
    let appliedVoucherCode = null;
    let appliedVoucherId = null;

    if (voucherCode) {
      const voucher = await voucherRepository.findByCode(voucherCode);
      if (!voucher || !voucher.isActive) throw new BadRequestError('Invalid voucher code');
      if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
        throw new BadRequestError('Voucher has expired');
      }
      if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
        throw new BadRequestError('Voucher usage limit reached');
      }
      if (subtotal < voucher.minOrderAmount) {
        throw new BadRequestError(
          `Minimum order amount for this voucher is Rp${voucher.minOrderAmount.toLocaleString()}`
        );
      }

      if (voucher.type === 'PERCENTAGE') {
        discountAmount = (subtotal * voucher.value) / 100;
      } else {
        discountAmount = Math.min(voucher.value, subtotal);
      }
      appliedVoucherCode = voucher.code;
      appliedVoucherId = voucher.id;
    }

    const memberSettings = await memberRepository.getSettings();
    const user = await userRepository.findById(userId);

    // Shipping fee: validate and apply free shipping
    let shippingFee = Math.max(0, Math.min(Number(clientShippingFee) || 0, 2_000_000));
    const allProductsFreeShipping = selectedItems.every((item) => item.product?.freeShipping === true);
    if (allProductsFreeShipping) {
      shippingFee = 0;
    } else if (user?.isMember && memberSettings.hasFreeShipping) {
      shippingFee = 0;
    } else if (courierService && shippingFee <= 0) {
      throw new BadRequestError('Shipping fee is required when a courier is selected');
    }

    const total = Math.max(0, subtotal - discountAmount + shippingFee);

    const order = await orderRepository.create({
      userId,
      addressId: addressId ?? null,
      status: 'PENDING_PAYMENT',
      subtotal,
      shippingFee,
      discountAmount,
      total,
      voucherCode: appliedVoucherCode,
      notes: notes ?? null,
      courierService: courierService ?? null,
      expiresAt: new Date(Date.now() + config.PAYMENT_EXPIRY_MINUTES * 60 * 1000),
      items: { create: orderItems },
    });

    try {
      await prisma.$transaction(async (tx) => {
        for (const item of selectedItems) {
          const productName = item.product?.name ?? item.productId;
          if (item.variantId) {
            const result = await tx.productVariant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (result.count === 0) throw new ConflictError(`Insufficient stock for "${productName}"`);
          } else {
            const prod = await tx.product.findUnique({
              where: { id: item.productId },
              include: { variants: true },
            });
            if (prod?.variants?.length > 0) {
              const targetVariant = prod.variants.find((v) => v.stock >= item.quantity);
              if (!targetVariant) throw new ConflictError(`Insufficient stock for "${productName}"`);
              await tx.productVariant.update({
                where: { id: targetVariant.id },
                data: { stock: { decrement: item.quantity } },
              });
            } else {
              const result = await tx.product.updateMany({
                where: { id: item.productId, stock: { gte: item.quantity } },
                data: { stock: { decrement: item.quantity } },
              });
              if (result.count === 0) throw new ConflictError(`Insufficient stock for "${productName}"`);
            }
          }
        }

        // Atomic voucher increment — prevents concurrent over-use
        if (appliedVoucherId) {
          const affected = await tx.$executeRaw`
            UPDATE "Voucher"
            SET "usedCount" = "usedCount" + 1
            WHERE id = ${appliedVoucherId}
              AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
          `;
          if (affected === 0) throw new ConflictError('Voucher usage limit reached');
        }
      }, { isolationLevel: 'Serializable' });
    } catch (err) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      throw err;
    }

    if (appliedVoucherCode) {
      await voucherRepository.recordUsage(appliedVoucherId, order.id, userId);
    }

    await cartRepository.clearCart(cart.id);

    const formatRp = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;
    const orderUser = await userRepository.findById(userId);
    sendOrderCreatedEmail({
      to: orderUser.email,
      orderId: order.id,
      customerName: orderUser.name,
      amount: formatRp(order.total),
      paymentDeadline: order.expiresAt,
    }).catch(() => {});

    return order;
  };

  const getUserOrders = async (userId, filters) => {
    return orderRepository.findByUserId(userId, filters);
  };

  const getOrderById = async (userId, orderId, isAdmin = false) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (!isAdmin && order.userId !== userId) throw new ForbiddenError('Access denied');
    return order;
  };

  const uploadPaymentProof = async (userId, orderId, filenames) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Access denied');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestError('Order is not awaiting payment');
    }

    for (const filename of filenames) {
      await orderRepository.addPaymentProof(orderId, filename);
    }

    await orderRepository.updateStatus(orderId, 'CHECKING_PAYMENT');
    const updated = await orderRepository.findById(orderId);

    const formatRupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;
    sendPaymentReceivedEmail({
      to: updated.user.email,
      orderId,
      customerName: updated.user.name,
      amount: formatRupiah(updated.total),
    }).catch(() => {});

    return updated;
  };

  const requestRefund = async (userId, orderId, { reason, filenames }) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Access denied');
    if (!['DELIVERED', 'SHIPPED'].includes(order.status)) {
      throw new BadRequestError('Refund can only be requested for delivered or shipped orders');
    }

    const existing = await orderRepository.findRefundByOrderId(orderId);
    if (existing) throw new ConflictError('Refund request already submitted');

    await orderRepository.updateStatus(orderId, 'REFUND_REQUESTED');
    return orderRepository.createRefundRequest(orderId, reason, filenames);
  };

  const getAllOrders = async (filters) => {
    return orderRepository.findAll(filters);
  };

  const processRefund = async (orderId, { notes, filenames }) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (!['REFUND_REQUESTED', 'REFUNDED'].includes(order.status)) {
      throw new BadRequestError('Order is not in a refundable status');
    }
    if (!order.refundDetail) {
      throw new BadRequestError('User has not submitted refund account details yet');
    }

    await orderRepository.updateStatus(orderId, 'REFUNDED');

    // Only update RefundRequest record when it exists (user-initiated refund flow)
    if (order.refundRequest) {
      await orderRepository.approveRefund(orderId, {
        adminNotes: notes || null,
        adminProofImages: filenames || [],
      });
    }

    return orderRepository.findById(orderId);
  };

  const formatRupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;

  const approvePayment = async (orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    await orderRepository.updateStatus(orderId, 'PAYMENT_APPROVED');

    sendPaymentApprovedEmail({
      to: order.user.email,
      orderId,
      customerName: order.user.name,
      amount: formatRupiah(order.total),
    }).catch(() => {});

    return orderRepository.findById(orderId);
  };

  const rejectPayment = async (orderId, { notes } = {}) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    await orderRepository.updateRejection(orderId, notes || null);
    await restoreStock(order.items);

    sendPaymentRejectedEmail({
      to: order.user.email,
      orderId,
      customerName: order.user.name,
      reason: notes || null,
    }).catch(() => {});

    return orderRepository.findById(orderId);
  };

  const deliverOrder = async (orderId, { notes, filenames = [], estimatedDeliveryDate, backendBaseUrl }) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    await orderRepository.updateWithDeliveryProof(orderId, { notes, filenames, estimatedDeliveryDate });

    sendOrderShippedEmail({
      to: order.user.email,
      orderId,
      customerName: order.user.name,
      deliveryNotes: notes || null,
      estimatedDeliveryDate: estimatedDeliveryDate || null,
      frontendUrl: config.FRONTEND_URL,
    }).catch(() => {});

    if (notificationRepository) {
      notificationRepository.create({
        userId: order.userId,
        title: 'Pesanan Dikirim',
        message: `Pesanan #${orderId.slice(0, 8).toUpperCase()} sudah dikirim${estimatedDeliveryDate ? `. Estimasi tiba: ${new Date(estimatedDeliveryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}` : ''}.`,
      }).catch(() => {});
    }

    return orderRepository.findById(orderId);
  };

  const confirmDelivery = async (userId, orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Access denied');
    if (order.status !== 'SHIPPED') throw new BadRequestError('Order is not in SHIPPED status');

    await orderRepository.confirmDelivery(orderId);

    sendOrderDeliveredEmail({
      to: order.user.email,
      orderId,
      customerName: order.user.name,
      deliveryNotes: order.deliveryNotes || null,
      proofImageUrls: [],
    }).catch(() => {});

    return orderRepository.findById(orderId);
  };

  const adminRequestRefund = async (orderId, { reason } = {}) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.status !== 'CHECKING_PAYMENT') {
      throw new BadRequestError('Can only request refund when order is in CHECKING_PAYMENT status');
    }

    await orderRepository.updateStatus(orderId, 'REFUND_REQUESTED');

    if (notificationRepository) {
      notificationRepository.create({
        userId: order.userId,
        title: 'Refund Diproses',
        message: `Pembayaran order #${orderId.slice(0, 8).toUpperCase()} akan di-refund. Silakan isi detail rekening/e-wallet untuk menerima dana.`,
      }).catch(() => {});
    }

    sendRefundRequestedEmail({
      to: order.user.email,
      orderId,
      customerName: order.user.name,
      reason: reason || null,
      frontendUrl: config.FRONTEND_URL,
    }).catch(() => {});

    return orderRepository.findById(orderId);
  };

  const submitRefundDetail = async (userId, orderId, data) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Access denied');
    if (order.status !== 'REFUND_REQUESTED') {
      throw new BadRequestError('Order is not in REFUND_REQUESTED status');
    }

    const existing = await orderRepository.findRefundDetailByOrderId(orderId);
    if (existing) throw new ConflictError('Refund detail already submitted');

    const result = await orderRepository.createRefundDetail(orderId, data);

    const adminEmail = config.ADMIN_EMAIL || config.SMTP_USER;
    if (adminEmail) {
      sendRefundDetailSubmittedEmail({
        to: adminEmail,
        orderId,
        customerName: order.user.name,
        customerEmail: order.user.email,
        refundDetail: data,
        adminOrderUrl: `${config.FRONTEND_URL}/admin/orders/${orderId}`,
      }).catch(() => {});
    }

    return result;
  };

  const restoreStock = async (items) => {
    for (const item of items) {
      if (item.variantId) {
        await productRepository.incrementVariantStock(item.variantId, item.quantity);
      } else {
        await productRepository.incrementStock(item.productId, item.quantity);
      }
    }
  };

  const cancelOrder = async (userId, orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.userId !== userId) throw new ForbiddenError('Access denied');
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestError('Only orders awaiting payment can be cancelled');
    }
    await orderRepository.updateStatus(orderId, 'CANCELLED');
    await restoreStock(order.items);
    return orderRepository.findById(orderId);
  };

  const autoExpireOrders = async () => {
    const cutoff = new Date(Date.now() - config.PAYMENT_EXPIRY_MINUTES * 60 * 1000);
    const expired = await orderRepository.findExpiredPendingOrders(cutoff);
    for (const order of expired) {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      });
    }
    return expired.length;
  };

  const updateOrderStatus = async (orderId, status) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    return orderRepository.updateStatus(orderId, status);
  };

  const getStats = async ({ startDate, endDate } = {}) => {
    const [totalOrders, totalRevenue, pendingPayments, totalUsers] = await Promise.all([
      orderRepository.countAll({ startDate, endDate }),
      orderRepository.sumRevenue({ startDate, endDate }),
      orderRepository.countByStatus('CHECKING_PAYMENT'),
      userRepository.countAll(),
    ]);
    return { totalOrders, totalRevenue, pendingPayments, totalUsers };
  };

  const getChartData = async () => {
    const [revenueByDay, statusDistribution, topProducts, typeRevenue] = await Promise.all([
      orderRepository.getRevenueByDay(30),
      orderRepository.getStatusDistribution(),
      orderRepository.getTopProducts(5),
      orderRepository.getTypeRevenue(),
    ]);
    return { revenueByDay, statusDistribution, topProducts, typeRevenue };
  };

  return {
    createOrder,
    getUserOrders,
    getOrderById,
    uploadPaymentProof,
    requestRefund,
    getAllOrders,
    processRefund,
    approvePayment,
    rejectPayment,
    updateOrderStatus,
    deliverOrder,
    confirmDelivery,
    adminRequestRefund,
    submitRefundDetail,
    getStats,
    getChartData,
    cancelOrder,
    autoExpireOrders,
  };
};
