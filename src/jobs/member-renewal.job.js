import cron from 'node-cron';
import logger from '../infra/logger/index.js';

export const startMemberRenewalJob = (container) => {
  const userRepository = container.resolve('userRepository');
  const memberRepository = container.resolve('memberRepository');

  cron.schedule('5 0 * * *', async () => {
    logger.info('Running member renewal job');
    try {
      const settings = await memberRepository.getSettings();
      const now = new Date();

      // Find members whose memberExpiry has passed
      const expiredMembers = await userRepository.findExpiredMembers();

      for (const user of expiredMembers) {
        // Check spend during their membership period
        const periodStart = user.memberSince ?? user.createdAt;
        const currentSpend = await memberRepository.getUserPeriodSpend(user.id, periodStart);

        if (currentSpend >= settings.minMonthlyAmount) {
          // Renew for another period
          const memberExpiry = new Date(now);
          memberExpiry.setDate(memberExpiry.getDate() + settings.renewalPeriodDays);
          await userRepository.updateMembership(user.id, {
            memberSince: now,
            memberExpiry,
          });
          logger.info({ userId: user.id, currentSpend }, 'Membership renewed');
        } else {
          // Did not meet spend threshold — expire, reset period to now
          await userRepository.updateMembership(user.id, {
            isMember: false,
            memberSince: null,
            memberExpiry: null,
            memberPeriodStart: now,
          });
          logger.info({ userId: user.id, currentSpend }, 'Membership expired — reset period');
        }
      }

      logger.info('Member renewal job completed');
    } catch (err) {
      logger.error({ err }, 'Member renewal job failed');
    }
  });

  logger.info('Member renewal job scheduled');
};
