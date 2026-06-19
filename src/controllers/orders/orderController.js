import orderModel from '../../models/Order.js';

// @desc    Create new order (Regular Purchase or Custom Stitching)
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res,next) => {
  try {
    const {
      customerName,
      email,
      orderType,
      items,
      stitchingDetails,
      totalAmount
    } = req.body;

    if (!customerName || !email || !orderType) {
      return res.status(400).json({ message: 'Missing core order details' });
    }

    if (orderType === 'PRODUCT_PURCHASE' && (!items || items.length === 0)) {
      return res.status(400).json({ message: 'No items in the cart' });
    }

    const order = new orderModel({
      customerName,
      email,
      orderType,
      items: items || [],
      stitchingDetails: stitchingDetails || null,
      totalAmount: totalAmount || 0,
      status: 'PENDING'
    });

    const savedOrder = await orderModel.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).populate('items.product', 'name price image');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

export default { createOrder, getOrders };
