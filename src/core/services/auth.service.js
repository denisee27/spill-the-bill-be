import { ConflictError, NotFoundError, UnauthorizedError } from '../errors/http-errors.js';
import { config } from '../../config/index.js';

export const makeAuthService = ({ userRepository, hashPassword, comparePassword, signToken, verifyToken }) => {
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

    // Admin 2FA gate: if ADMIN_2FA_CODE is configured, require second factor
    if (user.role === 'ADMIN' && config.ADMIN_2FA_CODE) {
      const tempToken = signToken({ id: user.id, role: user.role, pending2fa: true }, '5m');
      return { requires2fa: true, tempToken };
    }

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

  const verifyAdminTwoFactor = async (tempToken, code) => {
    let payload;
    try {
      payload = verifyToken(tempToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired 2FA session');
    }
    if (!payload.pending2fa || payload.role !== 'ADMIN') {
      throw new UnauthorizedError('Invalid 2FA session');
    }
    if (!config.ADMIN_2FA_CODE || code !== config.ADMIN_2FA_CODE) {
      throw new UnauthorizedError('Invalid 2FA code');
    }

    const user = await userRepository.findById(payload.id);
    if (!user) throw new UnauthorizedError('User not found');

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

  const updateProfile = async (userId, { phone }) => {
    return userRepository.updatePhone(userId, phone?.trim() ?? null);
  };

  const resetPassword = async ({ email, newPassword }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError('No account found with that email');
    const hashedPassword = await hashPassword(newPassword);
    await userRepository.updatePassword(user.id, hashedPassword);
  };

  return { register, login, getMe, updateProfile, resetPassword, verifyAdminTwoFactor };
};
