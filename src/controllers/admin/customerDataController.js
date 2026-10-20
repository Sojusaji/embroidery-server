import User from "../../models/User.js";

export const getCustomersData = async (req, res, next) => {
    try {

        const aggregateResult = await User.aggregate([
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
                    billingAddress:{$first:"$result.billingAddress"},
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