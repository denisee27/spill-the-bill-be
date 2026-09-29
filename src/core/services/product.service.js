import { NotFoundError, ConflictError, BadRequestError } from '../errors/http-errors.js';

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const parseImages = (product) => {
  if (!product) return product;
  const fee = product.fee || 0;
  return {
    ...product,
    fee,
    displayPrice: product.price + fee,
    images: (() => {
      try {
        return JSON.parse(product.images);
      } catch {
        return [];
      }
    })(),
    variants: (product.variants ?? []).map((v) => ({
      ...v,
      displayPrice: (v.price || 0) + (v.fee || 0),
    })),
  };
};

export const makeProductService = ({ productRepository, categoryRepository }) => {
  const listProducts = async (filters) => {
    const result = await productRepository.findAll(filters);
    return {
      ...result,
      products: result.products.map(parseImages),
    };
  };

  const getFeatured = async () => {
    const products = await productRepository.findFeatured();
    return products.map(parseImages);
  };

  const getProductById = async (id) => {
    const product = await productRepository.findById(id);
    if (!product || !product.isActive) throw new NotFoundError('Product not found');
    return parseImages(product);
  };

  const coerceVariants = (variants) =>
    variants.map((v) => ({
      name: v.name,
      price: parseFloat(v.price) || 0,
      fee: parseFloat(v.fee) || 0,
      originalPrice: v.originalPrice !== '' && v.originalPrice != null ? parseFloat(v.originalPrice) : null,
      stock: v.stock !== undefined && v.stock !== '' ? parseInt(v.stock, 10) : 0,
      imageUrl: v.imageUrl || null,
    }));

  const coerceProductData = (data, hasVariants = false) => {
    const stock = data.stock !== undefined ? parseInt(data.stock, 10) : undefined;
    return {
      ...data,
      ...(data.price !== undefined && { price: parseFloat(data.price) }),
      ...(data.fee !== undefined && { fee: parseFloat(data.fee) || 0 }),
      ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice === '' || data.originalPrice === null ? null : parseFloat(data.originalPrice) }),
      ...(stock !== undefined && { stock }),
      ...(data.weight !== undefined && { weight: parseFloat(data.weight) }),
      ...(data.isActive !== undefined && { isActive: data.isActive === true || data.isActive === 'true' }),
      ...(data.originId === '' && { originId: null }),
      ...(data.categoryId === '' && { categoryId: null }),
      isSoldOut: hasVariants ? false : (stock !== undefined ? stock === 0 : undefined),
      isFeatured: undefined,
    };
  };

  const createProduct = async ({ images = [], variants, existingMedia, ...data }) => {
    let slug = slugify(data.name);
    const existing = await productRepository.findBySlug(slug);
    if (existing) slug = `${slug}-${Date.now()}`;

    if (data.categoryId) {
      const cat = await categoryRepository.findById(data.categoryId);
      if (!cat) throw new NotFoundError('Category not found');
    }

    const parsedVariants = variants?.length ? coerceVariants(variants) : null;
    const product = await productRepository.create({
      ...coerceProductData(data, !!parsedVariants),
      slug,
      images: JSON.stringify(images),
      variants: parsedVariants ? { create: parsedVariants } : undefined,
    });

    return parseImages(product);
  };

  const updateProduct = async (id, { images, variants, existingMedia, ...data }) => {
    const existing = await productRepository.findById(id);
    if (!existing) throw new NotFoundError('Product not found');

    if (data.name) {
      let slug = slugify(data.name);
      const dup = await productRepository.findBySlug(slug);
      if (dup && dup.id !== id) slug = `${slug}-${Date.now()}`;
      data.slug = slug;
    }

    const parsedVariants = variants?.length ? coerceVariants(variants) : (variants ? [] : undefined);
    const updateData = { ...coerceProductData(data, parsedVariants != null && parsedVariants.length > 0) };
    if (images !== undefined) updateData.images = JSON.stringify(images);

    // Replace variants when provided
    if (parsedVariants !== undefined) {
      updateData.variants = {
        deleteMany: {},
        ...(parsedVariants.length > 0 && { create: parsedVariants }),
      };
    }

    const product = await productRepository.update(id, updateData);
    return parseImages(product);
  };

  const deleteProduct = async (id) => {
    const existing = await productRepository.findById(id);
    if (!existing) throw new NotFoundError('Product not found');
    return productRepository.softDelete(id);
  };

  const updateStock = async (id, stock) => {
    const existing = await productRepository.findById(id);
    if (!existing) throw new NotFoundError('Product not found');
    const product = await productRepository.updateStock(id, stock);
    return parseImages(product);
  };

  const bulkSoldOut = async (ids, soldOut = true) => {
    if (!Array.isArray(ids) || ids.length === 0) throw new BadRequestError('No product IDs provided');
    if (soldOut) {
      return productRepository.bulkSoldOut(ids);
    } else {
      return productRepository.bulkSoldIn(ids);
    }
  };

  return { listProducts, getFeatured, getProductById, createProduct, updateProduct, deleteProduct, updateStock, bulkSoldOut };
};
