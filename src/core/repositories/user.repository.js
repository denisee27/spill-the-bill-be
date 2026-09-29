export const makeUserRepository = ({ prisma }) => {
  const findByEmail = async (email) => {
    return prisma.user.findUnique({ where: { email } });
  };

  const findById = async (id) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isMember: true,
        memberSince: true,
        memberExpiry: true,
        createdAt: true,
      },
    });
  };

  const create = async (data) => {
    return prisma.user.create({ data });
  };

  const findDetailById = async (id) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isMember: true,
        memberSince: true,
        memberExpiry: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            items: { select: { quantity: true, price: true, product: { select: { name: true } } } },
          },
        },
        addresses: {
          orderBy: { isDefault: 'desc' },
          select: { id: true, label: true, city: true, province: true, isDefault: true },
        },
        _count: { select: { orders: true } },
      },
    });
  };

  const findAll = async ({ search, page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};
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
          role: true,
          isMember: true,
          memberSince: true,
          memberExpiry: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page, limit };
  };

  const updateRole = async (id, role) => {
    return prisma.user.update({ where: { id }, data: { role } });
  };

  const updateMembership = async (id, data) => {
    return prisma.user.update({ where: { id }, data });
  };

  const findAllWithOrders = async () => {
    return prisma.user.findMany({
      where: { isMember: true },
      include: {
        orders: {
          where: { status: 'DELIVERED' },
          select: { total: true, createdAt: true },
        },
      },
    });
  };

  const findExpiredMembers = async () => {
    return prisma.user.findMany({
      where: {
        isMember: true,
        memberExpiry: { lt: new Date() },
      },
    });
  };

  const findNonMembersWithOrders = async (startOfMonth) => {
    return prisma.user.findMany({
      where: {
        isMember: false,
        orders: {
          some: {
            status: 'DELIVERED',
            createdAt: { gte: startOfMonth },
          },
        },
      },
      include: {
        orders: {
          where: {
            status: 'DELIVERED',
            createdAt: { gte: startOfMonth },
          },
          select: { total: true },
        },
      },
    });
  };

  const updatePassword = async (id, hashedPassword) => {
    return prisma.user.update({ where: { id }, data: { password: hashedPassword } });
  };

  return {
    findByEmail,
    findById,
    findDetailById,
    create,
    findAll,
    updateRole,
    updateMembership,
    updatePassword,
    findAllWithOrders,
    findExpiredMembers,
    findNonMembersWithOrders,
    countAll: () => prisma.user.count({ where: { role: 'USER' } }),
  };
};
