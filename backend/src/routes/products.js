import { Router } from 'express';
import {
  getProducts,
  getPopularProducts,
  getProductById,
  insertProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/popular', getPopularProducts);
router.get('/:id', getProductById);
router.post('/', insertProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
