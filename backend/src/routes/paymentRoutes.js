import { Router } from 'express';
import {
  getToken,
  testPayment,
  realPayment,
  fakePayment,
} from '../controllers/paymentController.js';

const router = Router();

router.post('/token', getToken);
router.post('/testPayment', testPayment);
router.post('/payment3ds', realPayment);
router.post('/fakePayment', fakePayment);

export default router;
