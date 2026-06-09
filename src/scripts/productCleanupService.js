import productModel from '../models/Product.js';
import githubServices from './githubServices.js';

export const hardDeleteProducts = async (products) => {
  if (!products || products.length === 0) return 0;

  let deletedCount = 0;

  for (const product of products) {
    try {
      const filePath = product.imageInfo?.filePath;
      const sha = product.imageInfo?.sha;

      
      if (sha && filePath) {
        await githubServices.deleteImage(sha, filePath);
      }

    
      await productModel.findByIdAndDelete(product._id);
      deletedCount++;
    } catch (error) {
      console.error(`Failed to purge product ${product._id}:`, error);
    }
  }

  return deletedCount;
};