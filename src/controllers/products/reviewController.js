import mongoose from 'mongoose';
import Review from '../../models/Review.js';
import Product from '../../models/Product.js';
import AppError from '../../utils/appError.js';


export const getProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.id || req.params.productId;

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const skip = (page - 1) * limit;

    const totalReviews = await Review.countDocuments({ product: productId });

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


    const breakdownAggregation = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdownAggregation.forEach((item) => {
      if (item._id >= 1 && item._id <= 5) {
        breakdown[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          totalReviews,
          totalPages: Math.ceil(totalReviews / limit) || 1,
          currentPage: page,
          limit,
          hasNextPage: page < Math.ceil(totalReviews / limit),
          hasPrevPage: page > 1,
        },
        rating: product.rating || 0,
        numReviews: product.numReviews || 0,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const createProductReview = async (req, res, next) => {
  try {
    const productId = req.params.id || req.params.productId;
    const { rating, comment } = req.body;

    const numericRating = Number(rating);
  

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }


    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id,
    });

    if (existingReview) {
      return next(new AppError('You have already submitted a review for this product', 400));
    }


    const review = await Review.create({
      product: productId,
      user: req.user.id,
      name: req.user.name || 'Verified Customer',
      rating: numericRating,
      comment: comment.trim(),
    });

    const updatedProduct = await Product.findById(productId).select('rating numReviews');

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review,
      productRating: updatedProduct?.rating || numericRating,
      numReviews: updatedProduct?.numReviews || 1,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('You have already submitted a review for this product', 400));
    }
    next(error);
  }
};
