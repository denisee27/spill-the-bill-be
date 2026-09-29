import cron from 'node-cron';
import logger from '../infra/logger/index.js';

export const startMemberRenewalJob = (container) => {
  const userRepository = container.resolve('userRepository');
  const memberRepository = container.resolve('memberRepository');
  const orderRepository = container.resolve('orderRepository');

  // Run daily at 00:05
  cron.schedule('5 0 * * *', async () => {
    logger.info('Running member renewal job');

    try {
      // Step 1: Expire members whose memberExpiry < now
      const expiredMembers = await userRepository.findExpiredMembers();
      for (const user of expiredMembers) {
        await userRepository.updateMembership(user.id, {
          isMember: false,
          memberSince: null,
          memberExpiry: null,
        });
        logger.info({ userId: user.id }, 'Membership expired');
      }

      // Step 2: Check if non-members qualify based on monthly spending
      const settings = await memberRepository.getSettings();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const nonMembersWithOrders = await userRepository.findNonMembersWithOrders(startOfMonth);

      for (const user of nonMembersWithOrders) {
        const monthlyTotal = user.orders.reduce((sum, o) => sum + o.total, 0);
        if (monthlyTotal >= settings.minMonthlyAmount) {
          const memberSince = new Date();
          const memberExpiry = new Date(memberSince);
          memberExpiry.setDate(memberExpiry.getDate() + settings.renewalPeriodDays);

          await userRepository.updateMembership(user.id, {
            isMember: true,
            memberSince,
            memberExpiry,
          });
          logger.info({ userId: user.id, monthlyTotal }, 'Membership granted');
        }
      }

      logger.info('Member renewal job completed');
    } catch (err) {
      logger.error({ err }, 'Member renewal job failed');
    }
  });

  logger.info('Member renewal job scheduled');
};
