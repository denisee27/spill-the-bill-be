import { createEventSchema, updateEventSchema, addProductsSchema } from './event.validator.js';

const parseProduct = (product) => {
  if (!product) return product;
  const { fee, price, images, variants, ...rest } = product;
  let parsedImages = [];
  try { parsedImages = JSON.parse(images); } catch { parsedImages = []; }
  return {
    ...rest,
    images: parsedImages,
    displayPrice: (price || 0) + (fee || 0),
    variants: (variants ?? []).map(({ fee: _f, price: _p, ...v }) => ({
      ...v,
      displayPrice: (_p || 0) + (_f || 0),
    })),
  };
};

export const makeEventController = ({ eventService }) => {
  const list = async (_req, res, next) => {
    try {
      // Public endpoint: only active, non-expired events
      const events = await eventService.listPublicEvents();
      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  };

  const listAdmin = async (req, res, next) => {
    try {
      const { status, page, limit } = req.query;
      const result = await eventService.listEvents({
        status,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const getOne = async (req, res, next) => {
    try {
      const event = await eventService.getEvent(req.params.id);
      const data = {
        ...event,
        products: (event.products ?? []).map((ep) => ({
          ...ep,
          product: parseProduct(ep.product),
        })),
      };
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  const create = async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (req.file) body.bannerImage = req.file.filename;
      const data = createEventSchema.parse(body);
      const event = await eventService.createEvent(data);
      res.status(201).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  const update = async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (req.file) body.bannerImage = req.file.filename;
      const data = updateEventSchema.parse(body);
      const event = await eventService.updateEvent(req.params.id, data);
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  const remove = async (req, res, next) => {
    try {
      await eventService.deleteEvent(req.params.id);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  };

  const addProducts = async (req, res, next) => {
    try {
      const { productIds } = addProductsSchema.parse(req.body);
      const event = await eventService.addProducts(req.params.id, productIds);
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  const removeProduct = async (req, res, next) => {
    try {
      const event = await eventService.removeProduct(req.params.id, req.params.productId);
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  return { list, listAdmin, getOne, create, update, remove, addProducts, removeProduct };
};
