import { NotFoundError } from '../errors/http-errors.js';

export const makeUserService = ({ userRepository }) => {
  const listUsers = async (filters) => {
    return userRepository.findAll(filters);
  };

  const getUserDetail = async (id) => {
    const user = await userRepository.findDetailById(id);
    if (!user) throw new NotFoundError('User not found');
    const completedStatuses = ['PAYMENT_APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const totalSpend = user.orders
      .filter((o) => completedStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);
    return { ...user, totalSpend, orderCount: user._count.orders };
  };

  const updateRole = async (id, role) => {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return userRepository.updateRole(id, role);
  };

  return { listUsers, getUserDetail, updateRole };
};
