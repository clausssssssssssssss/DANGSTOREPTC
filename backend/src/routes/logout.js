import express from "express";
const router = express.Router();

import logoutController from "../controllers/logoutController.js";

router.route("/").post(logoutController.logout);

export default router;
