import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true, 
    lowercase:true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select:false
  },
  role: { 
    type: String,
    enum: ['admin', 'superAdmin','user'], 
    default: 'user'
  }
}, {
  timestamps: true
});

const userModel = model('User', userSchema);
export default userModel;
