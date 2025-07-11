import { Router } from 'express';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from '../controllers/cartController.js';
import validateAuthToken from '../middleware/validateAuthToken.js';

const router = Router();

/** POST /api/cart
 *  Añade un producto o personalizado al carrito
 */
router.post('/', addToCart);
router.post('/', validateAuthToken(), addToCart);

/** GET /api/cart/:userId
 *  Recupera el carrito de un usuario
 */
router.get('/:userId', getCart);
router.get('/:userId', validateAuthToken(), getCart);


/** PUT /api/cart
 *  Actualiza la cantidad de un ítem en el carrito
 */
router.put('/', updateCartItem);
router.put('/', validateAuthToken(), updateCartItem);


/** DELETE /api/cart
 *  Elimina un ítem del carrito
 */
router.delete('/', removeCartItem);
router.delete('/', validateAuthToken(), removeCartItem);




export default router;
