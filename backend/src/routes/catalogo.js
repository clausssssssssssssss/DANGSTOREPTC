import { Router } from "express";
import catalogController from "../controllers/catalogController.js";

const router = Router();

// Ruta: GET /api/catalog
// Si no envías nada, devuelve todos los productos
// Si envías parámetros en la query (search, category, minPrice, maxPrice), aplica filtros
router.get("/", catalogController.getCatalog);

export default router;
