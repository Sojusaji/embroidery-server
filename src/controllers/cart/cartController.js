import mongoose from "mongoose";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";


export const addToCart = async (req, res, next) => {
    const { items } = req.body;
    const userId = req.user.id;
    try {

        const [cart, products] = await Promise.all([
            Cart.findOne({ userId }),
            Product.find({ _id: { $in: items.map((i) => i.productId) } })
        ])

        const productMap = new Map();
        products.forEach(p => productMap.set(p._id.toString(), p));

        const batchQuantityMap = new Map();

        for (const incomingItem of items) {
            const { productId, quantity = 1 } = incomingItem;
            const product = productMap.get(productId.toString());

            if (!product) {
                return res.status(404).json({
                    status: false,
                    message: `Product not found: ${productId}`
                });
            }

            const existingCartItem = cart?.items?.find((item) => item.productId.toString() === productId.toString());
            const existingQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;
            const currentBatchQuantity = batchQuantityMap.get(productId.toString()) || 0;
            const addedNow = currentBatchQuantity + Number(quantity);

            batchQuantityMap.set(productId.toString(),addedNow);
            const requestedTotalQuantity = existingQuantityInCart + addedNow;

            if (product.totalStock < requestedTotalQuantity) {
                return res.status(400).json({
                    status: false,
                    message: `Insufficient stock for ${product.name}. You have ${existingQuantityInCart} in cart, and only ${product.totalStock} available in total.`,
                });
            }

        }


        let updatedItems = cart && cart.items ? [...cart.items] : [];

        for (const incommingItem of items) {
            const { productId, quantity = 1 } = incommingItem;
            const existingIndex = updatedItems.findIndex((item) => item.productId.toString() === productId.toString());
            if (existingIndex > -1) {
                updatedItems[existingIndex].quantity += Number(quantity);
            } else {
                updatedItems.push({
                    productId: new mongoose.Types.ObjectId(productId),
                    quantity: Number(quantity)
                })
            }
        }
        const savedCart = await Cart.findOneAndUpdate(
            { userId },
            {
                $set: {
                    items: updatedItems
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        )

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: savedCart
        });

    } catch (error) {
        next(error);
    }

}

export const fetchCartData = async (req, res, next) => {
    const id = req.user.id;
    try {
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
                                _id: 1, price: 1, image: 1, name: 1, totalStock: 1
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

export const updateCartItemQuantity = async (req, res, next) => {
    const { productId, change } = req.body;
    const userId = req.user.id;
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                status: false,
                message: 'Cart not found'
            })
        }
        const cartItem = cart.items.find((item) =>
            item.productId.toString() === productId.toString()
        )

        if (!cartItem) {
            return res.status(404).json({
                status: false,
                message: 'product not found in cart'
            })
        }
        const currentQuantity = cartItem.quantity;
        const newQuantity = currentQuantity + change;
        if (newQuantity <= 0) {
            const updatedCart = await Cart.findOneAndUpdate(
                { userId },
                {
                    $pull: {
                        items: { productId }
                    }
                },
                {
                    new: true
                }
            )
            return res.status(200).json({
                status: true,
                message: 'Item removed from cart',
                cart: updatedCart
            })
        }

        if (change > 0) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    status: false,
                    message: 'Product not found'
                })
            }
            if (product.totalStock < newQuantity) {
                return res.status(400).json({
                    status: false,
                    message: `Only ${product.totalStock} items available in stock`
                })
            }
        }
        const updatedCart = await Cart.findOneAndUpdate(
            { userId, "items.productId": productId },
            {
                $set: {
                    "items.$.quantity": newQuantity
                }
            }, {
            new: true
        }

        )
        return res.status(200).json({
            status: true,
            message: 'Cart quantity updated successfully',
            cart: updatedCart,
        })

    } catch (error) {
        next(error)
    }
}


export const removeCartItem = async (req, res, next) => {
    const { productId } = req.body;
    const userId = req.user.id;
    try {
        const updatedCart = await Cart.findOneAndUpdate(
            { userId },
            {
                $pull: {
                    items: { productId }
                }
            },
            {
                new: true
            }
        );
        if (!updatedCart) {
            return res.status(404).json({
                status: false,
                message: "Cart not found",
            })
        }
        return res.status(200).json({
            status: true,
            message: "Item removed successfully",
            cart: updatedCart
        })

    } catch (error) {
        next(error)
    }
}