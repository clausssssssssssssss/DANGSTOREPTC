import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import profileController from "../controllers/profileController.js";

const router = Router();

// Todas las rutas requieren autenticación
// Llamamos a authMiddleware() para activar el middleware correctamente

// Obtener datos del perfil
router.get("/", authMiddleware(), profileController.getProfile);

// Actualizar datos personales
router.put("/", authMiddleware(), profileController.updateProfile);

// Cambiar contraseña
router.put("/password", authMiddleware(), profileController.changePassword);

// Obtener historial de pedidos
router.get("/orders", authMiddleware(), profileController.getOrders);

// Obtener productos favoritos
router.get("/favorites", authMiddleware(), profileController.getFavorites);

// Alternar (agregar/quitar) un producto de favoritos
router.post("/favorites/:productId", authMiddleware(), profileController.toggleFavorite);

export default router;
