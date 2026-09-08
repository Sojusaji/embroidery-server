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

const uniquenessValidator = (items, helpers) => {
  const seen = new Set();
  for (let item of items) {
    const compositeKey = `${item.productId}_${item.variantId || 'none'}`;
    if (seen.has(compositeKey)) {
      return helpers.error('array.unique');
    }
    seen.add(compositeKey);
  }
  return items

}

export const orderSchema = joi.object({
  body: joi
    .object({
      items: joi
        .array()
        .items(
          joi
            .object({
              productId: joi
                .string()
                .trim()
                .custom(objectIdValidator)
                .required()
                .messages({
                  'string.base': 'Product ID must be text.',
                  'string.pattern.base': 'Invalid Product ID format.',
                  'any.required': 'Product ID is required.',
                }),

              quantity: joi
                .number()
                .integer()
                .min(1)
                .max(99)
                .required()
                .messages({
                  'number.base': 'Quantity must be a number.',
                  'number.integer': 'Quantity must be an integer.',
                  'number.min': 'Quantity must be at least 1.',
                  'number.max': 'Quantity cannot exceed 99 units.',
                  'any.required': 'Quantity is required.',
                }),

              variantId: joi
                .string()
                .trim()
                .custom(objectIdValidator)
                .empty('')
                .optional()
                .messages({
                  'string.base': 'VariantId must be string ',
                  'string.pattern.base': 'Invalid Variant ID format.',
                })
            })
            .unknown(false)
        )
        .custom(uniquenessValidator)
        .min(1)
        .required()
        .messages({
          'array.base': 'Items must be an array.',
          'array.min': 'Cart must contain at least one item.',
          'array.unique': 'Duplicate products found in item list.',
          'any.required': 'Cart items are required.',
        }),
      idempotencyKey: joi
        .string()
        .guid({ version: ['uuidv4'] })
        .required()
        .messages({
          'string.base': 'Idempotency key must be text.',
          'string.guid': 'Idempotency key must be a valid UUIDv4.',
          'any.required': 'Idempotency key is missing. Please retry checkout.',
        }),
      paymentMethod: joi
        .string()
        .trim()
        .lowercase()
        .valid('razorpay', 'cod')
        .required()
        .messages({
          'string.base': 'Payment method must be text.',
          'any.only': 'Payment method must be either "razorpay" or "cod".',
          'any.required': 'Payment method is required.',
        }),

      deliveryAddress: joi
        .object({
          fullName: joi.string().trim().empty('').required().messages({
            'any.required': 'Full name is required for delivery.',
          }),
          phone: joi.string().trim().empty('').required().messages({
            'any.required': 'Phone number is required for delivery agents.',
          }),
          addressLine: joi.string().trim().empty('').required().messages({
            'any.required': 'Address line is required.',
          }),
          city: joi.string().trim().empty('').required().messages({
            'any.required': 'City is required.',
          }),
          postalCode: joi.string().trim().empty('').required().messages({
            'any.required': 'Postal code is required.',
          }),
          state: joi.string().trim().empty('').required().messages({
            'any.required': 'State is required.',
          }),
          country: joi.string().trim().empty('').required().messages({
            'any.required': 'Country is required.',
          }),
        })
        .required()
        .messages({
          'any.required': 'Delivery address is required.',
        }),

      couponCode: joi
        .string()
        .trim()
        .uppercase()
        .empty('')
        .optional()
        .messages({
          'string.base': 'CouponCode must be string '
        })
    })
    .unknown(false)
    .required()
    .messages({
      'any.required': 'Please ensure all mandatory datas are entered'
    })
});
