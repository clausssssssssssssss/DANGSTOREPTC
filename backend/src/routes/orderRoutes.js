// routes/orderRoutes.js
import express from 'express';
import orderController from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', authMiddleware, orderController.checkout);
router.get('/history', authMiddleware, orderController.getOrderHistory);

export default router;
