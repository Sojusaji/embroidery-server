import { Schema, model } from 'mongoose';

const otpSchema = new Schema({

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
    }
}, { timestamps: true,
    
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

otpSchema.index({expiresAt:1},{expireAfterSeconds:0});

const otpModel = model('Otp', otpSchema);
export default otpModel;