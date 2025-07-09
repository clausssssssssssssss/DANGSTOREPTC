import { Router } from 'express';
import materialController from '../controllers/materialController';

const router = Router();

// Obtener todos los materiales
router.get('/', materialController.getAllMaterials);

// Obtener un material por ID
router.get('/:id', materialController.getMaterialById);

// Buscar materiales por nombre o tipo
router.get('/search', materialController.searchMaterials);

// Insertar un nuevo material (con imagen)
router.post('/', materialController.insertMaterial);

// Actualizar un material (con imagen opcional)
router.put('/:id', materialController.updateMaterial);

// Eliminar un material
router.delete('/:id', materialController.deleteMaterial);

export default router;
