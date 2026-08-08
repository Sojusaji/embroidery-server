import { Router } from 'express';
const router = Router();
import {
  getProducts, createProduct, uploadProductImage,
  updateProductImage, deleteProduct,
  purgeTrash, getTrashedProducts, restoreProduct,
  updateProduct,
  getHomeFeed,
  getProductById
} from '../controllers/products/productController.js';

import { upload } from '../middlewares/upload.js';
import { authMiddleware, restrictTo } from '../middlewares/authMiddleware.js';
import { createProductSchema, categorySchema, updateProductSchema, getOneProductSchema } from "../../src/utils/authValidator.js";
import { validate } from "../middlewares/validate.js";


router.get('/home-feed',getHomeFeed);

router.get('/product-trash',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  getTrashedProducts
);

router.route('/')
  .get(getProducts)
  .post(authMiddleware, restrictTo('admin', 'superAdmin'), validate(createProductSchema), createProduct);




router.post('/image-upload',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  upload.single('image'), validate(categorySchema),
  uploadProductImage
);

router.patch('/image-update',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  upload.single('image'),
  updateProductImage
)

router.get('/:productId',validate(getOneProductSchema),getProductById);

router.patch('/product-update/:productId',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  validate(updateProductSchema),
  updateProduct
)

router.delete('/product-delete',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  deleteProduct
)


router.post('/product-restore',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  restoreProduct
);


router.delete('/product-purge',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  purgeTrash
);

export default router;
