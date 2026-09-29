import cron from 'node-cron';
import logger from '../infra/logger/index.js';

export const startAutoCancelOrdersJob = (container) => {
  const orderService = container.resolve('orderService');

  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const count = await orderService.autoExpireOrders();
      if (count > 0) {
        logger.info({ count }, 'Auto-cancelled expired pending orders');
      }
    } catch (err) {
      logger.error({ err }, 'Auto-cancel orders job failed');
    }
  });

  logger.info('Auto-cancel orders job scheduled (every 15 minutes)');
};
