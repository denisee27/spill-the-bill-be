import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';

export const signToken = (payload, expiresIn) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: expiresIn ?? config.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};
