import crypto from 'crypto';
import Order from '../../models/Order.js';
import { sendPaymentSuccessfullEmail } from "../../scripts/emailService.js"
import productModel from '../../models/Product.js';
import cartModel from '../../models/Cart.js';

export const razorpayWebhookController = async (req, res, next) => {
    console.log('razorpayWebhookController called ...............')
    try {
        const targetEmail = req.user.gmail;
        console.log('req.body comming from razorpay:', req.body);
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;


        const signature = req.headers['x-razorpay-signature'];
        const hashGenerator = crypto.createHmac('sha256', webhookSecret);
        hashGenerator.update(req.body);
        const digest = hashGenerator.digest('hex');

        if (digest !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        }

        const eventData = JSON.parse(req.body.toString());
        console.log('eventData comming from razorpay:', eventData);
        const event = eventData.event;
        console.log('event comming from razorpay:', event);

        // 5. Handle successful capture event
        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = eventData.payload.payment.entity;
            const razorpayOrderId = paymentEntity.order_id;
            const razorpayPaymentId = paymentEntity.id;

            const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });

            if (order && order.paymentStatus === 'pending') {
                order.paymentStatus = 'completed';
                order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
                await order.save();

                await sendPaymentSuccessfullEmail({
                    targetEmail: targetEmail,
                    customerName: order.deliveryAddress.fullName,
                    orderId: order._id,
                    razorpayPaymentId: razorpayPaymentId,
                    totalAmount: order.totalAmount
                })

                const purchasedProductIds = order.items.map(item => item.productId);
                if (purchasedProductIds && purchasedProductIds.length > 0) {
                    await cartModel.findOneAndUpdate(
                        { userId: order.userId },
                        {
                            $pull: {
                                items: {
                                    productId: {
                                        $in: purchasedProductIds
                                    }
                                }
                            }
                        })
                }

            }
        }

        // 6. Handle failed payment event (Optional: Release stock back if needed)
        if (event === 'payment.failed') {
            const paymentEntity = eventData.payload.payment.entity;
            const razorpayOrderId = paymentEntity.order_id;

            const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
            if (order && order.paymentStatus === 'pending') {
                order.paymentStatus = 'failed';
                await order.save();

                const items = order.items;
                for (const item of items) {
                    await productModel.findByIdAndUpdate(
                        { _id: item.productId },
                        {
                            $inc: {
                                totalStock: item.quantity
                            }
                        }
                    )
                }
            }
        }
        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
};