import { model, Schema } from "mongoose";

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            variantId: {
                type: Schema.Types.ObjectId,
                ref: 'Variant',
                default: null
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity cannot be less than 1']
            },

        }
    ],
}, {
    timestamps: true
});

cartSchema.index({ userId: 1 });
const cartModel = model('Cart', cartSchema);
export default cartModel;