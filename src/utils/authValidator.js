import joi from 'joi';
import mongoose from 'mongoose';

export const userLoginSchema = joi.object({
  body: joi.object({
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
  }).required()
});



export const emailValidationSchema = joi.object({

  body: joi.object({
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
  }).required()
});


export const accountRegistrationSchema = joi.object({
  body: joi.object({
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
  }).required()
})


export const createProductSchema = joi.object({
  body: joi.object({
    name: joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.base': 'Name must be a text string.',
        'string.empty': 'Product name is required.',
        'string.min': 'Name must be at least 2 characters long.',
        'string.max': 'Name cannot exceed 100 characters.',
        'any.required': 'Product name is required.'
      }),

    description: joi.string()
      .trim()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.base': 'Description must be a text string.',
        'string.empty': 'Description is required.',
        'string.min': 'Description should be at least 10 characters.',
        'string.max': 'Description cannot exceed 2000 characters.',
        'any.required': 'Description is required.'
      }),

    price: joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Price must be a valid number.',
        'number.positive': 'Price must be greater than 0.',
        'any.required': 'Price is required.'
      }),

    comparePrice: joi.number()
      .positive()
      .precision(2)
      .greater(joi.ref('price'))
      .allow(null)
      .empty('')
      .optional()
      .messages({
        'number.base': 'Compare price must be a valid number.',
        'number.positive': 'Compare price must be positive.',
        'number.greater': 'Compare price must be higher than regular price.'
      }),

    sku: joi.string()
      .trim()
      .uppercase()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.base': 'SKU must be a string.',
        'string.empty': 'SKU is required.',
        'string.alphanum': 'SKU can only contain letters and numbers.',
        'any.required': 'SKU is required.'
      }),

    category: joi.string()
      .trim()
      .valid('embroidery', 'stitching', 'ornaments')
      .required()
      .messages({
        'any.only': 'Category must be embroidery, stitching, or ornaments.',
        'any.required': 'Category is required.'
      }),

    totalStock: joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Stock must be a number.',
        'number.integer': 'Stock must be a whole integer.',
        'number.min': 'Stock cannot be negative.',
        'any.required': 'Stock quantity is required.'
      }),

    status: joi.string()
      .valid('active', 'draft')
      .default('active')
      .messages({
        'any.only': 'Status must be either active or draft.'
      }),

    tags: joi.array()
      .items(joi.string().trim())
      .default([])
      .messages({
        'array.base': 'Tags must be an array of strings.'
      }),

    isFeatured: joi.boolean()
      .default(false),

    image: joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'Image must be a valid URL.',
        'any.required': 'Product image URL is required.'
      }),

    imageInfo: joi.object({
      filePath: joi.string().required().messages({
        'any.required': 'Image file path is required.'
      }),
      sha: joi.string().required().messages({
        'any.required': 'Image SHA is required.'
      })
    }).required().messages({
      'any.required': 'Image metadata (imageInfo) is required.'
    })
  }).required()
});


export const categorySchema = joi.object({
  body: joi.object({
    category: joi.string()
      .trim()
      .valid('embroidery', 'stitching', 'ornaments')
      .required()
      .messages({
        'any.only': 'Category must be embroidery, stitching, or ornaments.',
        'any.required': 'Category is required.'
      }),
  }).required()
})


const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('Invalid product ID format');
  }
  return value;
};


export const getOneProductSchema = joi.object({
  params: joi.object({
    productId: joi.string().custom(objectIdValidator).required().messages({
      'any.required': 'Product ID is required ',
    }),
  }).required(),
})


export const updateProductSchema = joi.object({
  params: joi.object({
    productId: joi.string().custom(objectIdValidator).required().messages({
      'any.required': 'Product ID is required ',
    }),
  }).required(),

  body: joi.object({
    name: joi.string().trim().min(2).max(120).messages({
      'string.min': 'Product name must be at least 2 characters long',
      'string.max': 'Product name cannot exceed 120 characters',
    }),

    description: joi.string().trim().max(2000).allow(''),

    price: joi.number().positive().precision(2).messages({
      'number.positive': 'Price must be greater than 0',
    }),

    comparePrice: joi.number().positive().precision(2).allow(null, '').greater(joi.ref('price')).messages({
      'number.greater': 'Compare-at price must be greater than the selling price',
    }),

    sku: joi.string().trim().uppercase().max(50).allow(''),

    totalStock: joi.number().integer().min(0).messages({
      'number.min': 'Stock quantity cannot be negative',
    }),

    status: joi.string().valid('active', 'draft').default('active'),

    tags: joi.array().items(joi.string().trim()).single(),

    isFeatured: joi.boolean(),

    inStock: joi.boolean(),

    image: joi.string().uri().allow(''),

    imageInfo: joi.object({
      filePath: joi.string().optional(),
      sha: joi.string().optional(),
    }).optional(),

    category: joi.string().trim().valid(
      'embroidery',
      'stitching',
      'ornaments'
    ),
  })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided to update the product',
    })
});