import mongoose from "mongoose";
import Cart from "../../models/Cart.js";
import AppError from "../../utils/appError.js";

export const addToCart = async (req, res, next) => {
    const { items } = req.body;
    const userId = req.user.id;
    try {
        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            cart = await Cart.create({
                userId,
                items: items.map(item => ({
                    productId: new mongoose.Types.ObjectId(item.productId),
                    quantity: item.quantity || 1
                }))
            })
        } else {
            for (const incommingItem of items) {
                const { productId, quantity = 1 } = incommingItem;
                const existingIndex = cart.items.findIndex((item) => item.productId.toString() === productId.toString());
                if (existingIndex > -1) {
                    cart.items[existingIndex].quantity += Number(quantity);
                } else {
                    cart.items.push({
                        productId: new mongoose.Types.ObjectId(productId),
                        quantity: Number(quantity)
                    })
                }
            }
            await cart.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: cart
        });

    } catch (error) {
        next(error);
    }

}

export const fetchCartData = async (req, res, next) => {
    const id = req.user.id;
    try {
        const cartItems = await Cart.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(id),
                }
            },
            {
                $unwind: "$items"
            },
            {
                $lookup: {
                    from: 'products',
                    let: { productId: '$items.productId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$productId']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1, price: 1, image: 1, name: 1
                            }
                        }
                    ],
                    as: "productInfo",
                }
            },
            {
                $unwind: {
                    path: '$productInfo',
                    preserveNullAndEmptyArrays: true

                }

            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { _id: "$items.productId", name: "Product Unavailable", price: 0, image: "" },
                            '$productInfo',
                            { quantity: '$items.quantity' }
                        ]
                    }
                }
            }
        ])

        return res.status(200).json({
            success: true,
            count: cartItems.length,
            cartItems
        });
    } catch (error) {
        next(error);
    }
}