import { Router } from 'express';
const router = Router();
import {
  getProducts, createProduct, uploadProductImage,
  updateProductImage, deleteProduct,
  purgeTrash, getTrashedProducts, restoreProduct,
  updateProduct
} from '../controllers/products/productController.js';

import { upload } from '../middlewares/upload.js';
import { authMiddleware, restrictTo } from '../middlewares/authMiddleware.js';
import { createProductSchema, categorySchema, updateProductSchema } from "../../src/utils/authValidator.js";
import { validate } from "../middlewares/validate.js";





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

router.route('/')
  .get(getProducts)
  .post(authMiddleware, restrictTo('admin', 'superAdmin'), validate(createProductSchema), createProduct);




router.get('/product-trash',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  getTrashedProducts
);


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
