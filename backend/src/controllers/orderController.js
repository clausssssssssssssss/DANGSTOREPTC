const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const checkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Obtener el carrito del usuario
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('El carrito está vacío');
    }

    // Calcular el total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Crear la orden
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      total,
      status: 'pendiente'
    });

    await order.save();

    // Vaciar el carrito
    cart.items = [];
    await cart.save();

    res.status(201).json({ 
      success: true, 
      orderId: order._id 
    });
  } catch (error) {
    next(error);
  }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.product');

    res.status(200).json(orders.map(order => ({
      id: order._id,
      date: order.createdAt,
      total: order.total,
      status: order.status,
      items: order.items
    })));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getOrderHistory
};