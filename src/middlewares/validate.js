import AppError from '../utils/appError.js';

export const validate = (schema) => {
    return async (req, res, next) => {

        try {

            const dataToValidate = {
                params: req.params,
                body: req.body,
                query: req.query,
            };

            const value = await schema.validateAsync(dataToValidate,
                {
                    abortEarly: false,
                    stripUnknown: true
                });
            if (value.body) req.body = value.body;
            if (value.params) req.params = value.params;


            if (value.query) {
                Object.keys(req.query).forEach((key) => delete req.query[key]); 
                Object.assign(req.query, value.query);
            }
           
            return next();
        } catch (error) {
            console.log('error occuired :', error);
            if (error.isJoi || error.details) {
                const errorMessage = error.details.map((el) => el.message).join(', ');
                return next(new AppError(errorMessage, 400));
            }

            return next(error);
        }
    };
};