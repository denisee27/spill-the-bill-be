export const makeMemberRepository = ({ prisma }) => {
  const getSettings = async () => {
    let settings = await prisma.memberSetting.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.memberSetting.create({ data: { id: 1 } });
    }
    return settings;
  };

  const updateSettings = async (data) => {
    return prisma.memberSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
  };

  const getWhatsappSettings = async () => {
    let settings = await prisma.whatsappSetting.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.whatsappSetting.create({ data: { id: 1 } });
    }
    return settings;
  };

  const updateWhatsappSettings = async (data) => {
    return prisma.whatsappSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
  };

  const findAllMembers = async ({ page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const where = { isMember: true };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          isMember: true,
          memberSince: true,
          memberExpiry: true,
          createdAt: true,
        },
        orderBy: { memberSince: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page, limit };
  };

  const getUserPeriodSpend = async (userId, since) => {
    const result = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        userId,
        status: { in: ['PAYMENT_APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: since },
      },
    });
    return result._sum.total ?? 0;
  };

  const findMembersExpiringInDays = async (days) => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);
    return prisma.user.findMany({
      where: { isMember: true, memberExpiry: { gte: from, lte: to } },
      select: { id: true, email: true, name: true, memberExpiry: true },
    });
  };

  return { getSettings, updateSettings, getWhatsappSettings, updateWhatsappSettings, findAllMembers, getUserPeriodSpend, findMembersExpiringInDays };
};
