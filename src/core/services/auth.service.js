import { ConflictError, NotFoundError, UnauthorizedError } from '../errors/http-errors.js';

export const makeAuthService = ({ userRepository, hashPassword, comparePassword, signToken }) => {
  const register = async ({ email, password, name, phone }) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already registered');

    const hashedPassword = await hashPassword(password);
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone: phone ?? null,
      role: 'USER',
    });

    const token = signToken({ id: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isMember: user.isMember,
      },
    };
  };

  const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const token = signToken({ id: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isMember: user.isMember,
        memberSince: user.memberSince,
        memberExpiry: user.memberExpiry,
      },
    };
  };

  const getMe = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return user;
  };

  const resetPassword = async ({ email, newPassword }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError('No account found with that email');
    const hashedPassword = await hashPassword(newPassword);
    await userRepository.updatePassword(user.id, hashedPassword);
  };

  return { register, login, getMe, resetPassword };
};
