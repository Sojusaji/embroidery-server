import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from '../../models/Product.js';
import Order from '../../models/Order.js';
import AppError from '../../utils/appError.js';
import { razorpay } from '../../config/razorpayConfig.js'
// Optional: Import your coupon model if applicable
// import Coupon from '../../models/Coupon';

dotenv.config();



const sendIdempotencyResponse = (res, existingOrder, message) => {
  return res.status(200).json({
    success: true,
    orderId: existingOrder.paymentDetails?.razorpayOrderId || existingOrder._id,
    amount: existingOrder.paymentMethod === 'razorpay'
      ? Math.round(existingOrder.totalAmount * 100)
      : existingOrder.totalAmount,
    currency: 'INR',
    dbOrderId: existingOrder._id,
    message,
  });
}

export const createOrder = async (req, res, next) => {

  const userId = req?.user?.id;
  const customerEmail = req?.user?.gmail;

  console.log('userId:', userId, req.user);
  let session = null;

  try {

    const { items, paymentMethod, deliveryAddress, couponCode, idempotencyKey } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("No items provided in the order", 400);
    }

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey }).lean();
      if (existingOrder) {
        return sendIdempotencyResponse(res, existingOrder, 'Retrieved from previous request (Idempotent)');
      }
    }

    session = await mongoose.startSession();

    let createdOrder;
    let totalAmountInPaise = 0;
    let enrichedItems = [];


    await session.withTransaction(async () => {
      const productIds = items.map((i) => i.productId);

      const products = await productModel.find({ _id: { $in: productIds } }).session(session);
      const productMap = new Map(products.map((p) => [p._id.toString(), p]));

      totalAmountInPaise = 0;
      enrichedItems = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new AppError(`Product ${item.productId} not found`, 404);
        }
        if (product.totalStock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }


        const productPriceInPaise = Math.round(product.price * 100);
        const lineTotalInPaise = productPriceInPaise * item.quantity;
        totalAmountInPaise += lineTotalInPaise;

        enrichedItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
          image: product.image,
          lineTotal: lineTotalInPaise / 100,
        });


        const updatedProduct = await productModel.findOneAndUpdate(
          { _id: product._id, totalStock: { $gte: item.quantity } },
          { $inc: { totalStock: -item.quantity, totalOrder: 1 } },
          { session, new: true }
        );

        if (!updatedProduct) {
          throw new AppError(`Stock changed concurrently for ${product.name}. Please try again.`, 400);
        }
      }

      // 3. Optional: Coupon Validation & Discount Calculation
      let finalAmountInPaise = totalAmountInPaise;
      if (couponCode) {
        // TODO: Validate coupon from DB using session, e.g.:
        // const coupon = await Coupon.findOne({ code: couponCode, isActive: true }).session(session);
        // if (!coupon) throw new AppError("Invalid or expired coupon", 400);
        // finalAmountInPaise = Math.round(totalAmountInPaise * (1 - coupon.discountPercent / 100));
      }

      const orderDocs = await Order.create(
        [
          {
            userId: userId,
            customerEmail,
            deliveryAddress,
            items: enrichedItems,
            totalAmount: finalAmountInPaise / 100,
            paymentMethod,
            couponCode,
            idempotencyKey: idempotencyKey || undefined,
            paymentStatus: paymentMethod === 'razorpay' ? 'pending' : 'completed',
          },
        ],
        { session }
      );

      createdOrder = orderDocs[0];
    });

    // 4. Handle External Third-Party API Call (Razorpay) OUTSIDE Transaction
    if (paymentMethod === 'razorpay') {
      let razorpayOrder;
      try {
        const options = {
          amount: Math.round(createdOrder.totalAmount * 100), // Ensures exact amount in paise
          currency: 'INR',
          receipt: `receipt_${createdOrder._id}`,
          notes: {
            userId: userId,
            orderId: createdOrder._id.toString(),
          },
        };

        razorpayOrder = await razorpay.orders.create(options);
      } catch (razorpayError) {
        const rollbackSession = await mongoose.startSession();
        try {
          await rollbackSession.withTransaction(async () => {
            for (const item of enrichedItems) {
              await productModel.findByIdAndUpdate(
                item.productId,
                { $inc: { totalStock: item.quantity, totalOrder: -1 } },
                { session: rollbackSession }
              );
            }
            await Order.findByIdAndUpdate(
              createdOrder._id,
              { paymentStatus: 'failed' },
              { session: rollbackSession }
            );
          });
        } catch (rollbackError) {
          console.error("CRITICAL: Rollback failed after Razorpay error:", rollbackError);
          // Alert monitoring tools (e.g., Sentry, Datadog) here for manual reconciliation
        } finally {
          rollbackSession.endSession();
        }

        throw new AppError("Payment gateway initialization failed. Please try again.", 502);
      }

      // Save Razorpay Reference ID
      createdOrder.paymentDetails = { razorpayOrderId: razorpayOrder.id };
      await createdOrder.save();

      return res.status(200).json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        dbOrderId: createdOrder._id,
      });
    }


    return res.status(200).json({
      success: true,
      orderId: createdOrder._id,
      amount: createdOrder.totalAmount,
      userId: userId,
    });

  } catch (error) {

    if (error.code === 11000 && req.body.idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey: req.body.idempotencyKey }).lean();
      if (existingOrder) {
        return sendIdempotencyResponse(res, existingOrder, 'Retrieved via concurrent idempotency resolution');
      }
    }
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).populate('items.product', 'name price image');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

