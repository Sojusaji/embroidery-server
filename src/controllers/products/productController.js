import productModel from '../../models/Product.js';
import githubServices from "../../scripts/githubServices.js";
import AppError from '../../utils/appError.js';
import { hardDeleteProducts } from '../../scripts/productCleanupService.js';



// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
// controllers/productController.js

// controllers/productController.js

// 1. Get Paginated Featured Products
// 1. Get Featured Products

const pipeline = async (matchedQuery,limit) => {
  const [result] = await productModel.aggregate([
    { $match: matchedQuery },
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: limit + 1 },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        category: 1,
        createdAt: 1,
        image: 1
      }
    }
  ])

  const products = result ?? [];

  let nextCursor = null;

  const hasNextPage = products.length > limit;

  if (hasNextPage) {

    products.pop();
    const lastItem = products[products.length - 1];

    const rawCursor = JSON.stringify({
      createdAt: lastItem.createdAt,
      id: lastItem.id
    })

    nextCursor = Buffer.from(rawCursor).toString('base64');
  }

  return {
    products,
    pagination: {
      nextCursor,
      hasNextPage,
    }
  }

}



export const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const { cursor } = req.query;

    let matchedQuery = {
      status: 'active',
      isDeleted: false,
      isFeatured: true,
    }

    if (cursor) {
      try {
        const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
        matchedQuery.$or = [
          {
            createdAt: { $lt: new Date(decodedCursor.createdAt) }
          },
          {
            createdAt: new Date(decodedCursor.createdAt),
           _id: { $lt: new mongoose.Types.ObjectId(decodedCursor.id) }
          }
        ]
      } catch (error) {
        return res.status(400).json({ success: false, message: 'We are not able to fetch datas right now. Try agian leter' });
      }
    }

    const result = await pipeline(matchedQuery,limit);

    return res.status(200).json({
      success: true,
      ...result
    })
  }
  catch (error) {
    next(error);
  }
};

// 2. Get Paginated Latest Products
export const getLatestProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const { cursor } = req.query;

    let matchedQuery = {
      status: 'active',
      isDeleted: false,
      isFeatured: false
    }

    if (cursor) {
      try {
        const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
        matchedQuery.$or = [
          {
            createdAt: { $lt: new Date(decodedCursor.createdAt) }
          },
          {
            createdAt: new Date(decodedCursor.createdAt),
           _id: { $lt: new mongoose.Types.ObjectId(decodedCursor.id) }
          }
        ]
      } catch (error) {
        return res.status(400).json({ success: false, message: 'We are not able to fetch datas right now. Try agian leter' });
      }
    }

    const result = await pipeline(matchedQuery,limit);

    return res.status(200).json({
      success: true,
      ...result
    })

  } catch (error) {
    next(error);
  }
};


export const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
      status: 'active'
    });

    if (!product) {
      return next(new AppError("Product not found or unavailable.", 404));
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};


export const getProducts = async (req, res, next) => {
  try {
    const products = await productModel.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};



export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, comparePrice, sku, totalStock,
      status, tags, isFeatured, inStock,
      image, category, imageInfo } = req.body;

    const product = new productModel({
      name,
      description: description || 'Premium Quality',
      price,
      comparePrice,
      sku,
      totalStock,
      status,
      tags,
      isFeatured,
      inStock,
      image,
      imageInfo,
      category,
    });

    const createdProduct = await product.save();
    console.log('product created successfully :', createdProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error)
  }
};




export const uploadProductImage = async (req, res, next) => {
  try {

    if (!req.file || !req.file.buffer) {
      return next(new AppError('No image file provided', 400));
    }
    const { category } = req.body;

    const result = await githubServices.uploadImage(
      req.file.buffer,
      category
    );
    res.status(201).json({
      success: true,
      message: 'Image uploaded to GitHub successfully',
      data: {
        filePath: result?.filePath,
        imageUrl: result?.imageUrl,
        sha: result?.sha
      }
    });

  } catch (error) {
    next(error);
  }
}




export const updateProductImage = async (req, res, next) => {
  try {

    if (!req.file || !req.file.buffer) {
      return next(new AppError('No image file provided', 400));
    }
    const { filePath, sha, folder } = req.body;
    if (!filePath || !sha || !folder) {
      return next(new AppError('Image datas are missing', 400));
    }

    const result = await githubServices.updateImage(
      req.file.buffer,
      sha,
      filePath,
      folder
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




export const updateProduct = async (req, res, next) => {
  const { productId } = req.params;

  const allowedUpdates = [
    'name',
    'description',
    'price',
    'comparePrice',
    'sku',
    'totalStock',
    'status',
    'tags',
    'isFeatured',
    'inStock',
    'image',
    'imageInfo',
    'category'
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return next(new AppError('No valid fields provided for update', 400));
  }

  if (updates.totalStock !== undefined && updates.inStock === undefined) {
    updates.inStock = Number(updates.totalStock) > 0;
  }

  try {
    if (updates.price !== undefined || updates.comparePrice !== undefined) {
      const existingProduct = await productModel.findById(productId).select('price comparePrice');

      if (!existingProduct) {
        return next(new AppError('Product not found', 404));
      }

      const effectivePrice = updates.price !== undefined ? Number(updates.price) : existingProduct.price;
      const effectiveComparePrice = updates.comparePrice !== undefined ? Number(updates.comparePrice) : existingProduct.comparePrice;

      if (effectiveComparePrice && effectiveComparePrice <= effectivePrice) {
        return next(new AppError('Compare-at price must be greater than the selling price', 400));
      }
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return next(new AppError('Product not found', 404));
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};







export const deleteProduct = async (req, res, next) => {
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
  console.log('we recieved this product for delete permanently:', productId);
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

    if (totalPurged === null) {
      return next(new AppError('Unable to permanently delete these items at this time. Please try again later.', 500))
    }
    return res.status(200).json({
      success: true,
      message: `Successfully purged ${totalPurged} item(s) permanently.`
    });

  } catch (error) {
    next(error);
  }
};

