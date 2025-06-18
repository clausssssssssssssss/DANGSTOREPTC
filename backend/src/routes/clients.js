import { Router } from "express";
import {
  registerClient,
  getAllClients,
  getClientById,
  deleteClient
} from "../controllers/clientsController.js";

import { loginClient } from "../controllers/loginController.js";

const router = Router();

// registro y login
router.post("/register", registerClient);
router.post("/login", loginClient);

// CRUD
router.get("/", getAllClients);
router.get("/:id", getClientById);
router.delete("/:id", deleteClient);

export default router;
