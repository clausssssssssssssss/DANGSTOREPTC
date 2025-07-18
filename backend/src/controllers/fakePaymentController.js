// src/controllers/fakePaymentController.js
import Order from '../models/Order.js';

/**
 * Controlador para pagos simulados (fake) en desarrollo/testing.
 *
 * Simula la creación y captura inmediata de una orden
 * sin interacción con pasarelas reales.
 */
const fakePaymentController = {};

// src/controllers/fakePaymentController.js
fakePaymentController.fakeCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    if (!cart || (cart.products.length === 0 && cart.customizedProducts.length === 0)) {
      return res.status(400).json({ message: 'Carrito vacío' });
    }

    // 1) Calcular total
    const totalProducts = cart.products.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0
    );

    const totalCustom = cart.customizedProducts.reduce(
      (sum, c) => {
        // usa price del customizedOrder, o 0 si no existe
        const itemPrice = typeof c.item.price === 'number' ? c.item.price : 0;
        return sum + itemPrice * c.quantity;
      },
      0
    );

    const total = totalProducts + totalCustom;

    // 2) Armar array de items
    const items = [
      ...cart.products.map(p => ({
        product:  p.product._id,
        quantity: p.quantity,
        price:    p.product.price
      })),
      ...cart.customizedProducts.map(c => {
        const itemPrice = typeof c.item.price === 'number' ? c.item.price : 0;
        return {
          product:  c.item._id,
          quantity: c.quantity,
          price:    itemPrice
        };
      })
    ];

    // 3) Crear la orden simulada
    const fakeOrderID = `fake_tx_${Date.now()}`;
    const order = new Order({
      user:   userId,
      items,
      total,
      status: 'COMPLETED',
      paypal: {
        orderID:       fakeOrderID,
        captureStatus: 'COMPLETED'
      }
    });
    await order.save();

    // 4) Vaciar el carrito
    cart.products = [];
    cart.customizedProducts = [];
    cart.state = 'Pendiente';
    await cart.save();

    return res.status(200).json({
      message: 'Pago simulado y orden creada exitosamente',
      order
    });
  } catch (err) {
    console.error('Error en fakeCheckout:', err);
    return res.status(500).json({ message: 'Error en pago simulado', error: err.message });
  }
};

export default fakePaymentController;
 