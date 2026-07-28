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
    sparse: true
  },
  image: {
    type: String,
    trim: true,
    default: ""
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
  timestamps: true,
  toJSON:{
    virtuals:true,
    transform:(doc,ret)=>{
      ret.id=ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject:{
    virtuals:true
  }

});

userSchema.index({username:'text'})
userSchema.index({ email: 1 });
const userModel = model('User', userSchema);
export default userModel;
