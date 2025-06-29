// src/routes/cart.js
import { Router } from 'express';
import cartController from '../controllers/cartController.js';
import { validateAuthToken } from '../middleware/validateAuthToken.js'; 

const router = Router();

// Todas requieren que el usuario esté autenticado
router.use(validateAuthToken);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.delete('/remove/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

export default router;
