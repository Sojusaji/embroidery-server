import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  customerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  orderType: {
    type: String,
    enum: ['PRODUCT_PURCHASE', 'CUSTOM_STITCHING'],
    required: true,
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
      }
    }
  ],
  stitchingDetails: {
    fabricType: String,
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      length: Number,
      shoulder: Number,
    },
    specialInstructions: String,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELled'],
    default: 'PENDING',
  },
  totalAmount: {
    type: Number,
  }
}, { timestamps: true });

const orderModel = model('Order', orderSchema);
export default orderModel;
