import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { makeAuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { registerSchema, loginSchema, resetPasswordSchema } from './auth.validator.js';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many OTP requests. Please wait 15 minutes before trying again.' },
});

export const makeAuthRouter = (container) => {
  const router = Router();
  const authService = container.resolve('authService');
  const { register, login, logout, me, updateProfile, sendOtp, verifyOtp, resetPassword, verify2fa } =
    makeAuthController({ authService });

  router.post('/register', validate(registerSchema), register);
  router.post('/login', validate(loginSchema), login);
  router.post('/logout', logout);
  router.get('/me', requireAuth, me);
  router.patch('/me', requireAuth, updateProfile);
  router.post('/send-otp', otpLimiter, sendOtp);
  router.post('/verify-otp', verifyOtp);
  router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
  router.post('/admin/verify-2fa', verify2fa);

  return router;
};
