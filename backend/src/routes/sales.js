import { Router } from "express";
import salesController from "../controllers/salesReportController.js";

const router = Router();

// IMPORTANTE: La ruta /latest debe estar ANTES que las otras rutas específicas
router.get("/latest", salesController.getLatestSales);

// NUEVO: Endpoint específico para el dashboard de inicio
router.get("/dashboard-summary", salesController.getDashboardSummary);

// Reportes específicos (mantener existentes para las gráficas)
router.get("/summary", salesController.getSalesSummary);
router.get("/by-category", salesController.getSalesByCategory);
router.get("/income-range", salesController.getIncomeByDateRange);

// CRUD básico
router.get("/", salesController.getAllSales);
router.post("/", salesController.insertSales);
router.put("/:id", salesController.updateSales);
router.delete("/:id", salesController.deleteSales);

export default router;