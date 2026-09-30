import { config } from '../../../config/index.js';
import { sendOtpEmail } from '../../../infra/mailer/index.js';
import { generateOtp, saveOtp, verifyOtp as checkOtp } from '../../../infra/mailer/otp.store.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const makeAuthController = ({ authService }) => {
  const register = async (req, res, next) => {
    try {
      const { otp, email } = req.body;
      const valid = checkOtp(email, otp);
      if (!valid) return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
      const result = await authService.register(req.body);
      res.cookie('token', result.token, COOKIE_OPTIONS);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const login = async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.cookie('token', result.token, COOKIE_OPTIONS);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const logout = (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
  };

  const me = async (req, res, next) => {
    try {
      const user = await authService.getMe(req.user.id);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  const sendOtp = async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
      const code = generateOtp();
      saveOtp(email, code);
      await sendOtpEmail({ to: email, code });
      return res.json({ success: true, data: { message: 'Verification code sent' } });
    } catch (err) {
      next(err);
    }
  };

  const verifyOtp = async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ success: false, error: 'Email and OTP are required' });
      const valid = checkOtp(email, otp);
      if (!valid) return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
      return res.json({ success: true, data: { verified: true } });
    } catch (err) {
      next(err);
    }
  };

  const resetPassword = async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;
      const valid = checkOtp(email, otp);
      if (!valid) return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
      await authService.resetPassword({ email, newPassword });
      return res.json({ success: true, data: { message: 'Password reset successfully' } });
    } catch (err) {
      next(err);
    }
  };

  return { register, login, logout, me, sendOtp, verifyOtp, resetPassword };
};
