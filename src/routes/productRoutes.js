import { json, Router } from 'express';
const router = Router();
import product from '../controllers/productController.js';
const { getProducts, createProduct,uploadProductImage } = product;
import { upload } from '../middlewares/upload.js';
import authMiddleware, { restrictTo } from '../middlewares/authMiddleware.js';
router.post('/upload',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  upload.single('image'),
 uploadProductImage
);

router.route('/')
  .get(getProducts)
  .post(authMiddleware, createProduct);

export default router;
