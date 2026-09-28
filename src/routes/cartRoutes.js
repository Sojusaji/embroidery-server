import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();
import { addToCart, fetchCartData, updateCartItemQuantity, removeCartItem } from "../controllers/cart/cartController.js"
import { validate } from "../middlewares/validate.js";
import { addToCartSchema, updateCartQuantitySchema, removeCartItemSchema } from "../utils/authValidator.js"

router.route('/')
    .post(authMiddleware, validate(addToCartSchema), addToCart)
    .get(authMiddleware, fetchCartData)
    .patch(authMiddleware, validate(updateCartQuantitySchema), updateCartItemQuantity)
    

router.route('/:productId').delete(authMiddleware, validate(removeCartItemSchema), removeCartItem)

export default router;