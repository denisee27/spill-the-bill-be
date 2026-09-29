import { NotFoundError, ConflictError } from '../errors/http-errors.js';

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const makeCategoryService = ({ categoryRepository }) => {
  const listCategories = async () => {
    return categoryRepository.findAll();
  };

  const createCategory = async (data) => {
    let slug = data.slug || slugify(data.name);
    const existing = await categoryRepository.findBySlug(slug);
    if (existing) throw new ConflictError('Category with this slug already exists');

    return categoryRepository.create({ ...data, slug });
  };

  const updateCategory = async (id, data) => {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');

    if (data.slug) {
      const dup = await categoryRepository.findBySlug(data.slug);
      if (dup && dup.id !== id) throw new ConflictError('Slug already in use');
    } else if (data.name) {
      data.slug = slugify(data.name);
    }

    return categoryRepository.update(id, data);
  };

  const deleteCategory = async (id) => {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');
    return categoryRepository.remove(id);
  };

  return { listCategories, createCategory, updateCategory, deleteCategory };
};
