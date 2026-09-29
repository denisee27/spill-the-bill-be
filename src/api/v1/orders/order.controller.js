export const makeOrderController = ({ orderService }) => {
  const createOrder = async (req, res, next) => {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);
      return res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  const getUserOrders = async (req, res, next) => {
    try {
      const result = await orderService.getUserOrders(req.user.id, req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const parseOrderImages = (order) => {
    if (!order) return order;
    return {
      ...order,
      items: (order.items ?? []).map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: (() => {
                try { return JSON.parse(item.product.images); } catch { return []; }
              })(),
            }
          : null,
      })),
    };
  };

  const getOrder = async (req, res, next) => {
    try {
      const isAdmin = req.user.role === 'ADMIN';
      const order = await orderService.getOrderById(req.user.id, req.params.id, isAdmin);
      return res.status(200).json({ success: true, data: parseOrderImages(order) });
    } catch (err) {
      next(err);
    }
  };

  const uploadPaymentProof = async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }
      const filenames = req.files.map((f) => f.filename);
      const order = await orderService.uploadPaymentProof(req.user.id, req.params.id, filenames);
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  const requestRefund = async (req, res, next) => {
    try {
      const filenames = req.files ? req.files.map((f) => f.filename) : [];
      const refund = await orderService.requestRefund(req.user.id, req.params.id, {
        reason: req.body.reason,
        filenames,
      });
      return res.status(201).json({ success: true, data: refund });
    } catch (err) {
      next(err);
    }
  };

  const getAllOrders = async (req, res, next) => {
    try {
      const result = await orderService.getAllOrders(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const approvePayment = async (req, res, next) => {
    try {
      const order = await orderService.approvePayment(req.params.id);
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  const rejectPayment = async (req, res, next) => {
    try {
      const order = await orderService.rejectPayment(req.params.id, { notes: req.body?.notes });
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  const deliverOrder = async (req, res, next) => {
    try {
      const filenames = req.files ? req.files.map((f) => f.filename) : [];
      const backendBaseUrl = `${req.protocol}://${req.get('host')}`;
      const order = await orderService.deliverOrder(req.params.id, {
        notes: req.body?.notes,
        filenames,
        estimatedDeliveryDate: req.body?.estimatedDeliveryDate || null,
        backendBaseUrl,
      });
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  const confirmDelivery = async (req, res, next) => {
    try {
      const order = await orderService.confirmDelivery(req.user.id, req.params.id);
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  const adminRequestRefund = async (req, res, next) => {
    try {
      const order = await orderService.adminRequestRefund(req.params.id, { reason: req.body?.reason });
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  const submitRefundDetail = async (req, res, next) => {
    try {
      const detail = await orderService.submitRefundDetail(req.user.id, req.params.id, req.body);
      return res.status(201).json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  };

  const updateOrderStatus = async (req, res, next) => {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  const processRefund = async (req, res, next) => {
    try {
      const filenames = req.files ? req.files.map((f) => f.filename) : [];
      const result = await orderService.processRefund(req.params.id, {
        notes: req.body.notes,
        filenames,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const getStats = async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const stats = await orderService.getStats({ startDate, endDate });
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  };

  const getChartData = async (req, res, next) => {
    try {
      const data = await orderService.getChartData();
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  const cancelOrder = async (req, res, next) => {
    try {
      const order = await orderService.cancelOrder(req.user.id, req.params.id);
      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  return {
    createOrder,
    getUserOrders,
    getOrder,
    uploadPaymentProof,
    requestRefund,
    processRefund,
    getAllOrders,
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
  };
};
