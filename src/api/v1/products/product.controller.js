const toPublicProduct = (product) => {
  if (!product) return product;
  const { fee, price, ...rest } = product;
  return {
    ...rest,
    variants: (rest.variants ?? []).map(({ fee: _f, price: _p, ...v }) => v),
  };
};

export const makeProductController = ({ productService }) => {
  const listProducts = async (req, res, next) => {
    try {
      const result = await productService.listProducts(req.query);
      return res.status(200).json({
        success: true,
        data: { ...result, products: result.products.map(toPublicProduct) },
      });
    } catch (err) {
      next(err);
    }
  };

  const getFeatured = async (req, res, next) => {
    try {
      const products = await productService.getFeatured();
      return res.status(200).json({ success: true, data: products.map(toPublicProduct) });
    } catch (err) {
      next(err);
    }
  };

  const getProduct = async (req, res, next) => {
    try {
      const product = await productService.getProductById(req.params.id);
      return res.status(200).json({ success: true, data: toPublicProduct(product) });
    } catch (err) {
      next(err);
    }
  };

  const getProductAdmin = async (req, res, next) => {
    try {
      const product = await productService.getProductById(req.params.id);
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  };

  const extractFiles = (files = []) => {
    const productImages = files.filter((f) => f.fieldname === 'images').map((f) => f.filename);
    const variantImageMap = {};
    files
      .filter((f) => f.fieldname.startsWith('variantImage_'))
      .forEach((f) => {
        const idx = parseInt(f.fieldname.split('_')[1], 10);
        variantImageMap[idx] = f.filename;
      });
    return { productImages, variantImageMap };
  };

  const injectVariantImages = (variants, variantImageMap) =>
    variants?.map((v, i) => ({
      ...v,
      imageUrl: variantImageMap[i] ?? v.imageUrl ?? null,
    }));

  const createProduct = async (req, res, next) => {
    try {
      const { productImages, variantImageMap } = extractFiles(req.files);
      const existingMedia = req.body.existingMedia ? JSON.parse(req.body.existingMedia) : [];
      const allMedia = [...existingMedia, ...productImages];
      const variants = req.body.variants ? JSON.parse(req.body.variants) : undefined;
      const product = await productService.createProduct({
        ...req.body,
        images: allMedia,
        variants: injectVariantImages(variants, variantImageMap),
      });
      return res.status(201).json({ success: true, data: product });
    } catch (err) { next(err); }
  };

  const updateProduct = async (req, res, next) => {
    try {
      const { productImages, variantImageMap } = extractFiles(req.files);
      const hasMediaUpdate = productImages.length > 0 || req.body.existingMedia !== undefined;
      const existingMedia = req.body.existingMedia ? JSON.parse(req.body.existingMedia) : [];
      const allMedia = hasMediaUpdate ? [...existingMedia, ...productImages] : undefined;
      const variants = req.body.variants ? JSON.parse(req.body.variants) : undefined;
      const product = await productService.updateProduct(req.params.id, {
        ...req.body,
        ...(allMedia !== undefined && { images: allMedia }),
        variants: injectVariantImages(variants, variantImageMap),
      });
      return res.status(200).json({ success: true, data: product });
    } catch (err) { next(err); }
  };

  const deleteProduct = async (req, res, next) => {
    try {
      await productService.deleteProduct(req.params.id);
      return res.status(200).json({ success: true, data: { message: 'Product deleted' } });
    } catch (err) {
      next(err);
    }
  };

  const updateStock = async (req, res, next) => {
    try {
      const product = await productService.updateStock(req.params.id, req.body.stock);
      return res.json({ success: true, data: product });
    } catch (err) { next(err); }
  };

  const bulkSoldOut = async (req, res, next) => {
    try {
      const { ids, soldOut = true } = req.body;
      await productService.bulkSoldOut(ids, soldOut);
      return res.json({ success: true, data: { message: 'Products updated' } });
    } catch (err) { next(err); }
  };

  return { listProducts, getFeatured, getProduct, getProductAdmin, createProduct, updateProduct, deleteProduct, updateStock, bulkSoldOut };
};
