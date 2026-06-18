import AppError from "../../utils/appError.js";
import User from "../../models/User.js";
import { identifyLoginInput } from "../../utils/identifyInput.js";

export const verifyUser = async (req, res, next) => {
    const { data } = req.body;
    if(!data.trim()){
        return next(new AppError('No data provided',400))
    }
    const identification = identifyLoginInput(data);
    if(!identification.type || identification.type === 'invalid'){
         return next(new AppError('Invalid data',400))
    }
    
}