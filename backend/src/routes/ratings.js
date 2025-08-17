import express from "express";
import ratingsController from "../controllers/ratingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Obtener reseñas de un producto (público)
router.get("/product/:productId", ratingsController.getProductRatings);

// Obtener estadísticas de ratings de un producto (público)
router.get("/stats/:productId", ratingsController.getProductRatingStats);

// Verificar si usuario puede dejar reseña (requiere autenticación)
router.get("/can-rate/:productId", authMiddleware(), ratingsController.canUserRate);

// Crear nueva reseña (requiere autenticación)
router.post("/", authMiddleware(), ratingsController.createRating);

// Actualizar reseña existente (requiere autenticación)
router.put("/:ratingId", authMiddleware(), ratingsController.updateRating);

// Eliminar reseña (requiere autenticación)
router.delete("/:ratingId", authMiddleware(), ratingsController.deleteRating);

export default router;
