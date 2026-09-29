export const makeNotificationRepository = ({ prisma }) => {
  const create = async ({ userId, title, message }) => {
    return prisma.notification.create({ data: { userId, title, message } });
  };

  const findByUserId = async (userId, { page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { notifications, total, page, limit };
  };

  const markAllRead = async (userId) => {
    return prisma.notification.updateMany({ where: { userId }, data: { isRead: true } });
  };

  const countUnread = async (userId) => {
    return prisma.notification.count({ where: { userId, isRead: false } });
  };

  return { create, findByUserId, markAllRead, countUnread };
};
