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
        // index: { expiresAfterSeconds: 0 }
    }
}, { timestamps: true });

otpSchema.index({expiresAt:1},{expireAfterSeconds:0});

const otpModel = model('Otp', otpSchema);
export default otpModel;