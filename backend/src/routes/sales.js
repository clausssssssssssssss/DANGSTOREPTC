import { Router } from "express";
import salesController from "../controllers/salesReportController.js";

const router = Router();

// CRUD
router.get("/", salesController.getAllSales);
router.post("/", salesController.insertSales);
router.put("/:id", salesController.updateSales);
router.delete("/:id", salesController.deleteSales);

// Reportes
router.get("/summary", salesController.getSalesSummary);
router.get("/by-category", salesController.getSalesByCategory);
router.get("/income-range", salesController.getIncomeByDateRange);


export default router;
