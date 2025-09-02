import express from 'express';
import multer from 'multer';
import { getProducts, createProduct } from '../controllers/productsController.js';

const router = express.Router();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Rutas
router.get('/', getProducts);
router.post('/', upload.single('imagen'), createProduct);

export default router;