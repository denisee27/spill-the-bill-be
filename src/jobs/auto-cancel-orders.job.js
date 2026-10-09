import cron from 'node-cron';
import logger from '../infra/logger/index.js';

export const startAutoCancelOrdersJob = (container) => {
  const orderService = container.resolve('orderService');

  // Run every minute to catch 5-minute payment expiry
  cron.schedule('* * * * *', async () => {
    try {
      const count = await orderService.autoExpireOrders();
      if (count > 0) {
        logger.info({ count }, 'Auto-cancelled expired pending orders');
      }
    } catch (err) {
      logger.error({ err }, 'Auto-cancel orders job failed');
    }
  });

  logger.info('Auto-cancel orders job scheduled (every 1 minute)');
};
