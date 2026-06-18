import productModel from '../models/Product.js';
import githubServices from "../scripts/githubServices.js";
import AppError from '../utils/appError.js';
import { hardDeleteProducts } from '../scripts/productCleanupService.js';



// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const products = await productModel.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};




// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, imagefilePath, sha, totalStock } = req.body;

    if (!name || !price || !image || !sha || !imagefilePath || !category || !totalStock) {
      return next(new AppError('Please provide all required fields', 400));
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


const deleteProduct = async (req, res, next) => {
  const { productId } = req.query;
  console.log('productID:', productId);

  if (!productId) {
    return next(new AppError('Product ID is missing', 400));
  }

  try {
    const product = await productModel.findOne({ _id: productId, isDeleted: false });

    if (!product) {
      return next(new AppError('Failed to delete product. Active product not found.', 404));
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();


    return res.status(200).json({
      success: true,
      message: 'Product moved to trash successfully'
    });

  } catch (error) {
    next(error);
  }
};


//GET ALL SOFT-DELETED PRODUCTS FOR THE TRASH VIEW
export const getTrashedProducts = async (req, res, next) => {
  try {
    const trashedItems = await productModel.find({ isDeleted: true }).sort({ deletedAt: -1 });
    return res.status(200).json({ success: true, data: trashedItems });
  } catch (error) { next(error); }
};


// C. RESTORE A SOFT-DELETED PRODUCT BACK TO CATALOG LIFE
export const restoreProduct = async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) return next(new AppError('Product ID is required', 400));

  try {
    const product = await productModel.findOne({ _id: productId, isDeleted: true });
    if (!product) return next(new AppError('Product not found in trash', 404));

    product.isDeleted = false;
    product.deletedAt = null;
    await product.save();

    return res.status(200).json({ success: true, message: 'Product restored successfully.' });
  } catch (error) { next(error); }
};





// PERMANENT MANUAL PURGE
export const purgeTrash = async (req, res, next) => {
  const { productId } = req.body;

  try {
    let productsToPurge = [];

    if (productId) {

      const product = await productModel.findOne({ _id: productId, isDeleted: true });
      if (!product) return next(new AppError('Product not found in trash', 404));
      productsToPurge = [product];

    } else {
      productsToPurge = await productModel.find({ isDeleted: true });
    }

    if (productsToPurge.length === 0) {
      return res.status(200).json({ success: true, message: 'Trash bin is already empty.' });
    }

    const totalPurged = await hardDeleteProducts(productsToPurge);

    return res.status(200).json({
      success: true,
      message: `Successfully purged ${totalPurged} item(s) permanently.`
    });

  } catch (error) {
    next(error);
  }
};

export default { getProducts, getTrashedProducts, restoreProduct, purgeTrash, createProduct, uploadProductImage, updateProductImage, deleteProduct };
