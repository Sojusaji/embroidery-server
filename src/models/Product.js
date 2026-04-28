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
  category: {
    type: String,
    required: true, // 'Embroidery Art', 'Stitched Clothes', etc.
  },
  inStock: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });


const productModel=model('Product', productSchema);
export default productModel;
