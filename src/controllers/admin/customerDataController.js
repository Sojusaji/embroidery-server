import { parse } from "dotenv";
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import mongoose from "mongoose";

export const getCustomersData = async (req, res, next) => {
    try {

        const aggregateResult = await User.aggregate([
            {
                $match: {
                    isDeleted: {
                        $ne: true
                    }
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'result'
                }
            },
            {
                $unwind: {
                    path: "$result",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$result.items",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$username" },
                    email: { $first: "$email" },
                    phone: { $first: "$result.deliveryAddress.phone" },
                    place: { $first: "$result.deliveryAddress.state" },
                    totalSpent: { $sum: "$result.items.lineTotal" },
                    ordersCount: { $addToSet: "$result._id" },
                    joined: { $first: "$createdAt" },
                    status: { $first: "$status" },
                    shippingAddress: { $first: "$result.deliveryAddress" },
                    billingAddress: { $first: "$result.billingAddress" },
                    orderHistory: {
                        $push: {
                            id: "$result._id",
                            date: "$result.createdAt",
                            items: "$result.items.quantity",
                            total: "$result.items.lineTotal",
                            status: "$result.orderStatus"
                        }
                    }
                }
            },
            {
                $addFields: {
                    ordersCount: { $size: "$ordersCount" }
                }
            },

            {
                $group: {
                    _id: null,
                    allUsers: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    _id: 0,
                    allUsers: 1
                }
            }


        ])
        console.log('aggregated result and items length:', aggregateResult[0]?.allUsers, aggregateResult.length);
        const customerData = aggregateResult[0]?.allUsers || []
        return res.status(200).json({
            status: true,
            users: customerData
        })

    } catch (error) {
        next(error)
    }
}


export const blockCustomer = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const customer = await User.findByIdAndUpdate(id,
            { status },
            { new: true, runValidators: true });
        if (!customer) {
            return next(new AppError("User not found", 404));
        }

        return res.status(200).json({
            status: true,
            message: 'Status updated successfully',
            data: customer
        })
    } catch (error) {
        next(error)
    }

}

export const deleteCustomer = async (req, res, next) => {
    const { id } = req.params;
    try {
        const customer = await User.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true, runValidators: true });

        if (!customer) {
            return next(new AppError("User not found", 404));
        }

        return res.status(200).json({
            status: true,
            message: 'Customer deleted successfully'
        })
    } catch (error) {
        next(error);
    }
}


// ORDERS
//  {
//     id: '#ORD-001',
//     customer: 'Alina Starkov',
//     email: 'alina@ravka.com',
//     phone: '+91 98765 43210',
//     address: 'Sun Palace, Os Alta, Ravka - 682001',
//     date: '2026-04-20',
//     total: 1250,
//     status: 'Processing',
//     paymentStatus: 'Paid',
//     items: [{ name: 'Floral Embroidery A', qty: 5, price: 250 }],
//   },

const orderPipeline = async ({ matchedQuery, limit }) => {
    console.log('matchedQuery:', matchedQuery);
    const result = await Order.aggregate([
        {
            $match: matchedQuery
        },
        { $sort: { createdAt: -1, _id: -1 } },
        { $limit: limit + 1 },
        {
            $project: {
                _id: 1,
                id: '$_id',
                userId: 1,
                customerEmail: 1,

                items: 1,
                discountAmount: 1,
                totalAmount: 1,
                paymentMethod: 1,

                deliveryAddress: 1,

                billingAddress: 1,
                orderStatus: 1,
                paymentStatus: 1,

                createdAt: 1,


            }
        }
    ]);

    const orders = result ?? [];
    let nextCursor = null;
    const hasNextPage = orders.length > limit;
    if (hasNextPage) {
        orders.pop();
        const lastItem = orders[orders.length - 1];

        const rawCursor = JSON.stringify({
            createdAt: lastItem.createdAt,
            _id: lastItem._id || lastItem.id

        });

        nextCursor = Buffer.from(rawCursor).toString('base64');
    }

    return {
        orders,
        pagination: {
            nextCursor,
            hasNextPage
        }
    }
}

const fetchPaginatedOrders = async (req, extraMatch) => {
    const limit = parseInt(req.query.limit || 10);

    let matchedQuery = {
        isDeleted: { $ne: true },
        ...extraMatch
    }
    const { cursor } = req.query;
    if (cursor) {
        try {
            const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
            if (!decodedCursor || !decodedCursor.createdAt || !decodedCursor._id) {
                throw new Error('Invalid cursor payload');
            }
            matchedQuery.$or = [
                {
                    createdAt: {
                        $lt: new Date(decodedCursor.createdAt)
                    }
                },
                {
                    createdAt: new Date(decodedCursor.createdAt),
                    _id: { $lt: new mongoose.Types.ObjectId(decodedCursor._id) }
                }
            ]
        } catch (error) {
            throw new Error('Invalid pagination cursor format');
        }

    }
    return orderPipeline({ matchedQuery, limit });
}




export const getOrders = async (req, res, next) => {
    console.log('getOrders funciton called successfully');
    const { status, limit, cursor } = req.query;
    console.log('status,limit and cursor values:', status, limit, cursor);
    try {
        let extraMatch = {};
        const { status } = req.query;
        console.log('status:', status);
        if (status) {
            extraMatch.orderStatus = status;
        }

        const result = await fetchPaginatedOrders(req, extraMatch);
        console.log('full orders:', result);
        return res.status(200).json({
            status: true,
            ...result
        })


    } catch (error) {
        next(error)
    }
}

export const getOrdersCount = async (req, res, next) => {
    try {
        const result = await Order.aggregate([
            {
                $match: {
                    isDeleted: { $ne: true }
                },
            },
            {
                $group: {
                    _id: null,
                    shipped: { $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] } },
                    delivered: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] } },
                    processing: { $sum: { $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] } },
                    total: { $sum: 1 }
                },
            },
            {
                $project: {
                    _id: 0,
                    shipped: 1,
                    cancelled: 1,
                    delivered: 1,
                    processing: 1,
                    pending: 1,
                    total: 1
                }
            }
        ])

        const counts = result[0] || {
            shipped: 0,
            cancelled: 0,
            delivered: 0,
            processing: 0,
            pending: 0,
            total: 0
        }
        return res.status(200).json({
            status: true,
            ordersCount: counts
        })
    } catch (error) {
        next(error);
    }
}