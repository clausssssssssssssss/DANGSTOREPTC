import { Router } from "express";
import productController from "../controllers/productController.js";

const router = Router();

// Obtener todos los productos
router.get("/", productController.getProducts);

// Obtener productos populares
router.get("/popular", productController.getPopularProducts);

// Obtener un producto por su ID
router.get("/:id", productController.getProductById);

// Crear un nuevo producto
router.post("/", productController.insertProduct);

// Actualizar un producto por su ID
router.put("/:id", productController.updateProduct);

// Eliminar un producto por su ID
router.delete("/:id", productController.deleteProduct);

export default router;
