import { Router } from "express";
import productController from "../controllers/productController.js";

const router = Router();

router.get("/", productController.getProducts);
router.get("/popular", productController.getPopularProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.insertProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
