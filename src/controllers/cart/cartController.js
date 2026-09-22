import mongoose from "mongoose";
import Cart from "../../models/Cart.js";


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
        const haveCart = await Cart.findOne({ userId: id });
        if (!haveCart) {
            return res.status(400).json({
                status: false,
                message: 'Cart not found'
            })
        }
        const aggregateResult = await Cart.aggregate([
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
            },
            {
                $facet: {
                    cartItems: [
                        {
                            $match: {}
                        }
                    ],
                    totalQuantity: [
                        {
                            $group: {
                                _id: null,
                                total: {
                                    $sum: '$quantity'
                                }
                            }
                        }
                    ],
                    grandTotal: [
                        {
                            $group: {
                                _id: null,
                                totalAmount: {
                                    $sum: {
                                        $multiply: [
                                            '$price', '$quantity'
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ])

        const facetData = aggregateResult[0] || { cartItems: [], totalQuantity: [], grandTotal: [] };
        const cartItems = facetData.cartItems;
        const totalQuantity = facetData.totalQuantity[0]?.total ?? 0;
        const grandTotal = facetData.grandTotal[0]?.totalAmount ?? 0;

        return res.status(200).json({
            success: true,
            count: cartItems.length,
            totalQuantity,
            grandTotal,
            cartItems

        });
    } catch (error) {
        next(error);
    }
}