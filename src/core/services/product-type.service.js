import { NotFoundError, ConflictError } from '../errors/http-errors.js';

export const makeProductTypeService = ({ productTypeRepository }) => {
  const listTypes = async ({ includeInactive = false } = {}) => {
    return includeInactive
      ? productTypeRepository.findAll()
      : productTypeRepository.findActive();
  };

  const createType = async (data) => {
    const slug = (data.slug || data.name).toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    const existing = await productTypeRepository.findBySlug(slug);
    if (existing) throw new ConflictError('Product type with this slug already exists');

    return productTypeRepository.create({ ...data, slug });
  };

  const updateType = async (id, data) => {
    const existing = await productTypeRepository.findById(id);
    if (!existing) throw new NotFoundError('Product type not found');

    if (data.slug) {
      data.slug = data.slug.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
      const dup = await productTypeRepository.findBySlug(data.slug);
      if (dup && dup.id !== id) throw new ConflictError('Slug already in use');
    }

    return productTypeRepository.update(id, data);
  };

  const deleteType = async (id) => {
    const existing = await productTypeRepository.findById(id);
    if (!existing) throw new NotFoundError('Product type not found');
    return productTypeRepository.remove(id);
  };

  return { listTypes, createType, updateType, deleteType };
};
