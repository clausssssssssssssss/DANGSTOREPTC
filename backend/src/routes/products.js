import express from 'express';
import multer from 'multer';
import { createProduct, getProducts } from '../controllers/productsController';

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
const upload = multer({ storage });

// Obtener productos
router.get('/', getProducts);

// Crear producto
router.post('/', upload.single('imagen'), createProduct);

export default router;
