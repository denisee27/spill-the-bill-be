import { createContainer, asValue, asFunction } from 'awilix';

import prisma from './infra/db/prisma.js';
import logger from './infra/logger/index.js';
import { hashPassword, comparePassword } from './infra/security/bcrypt.js';
import { signToken, verifyToken } from './infra/security/jwt.js';

// Repositories
import { makeUserRepository } from './core/repositories/user.repository.js';
import { makeCategoryRepository } from './core/repositories/category.repository.js';
import { makeProductRepository } from './core/repositories/product.repository.js';
import { makeCartRepository } from './core/repositories/cart.repository.js';
import { makeOrderRepository } from './core/repositories/order.repository.js';
import { makeVoucherRepository } from './core/repositories/voucher.repository.js';
import { makeMemberRepository } from './core/repositories/member.repository.js';
import { makePortfolioRepository } from './core/repositories/portfolio.repository.js';
import { makeAddressRepository } from './core/repositories/address.repository.js';
import { makeEventRepository } from './core/repositories/event.repository.js';
import { makeOriginRepository } from './core/repositories/origin.repository.js';
import { makeNotificationRepository } from './core/repositories/notification.repository.js';

// Services
import { makeAuthService } from './core/services/auth.service.js';
import { makeProductService } from './core/services/product.service.js';
import { makeCategoryService } from './core/services/category.service.js';
import { makeCartService } from './core/services/cart.service.js';
import { makeOrderService } from './core/services/order.service.js';
import { makeVoucherService } from './core/services/voucher.service.js';
import { makeMemberService } from './core/services/member.service.js';
import { makeWhatsappService } from './core/services/whatsapp.service.js';
import { makePortfolioService } from './core/services/portfolio.service.js';
import { makeUserService } from './core/services/user.service.js';
import { makeAddressService } from './core/services/address.service.js';
import { makeEventService } from './core/services/event.service.js';
import { makeOriginService } from './core/services/origin.service.js';
import { makeShippingService } from './core/services/shipping.service.js';

export const buildContainer = () => {
  const container = createContainer({ injectionMode: 'PROXY' });

  container.register({
    // Infrastructure
    prisma: asValue(prisma),
    logger: asValue(logger),
    hashPassword: asValue(hashPassword),
    comparePassword: asValue(comparePassword),
    signToken: asValue(signToken),
    verifyToken: asValue(verifyToken),

    // Repositories
    userRepository: asFunction(makeUserRepository).singleton(),
    categoryRepository: asFunction(makeCategoryRepository).singleton(),
    productRepository: asFunction(makeProductRepository).singleton(),
    cartRepository: asFunction(makeCartRepository).singleton(),
    orderRepository: asFunction(makeOrderRepository).singleton(),
    voucherRepository: asFunction(makeVoucherRepository).singleton(),
    memberRepository: asFunction(makeMemberRepository).singleton(),
    portfolioRepository: asFunction(makePortfolioRepository).singleton(),
    addressRepository: asFunction(makeAddressRepository).singleton(),
    eventRepository: asFunction(makeEventRepository).singleton(),
    originRepository: asFunction(makeOriginRepository).singleton(),
    notificationRepository: asFunction(makeNotificationRepository).singleton(),

    // Services
    authService: asFunction(makeAuthService).singleton(),
    productService: asFunction(makeProductService).singleton(),
    categoryService: asFunction(makeCategoryService).singleton(),
    cartService: asFunction(makeCartService).singleton(),
    orderService: asFunction(makeOrderService).singleton(),
    voucherService: asFunction(makeVoucherService).singleton(),
    memberService: asFunction(makeMemberService).singleton(),
    whatsappService: asFunction(makeWhatsappService).singleton(),
    portfolioService: asFunction(makePortfolioService).singleton(),
    userService: asFunction(makeUserService).singleton(),
    addressService: asFunction(makeAddressService).singleton(),
    eventService: asFunction(makeEventService).singleton(),
    originService: asFunction(makeOriginService).singleton(),
    shippingService: asFunction(makeShippingService).singleton(),
  });

  return container;
};
