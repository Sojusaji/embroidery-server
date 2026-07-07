import { parse } from 'dotenv';
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    sparse: true,
    trim: true,
  },
  googlesub: {
    type: String,
    unique: true,
    sparse:true
  },
  image: {
    type: String,
    trim: true,
    default: ""
  },
  password: {
    type: String,
    required: function () {
      return this.role === 'admin' || this.role === 'superAdmin';
    },
    select: false,
    trim: true
  },

  isVerified: {
    type: Boolean,
    default: false,
    select: false
  },

  role: {
    type: String,
    enum: ['admin', 'superAdmin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
const userModel = model('User', userSchema);
export default userModel;
