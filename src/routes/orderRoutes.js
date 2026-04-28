import { Router } from 'express';
const router = Router();
import order from '../controllers/orderController.js';
const { createOrder, getOrders } = order;
import authMiddleware from '../middlewares/authMiddleware.js';

router.route('/')
  .post(createOrder)
  .get(authMiddleware, getOrders);

export default router;
