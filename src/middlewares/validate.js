import AppError from '../utils/appError.js';

export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            
            req.body = await schema.validateAsync(req.body, { 
                abortEarly: false,
                stripUnknown: true 
            });
            return next();
        } catch (error) {
    
            const errorMessage = error.details.map(el => el.message).join(', ');
            return next(new AppError(errorMessage, 400));
        }
    };
};