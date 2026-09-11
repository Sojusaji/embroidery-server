import mongoose, { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  // orderType: {
  //   type: String,
  //   enum: ['PRODUCT_PURCHASE', 'CUSTOM_STITCHING'],
  //   required: true,
  // },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      lineTotal: {
        type: Number,
        required: true
      }
    }
  ],
  discountAmount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  // stitchingDetails: {
  //   fabricType: String,
  //   measurements: {
  //     chest: Number,
  //     waist: Number,
  //     hips: Number,
  //     length: Number,
  //     shoulder: Number,
  //   },
  //   specialInstructions: String,
  // },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    required: true
  },
  deliveryAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true }
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true, 
    index: true,
  },
  paymentDetails: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },

  shippingDetails: {
    trackingNumber: { type: String },
    courierPartner: { type: String },
    shippedAt: { type: Date }
  }

}, { timestamps: true });

const Order = model('Order', orderSchema);
export default Order;