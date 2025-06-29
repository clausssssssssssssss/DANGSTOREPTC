// backend/src/routes/customerRoutes.js
import { Router } from "express";
import customerController from "../controllers/customerController.js";
import { loginClient } from "../controllers/loginController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Registro y login
router.post("/", customerController.registerCustomer);
router.post("/login", loginClient);

// Perfil del cliente autenticado (debe ir antes de :id) sino va dar error :( lo descubri a la mala 
router.get("/me", authMiddleware, customerController.getProfile);

// Operaciones CRUD
router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);
router.delete("/:id", customerController.deleteCustomer);

export default router;
