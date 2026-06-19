import { json, Router } from 'express';
const router = Router();
import product from '../controllers/products/productController.js';
const { getProducts, createProduct, uploadProductImage,
  updateProductImage, deleteProduct,
  purgeTrash, getTrashedProducts, restoreProduct } = product;
import { upload } from '../middlewares/upload.js';
import authMiddleware, { restrictTo } from '../middlewares/authMiddleware.js';


router.post('/image-upload',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  upload.single('image'),
  uploadProductImage
);
router.patch('/image-update',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  upload.single('image'),
  updateProductImage
) 



router.delete('/product-delete',
  authMiddleware,
  restrictTo('admin', 'superAdmin'),
  deleteProduct
)

router.route('/')
  .get(getProducts)
  .post(authMiddleware, restrictTo('admin', 'superAdmin'), createProduct);




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
