import { Router } from 'express';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  createOrder,
  getOrders
} from '../controllers/cartController.js'; // todo viene de aquí

import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// -------------------- Rutas de Carrito ----------------------

/** POST /api/cart
 *  Añade un producto o personalizado al carrito
 */
router.post('/', authMiddleware(), addToCart);

/** GET /api/cart
 *  Recupera el carrito del usuario autenticado
 */
router.get('/', authMiddleware(), getCart);

/** PUT /api/cart
 *  Actualiza la cantidad de un ítem en el carrito
 */
router.put('/', authMiddleware(), updateCartItem);

/** DELETE /api/cart
 *  Elimina un ítem del carrito
 */
router.delete('/', authMiddleware(), removeCartItem);

// -------------------- Rutas de Órdenes ----------------------

/** POST /api/cart/order
 *  Crea una orden luego del pago
 */
router.post('/order', authMiddleware(), createOrder);

/** GET /api/cart/orders
 *  Historial de órdenes del usuario autenticado
 */
router.get('/orders', authMiddleware(), getOrders);

export default router;
