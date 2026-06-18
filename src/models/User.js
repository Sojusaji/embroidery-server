import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true, 
    lowercase: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true,
    trim: true
  },
  
  mobileNumber: {
    type: String, 
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
       return this.role === 'admin' || this.role === 'superAdmin';
    },
    select: false,
    trim: true
  },
 
  otp: {
    type: String,
    select: false
  },

  otpExpiry: {
    type: Date,
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

userSchema.pre('validate', function(next) {
  if (this.isNew || this.isModified()) {
    if (!this.email && !this.mobileNumber) {
      this.invalidate('email', 'An account must feature either an email address or a mobile number.');
    }
  }
  next();
});

const userModel = model('User', userSchema);
export default userModel;
