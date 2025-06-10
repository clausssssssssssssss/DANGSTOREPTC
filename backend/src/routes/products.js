// routes/productRoutes.js
import express from "express";
import productController from "../controllers/productController.js";

//Router
const router = express.Router();

//Select - Insert
router.route("/")
    .get(productController.getProducts)
    .post(productController.insertProduct);

//Delete - Update - Get by ID
router.route("/:id")
    .get(productController.getProductById)
    .put(productController.updateProduct)
    .delete(productController.deleteProduct);

//Get by Category
router.route("/category/:category")
    .get(productController.getProductsByCategory);

//Export
export default router;