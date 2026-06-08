import productModel from '../models/Product.js';
import githubServices from "../scripts/githubServices.js";
import AppError from '../utils/appError.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res,next) => {
  try {
    const { name, description, price, image, category, imagefilePath, sha, totalStock } = req.body;

    if (!name || !price || !image || !sha || !imagefilePath || !category || !totalStock) {
      return next(new AppError('Please provide all required fields',400));
    }

    const product = new productModel({
      name,
      description: description || 'Premium Quality',
      price,
      image,
      imageInfo: {
        filePath: imagefilePath,
        sha
      },
      category,
      totalStock,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error)
  }
};


const uploadProductImage = async (req, res, next) => {
  try {

    if (!req.file || !req.file.buffer) {
      return next(new AppError('No image file provided', 400));
    }
    const { category } = req.body;
    if (!category) {
      return next(new AppError('Folder name is required', 400));
    }

    const result = await githubServices.uploadImage(
      req.file.buffer,
      category
    );
    res.status(201).json({
      success: true,
      message: 'Image uploaded to GitHub successfully',
      data: {
        filePath: result.filePath,
        imageUrl: result.imageUrl,
        sha: result.sha
      }
    });

  } catch (error) {
    next(error);
  }
}


const updateProductImage = async (req, res, next) => {
  try {

    if (!req.file || !req.file.buffer) {
      return next(new AppError('No image file provided', 400));
    }
    console.log('req.body:', req.body);
    const { filePath, sha } = req.body;
    if (!filePath || !sha) {
      return next(new AppError('Image datas are missing', 400));
    }

    const result = await githubServices.updateImage(
      req.file.buffer,
      sha,
      filePath
    );
    res.status(201).json({
      success: true,
      message: 'Image updated successfully',
      data: {
        filePath: result.filePath,
        sha: result.sha,
        imageUrl: result.imageUrl
      }
    });

  } catch (error) {
    next(error);
  }
}


const deleteProductImage = async (req, res, next) => {
  try {

    console.log('req.body:', req.body);
    const { filePath, sha } = req.body;
    if (!filePath || !sha) {
      return next(new AppError('Image datas are missing', 400));
    }

    const result = await githubServices.deleteImage(
      sha,
      filePath
    );

    res.status(200).json({
      success: result.success,
      message: result.message,
    });

  } catch (error) {
    next(error);
  }
}

export default { getProducts, createProduct, uploadProductImage, updateProductImage, deleteProductImage };
