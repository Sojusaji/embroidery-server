import {Schema,model} from "mongoose";

const tokenSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    refreshToken:{
        type:String,
        required:true
    }
})

const tokenModel = model('Token',tokenSchema);
export default tokenModel;
