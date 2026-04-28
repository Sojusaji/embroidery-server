import joi from "joi";

export const loginSchema = joi.object({
    email: joi.string()
        .email()
        .pattern(/@gmail\.com$/)
        .required()
        .messages({
            'string.pattern.base': 'Email must be a @gmail.com address',
            "string.empty": "Email is required",
            "string.email": "Email must be a valid email address"
        }),

    password: joi.string().required().trim().min(8).max(30)
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password must be at most 16 characters long"
        })
});

export const registerAdminSchema = joi.object({
    username: joi.string().min(3).max(20).trim().required(),
    gmail: joi.string().email().pattern(/@gmail\.com$/).required(),
    password: joi.string().min(8).max(16).required(),
    role: joi.string().valid('admin', 'superAdmin').default('admin')
});

