import joi from 'joi';

export const adminLoginSchema = joi.object({
    email: joi.string()
        .trim()
        .lowercase()
        .email()
        .max(100)
        .pattern(/@gmail\.com$/)
        .required()
        .messages({
            'string.base': 'Email must be text data.',
            'string.pattern.base': 'Email must be a @gmail.com address.',
            'string.empty': 'Email cannot be left blank.',
            'string.email': 'Email must be a valid email address.',
            'string.max': 'Email cannot exceed 100 characters.',
            'any.required': 'Email is a required field.'
        }),

    password: joi.string()
        .trim()
        .min(8)
        .max(30)
        .required()
        .messages({
            'string.base': 'Password must be text data.',
            'string.empty': 'Password cannot be left blank.',
            'string.min': 'Password must be at least 8 characters long.',
            'string.max': 'Password must be at most 30 characters long.',
            'any.required': 'Password is a required field.'
        })
});

export const userLoginSchema = joi.object({
    email: joi.string()
        .trim()
        .lowercase()
        .email()
        .max(100)
        .pattern(/@gmail\.com$/)
        .required()
        .messages({
            'string.base': 'Email must be text data.',
            'string.pattern.base': 'Email must be a @gmail.com address.',
            'string.empty': 'Email cannot be left blank.',
            'string.email': 'Email must be a valid email address.',
            'string.max': 'Email cannot exceed 100 characters.',
            'any.required': 'Email is a required field.'
        }),

    otp: joi.string()
        .trim()
        .length(6)
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            'string.base': 'OTP must be text data.',
            'string.pattern.base': 'OTP must consist of numbers only.',
            'string.empty': 'OTP cannot be left blank.',
            'string.length': 'OTP must be exactly 6 characters.',
            'any.required': 'OTP is a required field.'
        })
});



export const emailValidationSchema = joi.object({
    email: joi.string()
        .trim()
        .lowercase()
        .email()
        .max(100)
        .pattern(/@gmail\.com$/)
        .required()
        .messages({
            'string.base': 'Email must be text data.',
            'string.pattern.base': 'Email must be a @gmail.com address.',
            'string.empty': 'Email cannot be left blank.',
            'string.email': 'Email must be a valid email address.',
            'string.max': 'Email cannot exceed 100 characters.',
            'any.required': 'Email is a required field.'
        })
});


export const accountRegistrationSchema = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.base': 'Name must be text data.',
            'string.empty': 'Name cannot be left blank.',
            'string.min': 'Name must be at least 2 characters long.',
            'string.max': 'Name cannot exceed 50 characters.',
            'any.required': 'Name is a required field.'
        }),

    email: joi.string()
        .trim()
        .lowercase()
        .email()
        .max(100)
        .pattern(/@gmail\.com$/)
        .required()
        .messages({
            'string.base': 'Email must be text data.',
            'string.pattern.base': 'Email must be a @gmail.com address.',
            'string.empty': 'Email cannot be left blank.',
            'string.email': 'Email must be a valid email address.',
            'string.max': 'Email cannot exceed 100 characters.',
            'any.required': 'Email is a required field.'
        })
})

