import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import pinoHttp from 'pino-http';

import { config } from './config/index.js';
import logger from './infra/logger/index.js';
import { buildContainer } from './container.js';
import { errorHandler } from './api/middleware/error-handler.js';

// Routers
import { makeAuthRouter } from './api/v1/auth/auth.router.js';
import { makeProductRouter } from './api/v1/products/product.router.js';
import { makeCategoryRouter } from './api/v1/categories/category.router.js';
import { makeCartRouter } from './api/v1/cart/cart.router.js';
import { makeOrderRouter } from './api/v1/orders/order.router.js';
import { makeVoucherRouter } from './api/v1/vouchers/voucher.router.js';
import { makeMemberRouter } from './api/v1/members/member.router.js';
import { makeWhatsappRouter } from './api/v1/whatsapp/whatsapp.router.js';
import { makePortfolioRouter } from './api/v1/portfolio/portfolio.router.js';
import { makeUserRouter } from './api/v1/users/user.router.js';
import { makeAddressRouter } from './api/v1/addresses/address.router.js';
import { makeEventRouter } from './api/v1/events/event.router.js';
import { makeOriginRouter } from './api/v1/origins/origin.router.js';
import { makeShippingRouter } from './api/v1/shipping/shipping.router.js';

// Jobs
import { startMemberRenewalJob } from './jobs/member-renewal.job.js';
import { startAutoCancelOrdersJob } from './jobs/auto-cancel-orders.job.js';

const app = express();

// Build DI container
const container = buildContainer();

// Middleware stack (in order)
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

// Rate limiter — skip in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.NODE_ENV === 'production' ? 300 : 0,
  skip: () => config.NODE_ENV !== 'production',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/v1/auth', makeAuthRouter(container));
app.use('/api/v1/products', makeProductRouter(container));
app.use('/api/v1/categories', makeCategoryRouter(container));
app.use('/api/v1/cart', makeCartRouter(container));
app.use('/api/v1/orders', makeOrderRouter(container));
app.use('/api/v1/vouchers', makeVoucherRouter(container));
app.use('/api/v1/members', makeMemberRouter(container));
app.use('/api/v1/whatsapp', makeWhatsappRouter(container));
app.use('/api/v1/portfolio', makePortfolioRouter(container));
app.use('/api/v1/users', makeUserRouter(container));
app.use('/api/v1/addresses', makeAddressRouter(container));
app.use('/api/v1/events', makeEventRouter(container));
app.use('/api/v1/origins', makeOriginRouter(container));
app.use('/api/v1/shipping', makeShippingRouter(container));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

// Start jobs
startMemberRenewalJob(container);
startAutoCancelOrdersJob(container);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`Spill the Bill API running on port ${PORT} (${config.NODE_ENV})`);
});

export default app;
