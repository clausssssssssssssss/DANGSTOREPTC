// backend/src/routes/customerRoutes.js
import { Router } from "express";
import {
  registerCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer
} from "../controllers/customerController.js";
import { loginClient } from "../controllers/loginController.js";

const router = Router();

// Registro y login
router.post("/", registerCustomer);
router.post("/login", loginClient);

// Operaciones CRUD
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.delete("/:id", deleteCustomer);

export default router;
