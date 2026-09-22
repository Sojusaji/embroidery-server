import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();
import { addToCart, fetchCartData } from "../controllers/cart/cartController.js"


router.route('/')
    .post(authMiddleware, addToCart)
    .get(authMiddleware, fetchCartData);

export default router;