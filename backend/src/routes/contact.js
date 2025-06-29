// src/routes/contact.js
import { Router } from "express";
import contactController from "../controllers/contactController.js";

const router = Router();

router.post("/", contactController.sendContact);

export default router;
