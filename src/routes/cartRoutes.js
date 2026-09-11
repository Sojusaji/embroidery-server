import { Router } from "express";
const router = Router();
import { addToCart } from "../controllers/cart/addToCart.js"

console.log('Controller function:', addToCart);
router.route('/')
    .post(addToCart);

export default router;