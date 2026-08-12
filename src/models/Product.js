import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  comparePrice: {
    type: Number,
    default: null
  },
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  image: {
    type: String,
    required: [true, 'Main product image URL is required'],
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
    required: [true, 'Category is required'],
    enum: ['embroidery', 'stitching', 'ornaments'],
    index: true,
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
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'draft'],
    default: 'active',
    index: true
  },
  tags: [
    {
      type: String,
      trim: true
    }
  ],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
}

);
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1, isDeleted: 1, _id: -1, createdAt: -1 });

const productModel = model('Products', productSchema);
export default productModel;
