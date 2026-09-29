import { Router } from 'express';
import { makeAuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { registerSchema, loginSchema, resetPasswordSchema } from './auth.validator.js';

export const makeAuthRouter = (container) => {
  const router = Router();
  const authService = container.resolve('authService');
  const { register, login, logout, me, sendOtp, verifyOtp, resetPassword } = makeAuthController({ authService });

  router.post('/register', validate(registerSchema), register);
  router.post('/login', validate(loginSchema), login);
  router.post('/logout', logout);
  router.get('/me', requireAuth, me);
  router.post('/send-otp', sendOtp);
  router.post('/verify-otp', verifyOtp);
  router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

  return router;
};
