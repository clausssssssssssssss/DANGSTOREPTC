import { Router } from 'express';
import multer from 'multer';
import materialController from '../controllers/materialController.js';

const router = Router();

// Configurar multer en memoria para manejar uploads hacia Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Obtener todos los materiales
router.get('/', materialController.getAllMaterials);

// Buscar materiales por nombre o tipo (debe ir antes que :id)
router.get('/search', materialController.searchMaterials);

// Obtener un material por ID
router.get('/:id', materialController.getMaterialById);

// Insertar un nuevo material (con imagen)
router.post('/', upload.single('image'), materialController.insertMaterial);

// Actualizar un material (con imagen opcional)
router.put('/:id', upload.single('image'), materialController.updateMaterial);

// Eliminar un material
router.delete('/:id', materialController.deleteMaterial);

export default router;
