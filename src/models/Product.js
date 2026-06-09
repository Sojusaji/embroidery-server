import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true, // Path to image
  },
  imageInfo: {
    filePath: {
      type: String,
      required: true,
    },
    sha: {
      type: String,
      required: true,
    }
  },
  category: {
    type: String,
    required: true,
  },
  totalStock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  totalOrder: {
    type: Number,
    default: 0,
    min: 0
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });


const productModel = model('Products', productSchema);
export default productModel;
