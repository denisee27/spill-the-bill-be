import { NotFoundError } from '../errors/http-errors.js';

export const makeEventService = ({ eventRepository, productRepository }) => {
  const listEvents = async (filters) => {
    return eventRepository.findAll(filters);
  };

  const listPublicEvents = async () => {
    return eventRepository.findAllPublic();
  };

  const getEvent = async (id) => {
    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found');
    return event;
  };

  const createEvent = async (data) => {
    return eventRepository.create(data);
  };

  const updateEvent = async (id, data) => {
    const existing = await eventRepository.findById(id);
    if (!existing) throw new NotFoundError('Event not found');
    return eventRepository.update(id, data);
  };

  const deleteEvent = async (id) => {
    const existing = await eventRepository.findById(id);
    if (!existing) throw new NotFoundError('Event not found');
    return eventRepository.remove(id);
  };

  const addProducts = async (eventId, productIds) => {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new NotFoundError('Event not found');
    for (const pid of productIds) {
      const p = await productRepository.findById(pid);
      if (!p) throw new NotFoundError(`Product ${pid} not found`);
    }
    return eventRepository.addProducts(eventId, productIds);
  };

  const removeProduct = async (eventId, productId) => {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new NotFoundError('Event not found');
    return eventRepository.removeProduct(eventId, productId);
  };

  return { listEvents, listPublicEvents, getEvent, createEvent, updateEvent, deleteEvent, addProducts, removeProduct };
};
