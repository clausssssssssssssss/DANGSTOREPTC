// backend/src/routes/adminAuthRoutes.js
import { Router } from "express";
import { loginAdmin } from "../controllers/adminAuthController.js";

const router = Router();

// POST /api/admins/login
router.post("/login", loginAdmin);

export default router;
