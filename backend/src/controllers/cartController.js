import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import CustomizedProducts from '../models/customizedOrders.js';
import Customer from '../models/Customers.js';
import Sale from '../models/Order.js';

/**
 * Añade un producto o ítem personalizado al carrito de un cliente.
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns {Promise<void>}
 */
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1, customItemId } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId });

    // Si viene productId, lo agregamos o incrementamos cantidad
    if (productId) {
      const idx = cart.products.findIndex(p => p.product.toString() === productId);
      if (idx >= 0) cart.products[idx].quantity += quantity;
      else cart.products.push({ product: productId, quantity });
    }

    // Si viene customItemId, lo agregamos o incrementamos cantidad
    if (customItemId) {
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === customItemId);
      if (idx >= 0) cart.customizedProducts[idx].quantity += quantity;
      else cart.customizedProducts.push({ item: customItemId, quantity });
    }

    await cart.save();
    return res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Error añadiendo al carrito', error });
  }
};

/**
 * Obtiene el carrito de un cliente y sus detalles poblados.
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ user: userId })
      .populate('products.product')
      .populate('customizedProducts.item');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: 'Error obteniendo carrito', error });
  }
};

/**
 * Actualiza la cantidad de un ítem en el carrito.
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const updateCartItem = async (req, res) => {
  try {
    const { userId, itemId, type, quantity } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    if (type === 'product') {
      const idx = cart.products.findIndex(p => p.product.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Producto no en carrito' });
      cart.products[idx].quantity = quantity;
    } else if (type === 'custom') {
      const idx = cart.customizedProducts.findIndex(p => p.item.toString() === itemId);
      if (idx < 0) return res.status(404).json({ message: 'Item personalizado no en carrito' });
      cart.customizedProducts[idx].quantity = quantity;
    }

    await cart.save();
    return res.status(200).json({ message: 'Carrito actualizado', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Error actualizando carrito', error });
  }
};

/**
 * Elimina un ítem (producto o personalizado) del carrito.
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const removeCartItem = async (req, res) => {
  try {
    const { userId, itemId, type } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    if (type === 'product') {
      cart.products = cart.products.filter(p => p.product.toString() !== itemId);
    } else if (type === 'custom') {
      cart.customizedProducts = cart.customizedProducts.filter(p => p.item.toString() !== itemId);
    }

    await cart.save();
    return res.status(200).json({ message: 'Item eliminado', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Error eliminando item', error });
  }
};

/**
 * Procesa el pago del carrito usando Wompi y crea una venta.
 *
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const checkoutCart = async (req, res) => {
  try {
    const { userId } = req.params;
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

    // 2) Payload para Wompi
    const customer = await Customer.findById(userId);
    const payload = {
      public_key: process.env.WOMPI_PUBLIC_KEY,
      amount_in_cents: Math.round(total * 100),
      currency: 'USD',
      customer_email: customer.email,
      reference: cart._id.toString(),
      redirect_url: `${process.env.APP_URL}/checkout/success`,
      payment_method: {
        type: 'CARD',
        token: req.body.cardToken
      }
    };

    // 3) Llamada a Wompi
    const { data } = await axios.post(
      'https://checkout.wompi.co/v1/transactions',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    // 4) Guardar venta y actualizar carrito
    const sale = new Sale({
      user: userId,
      cart: cart._id,
      paymentMethod: 'Wompi',
      transactionId: data.data.id,
      state: 'Pendiente',
      deliveryPoint: cart.deliveryPoint,
      amount: total
    });
    await sale.save();

    cart.state = 'Pagado';
    await cart.save();

    return res.status(200).json({
      message: 'Checkout iniciado',
      payment_url: data.data.redirect_url,
      saleId: sale._id
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error en el checkout',
      error: error.response?.data || error.message
    });
  }
};
