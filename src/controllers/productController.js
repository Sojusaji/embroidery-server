import productModel from '../models/Product.js';
import githubServices from "../scripts/githubServices.js";
import AppError from '../utils/appError.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    if (!name || !price || !image || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = new productModel({
      name,
      description: description || 'Premium Quality',
      price,
      image,
      category
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};


const uploadProductImage = async (req, res, next) => {
  try {

    if (!req.file || !req.file.buffer) {
      return next(new AppError('No image file provided', 400));
    }
    console.log('req.body:', req.body);
    const { category } = req.body;
    console.log('category:', category);
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
        fileName: result.fileName,
        githubUrl: result.data.download_url
      }
    });

  } catch (error) {
    next(error);
  }
}



export default { getProducts, createProduct, uploadProductImage };
