// backend/src/routes/customerRoutes.js
import { Router } from "express";
import {
  registerCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
   getProfile,
} from "../controllers/customerController.js";
import { loginClient } from "../controllers/loginController.js";
import authMiddleware from '../middleware/authMiddleware.js';


/**
 * Rutas para la entidad Customer:
 * - Registro y login
 * - Operaciones CRUD de clientes
 *
 * Base path (e.g.): /api/customers
 */
const router = Router();

/**
 * POST /           -> registerCustomer
 *   Registra un nuevo cliente y envía email de bienvenida.
 */
router.post("/", registerCustomer);

/**
 * POST /login      -> loginClient
 *   Autentica un cliente usando email y contraseña y devuelve token JWT.
 */
router.post("/login", loginClient);

// Perfil del cliente autenticado (debe ir antes de :id) sino va dar error :( lo descubri a la mala 
router.get("/me", authMiddleware, getProfile);

/**
 * GET /            -> getAllCustomers
 *   Obtiene lista de todos los clientes sin campos sensibles.
 */
router.get("/", getAllCustomers);

/**
 * GET /:id         -> getCustomerById
 *   Obtiene un cliente por su ID, retorna 404 si no existe.
 */
router.get("/:id", getCustomerById);

/**
 * DELETE /:id      -> deleteCustomer
 *   Elimina un cliente por su ID, retorna 404 si no existe.
 */
router.delete("/:id", deleteCustomer);

export default router;
