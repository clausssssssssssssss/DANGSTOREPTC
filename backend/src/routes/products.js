import { Router } from "express";
import productController from "../controllers/productController.js";
import upload from "../middleware/multer.js";

const router = Router();

// Obtener todos los productos
router.get("/", productController.getProducts);

// Obtener productos populares
router.get("/popular", productController.getPopularProducts);

// Obtener un producto por su ID
router.get("/:id", productController.getProductById);

// Crear un nuevo producto con imágenes
router.post("/", upload.array('images', 5), productController.insertProduct);

// Actualizar un producto (opcionalmente con imágenes)
router.put("/:id", upload.array('images', 5), productController.updateProduct);

// Eliminar un producto
router.delete("/:id", productController.deleteProduct);

export default router;
