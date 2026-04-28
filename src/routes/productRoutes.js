import { Router } from 'express';
const router = Router();
import product from '../controllers/productController.js';
const { getProducts, createProduct } = product;
// import upload from '../middlewares/upload.js';
import authMiddleware from '../middlewares/authMiddleware.js';

// router.post('/upload', authMiddleware,
//   (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'Please upload an image' });
//   }
//   res.json({ imageUrl: `/uploads/${req.file.filename}` });
// });

router.route('/')
  .get(getProducts)
  .post(authMiddleware, createProduct);

export default router;
