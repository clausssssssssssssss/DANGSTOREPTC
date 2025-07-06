import { Router } from 'express';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from '../controllers/cartController.js';

const router = Router();

/** POST /api/cart
 *  Añade un producto o personalizado al carrito
 */
router.post('/', addToCart);

/** GET /api/cart/:userId
 *  Recupera el carrito de un usuario
 */
router.get('/:userId', getCart);

/** PUT /api/cart
 *  Actualiza la cantidad de un ítem en el carrito
 */
router.put('/', updateCartItem);

/** DELETE /api/cart
 *  Elimina un ítem del carrito
 */
router.delete('/', removeCartItem);



export default router;
