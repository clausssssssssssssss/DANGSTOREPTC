// src/controllers/fakePaymentController.js
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

/**
 * Controlador para pagos simulados (fake) en desarrollo/testing.
 *
 * Simula la creación y captura inmediata de una orden
 * sin interacción con pasarelas reales.
 */
const fakePaymentController = {};

/**
 * Simula el checkout: crea una orden basada en el carrito y marca como pagado.
 *
 * @route POST /api/payments/fake
 * @middleware validateAuthToken
 */
fakePaymentController.fakeCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    // Buscamos y poblamos el carrito del usuario
    const cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');

    if (!cart || (cart.products.length === 0 && cart.customizedProducts.length === 0)) {
      return res.status(400).json({ message: 'Carrito vacío' });
    }

    // 1) Calcular total
    let total = 0;
    cart.products.forEach(p => total += p.product.price * p.quantity);
    cart.customizedProducts.forEach(c => total += c.item.cotizacion * c.quantity);

    // 2) Crear la orden simulada usando la propiedad 'paypal'
    const fakeOrderID = `fake_tx_${Date.now()}`;
    const order = new Order({
      user: userId,
      items: [
        ...cart.products.map(p => ({
          product:  p.product._id,
          quantity: p.quantity,
          price:    p.product.price
        })),
        ...cart.customizedProducts.map(c => ({
          product:  c.item._id,
          quantity: c.quantity,
          price:    c.item.cotizacion
        }))
      ],
      total,
      status: 'COMPLETED',
      paypal: {
        orderID: fakeOrderID,
        captureStatus: 'COMPLETED'
      }
    });
    await order.save();

    // 3) Vaciar el carrito
    cart.products = [];
    cart.customizedProducts = [];
    cart.state = 'Pagado';
    await cart.save();

    // 4) Respuesta al cliente
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
