import { Router } from "express";
const router = Router();
import  {addToCart} from "../controllers/cart/cartController.js"


router.route('/')
    .post(addToCart);

export default router;