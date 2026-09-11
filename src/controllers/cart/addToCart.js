import Cart from "../../models/Cart.js";

export const addToCart = async (req, res, next) => {
    const { items } = req.body;
    try {
        const addedtoCart = await Cart.create(items)


    } catch (error) {
        next(error);
    }

}