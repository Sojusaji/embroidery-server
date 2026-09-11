import { Router } from 'express';
const router = Router();
import { createOrder, getOrders } from '../controllers/orders/orderController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js'
import { orderSchema } from "../utils/authValidator.js";

router.route('/')
  .post(authMiddleware, validate(orderSchema), createOrder)
  .get(authMiddleware,getOrders);

export default router;
