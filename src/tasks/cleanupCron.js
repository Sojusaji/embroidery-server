import cron from 'node-cron';
import productModel from '../models/Product.js';
import { hardDeleteProducts } from '../scripts/productCleanupService.js';

export const initCleanupCron = () => {
  
  // Scheduling syntax: "0 0 * * *" means "Run every day at exactly 12:00 AM Midnight"
  cron.schedule('0 0 * * *', async () => {
    console.log('🤖 Running scheduled background task: Purging expired trash items...');

    try {
      // Calculate the timestamp cutoff for 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find products that were soft-deleted MORE than 30 days ago
      const expiredProducts = await productModel.find({
        isDeleted: true,
        deletedAt: { $lte: thirtyDaysAgo } // $lte means "Less Than or Equal to"
      });

      if (expiredProducts.length > 0) {
        const purgedCount = await hardDeleteProducts(expiredProducts);
        console.log(`🧹 Auto-cleanup complete. Permanent clean count: ${purgedCount} items.`);
      } else {
        console.log('🧹 Auto-cleanup checked. No expired products found.');
      }

    } catch (error) {
      console.error('❌ Error during automated cron cleanup job:', error);
    }
  });
};