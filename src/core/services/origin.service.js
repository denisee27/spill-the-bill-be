import { NotFoundError } from '../errors/http-errors.js';

export const makeOriginService = ({ originRepository }) => {
  const listOrigins = () => originRepository.findAll();

  const createOrigin = (data) => originRepository.create(data);

  const updateOrigin = async (id, data) => {
    const existing = await originRepository.findById(id);
    if (!existing) throw new NotFoundError('Origin not found');
    return originRepository.update(id, data);
  };

  const deleteOrigin = async (id) => {
    const existing = await originRepository.findById(id);
    if (!existing) throw new NotFoundError('Origin not found');
    return originRepository.remove(id);
  };

  return { listOrigins, createOrigin, updateOrigin, deleteOrigin };
};
