import SalesModel from "../models/Sale.js";

const salesController = {};

// aquí obtengo todas las ventas guardadas
salesController.getAllSales = async (req, res) => {
  try {
    const sales = await SalesModel.find(); // traigo todas las ventas
    res.status(200).json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las ventas" });
  }
};

// 👇 NUEVO: Obtener las últimas 10 ventas/pedidos
salesController.getLatestSales = async (req, res) => {
  try {
    console.log(' Intentando obtener las últimas ventas...');
    
    // Primero verifica si hay datos en la colección
    const totalCount = await SalesModel.countDocuments();
    console.log(` Total de ventas en la base: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log(' No hay ventas en la base de datos');
      return res.status(200).json([]);
    }
    
    const latestSales = await SalesModel
      .find()
      .populate('customer', 'name email username') 
      .sort({ _id: -1 })
      .limit(10)
      .lean();
    
    console.log(` Ventas encontradas: ${latestSales.length}`);
    console.log(' Primeras 2 ventas:', JSON.stringify(latestSales.slice(0, 2), null, 2));
    
    res.status(200).json(latestSales);
  } catch (error) {
    console.error(' Error en getLatestSales:', error);
    res.status(500).json({ 
      message: "Error al obtener las últimas ventas", 
      error: error.message 
    });
  }
};


salesController.getAllSales = async (req, res) => {
  try {
    const sales = await SalesModel
      .find()
      .populate('customer', 'name email username') 
      .sort({ _id: -1 })
      .lean();
    
    res.status(200).json(sales);
  } catch (error) {
    console.error(' Error en getAllSales:', error);
    res.status(500).json({ 
      message: "Error al obtener todas las ventas", 
      error: error.message 
    });
  }
};

// aquí registro una nueva venta
salesController.insertSales = async (req, res) => {
  try {
    const { product, category, customer, total } = req.body;

    // verifico que el total no sea negativo
    if (total < 0) {
      return res.status(400).json({ message: "El total debe ser positivo" });
    }

    const newSale = new SalesModel({ product, category, customer, total });
    await newSale.save(); // la guardo en la BD

    res.status(201).json({ message: "Venta registrada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar la venta" });
  }
};

// aquí actualizo una venta por su ID
salesController.updateSales = async (req, res) => {
  try {
    const { product, category, customer, total } = req.body;

    if (total < 0) {
      return res.status(400).json({ message: "El total debe ser positivo" });
    }

    const updated = await SalesModel.findByIdAndUpdate(
      req.params.id,
      { product, category, customer, total },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.status(200).json({ message: "Venta actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la venta" });
  }
};

// aquí elimino una venta por su ID
salesController.deleteSales = async (req, res) => {
  try {
    const deleted = await SalesModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.status(200).json({ message: "Venta eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la venta" });
  }
};

// aquí hago resumen de ventas: diario, mensual y anual
salesController.getSalesSummary = async (req, res) => {
  try {
    const daily = await SalesModel.aggregate([
      { $group: {
          _id: {
            day: { $dayOfMonth: "$date" },
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          total: { $sum: "$total" }
        }},
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } }
    ]);

    const monthly = await SalesModel.aggregate([
      { $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          total: { $sum: "$total" }
        }},
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    const yearly = await SalesModel.aggregate([
      { $group: {
          _id: { year: { $year: "$date" }},
          total: { $sum: "$total" }
        }},
      { $sort: { "_id.year": -1 } }
    ]);

    // devuelvo los tres resúmenes juntos
    res.status(200).json({ daily, monthly, yearly });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener resumen" });
  }
};

//  aquí obtengo ventas agrupadas por categoría
salesController.getSalesByCategory = async (req, res) => {
  try {
    const result = await SalesModel.aggregate([
      { $group: { _id: "$category", total: { $sum: "$total" } }},
      { $sort: { total: -1 } } // ordeno de mayor a menor
    ]);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener ventas por categoría" });
  }
};

// AGREGAR este nuevo método a tu salesReportController.js
// NO reemplaces el getSalesSummary existente

salesController.getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Inicio de la semana (lunes)
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo (0), retrocede 6 días
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    
    // Inicio del mes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Ventas de hoy
    const dailyResult = await SalesModel.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Hasta mañana
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]);

    // Ventas de esta semana
    const weeklyResult = await SalesModel.aggregate([
      {
        $match: {
          date: {
            $gte: startOfWeek,
            $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]);

    // Ventas de este mes
    const monthlyResult = await SalesModel.aggregate([
      {
        $match: {
          date: {
            $gte: startOfMonth,
            $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]);

    // Formatear respuesta específicamente para el dashboard
    const summary = {
      dailyIncome: dailyResult[0]?.total || 0,
      weeklyIncome: weeklyResult[0]?.total || 0,
      monthlyIncome: monthlyResult[0]?.total || 0
    };

    console.log(' Dashboard summary calculado:', summary);
    res.status(200).json(summary);
  } catch (error) {
    console.error(' Error en getDashboardSummary:', error);
    res.status(500).json({ message: "Error al obtener resumen del dashboard", error: error.message });
  }
};

//  aquí calculo las ganancias en un rango de fechas
salesController.getIncomeByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query; // leo fechas de la query

    const result = await SalesModel.aggregate([
      {
        $match: {
          date: { $gte: new Date(start), $lte: new Date(end) }, // filtro por rango
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    // si no hay resultados devuelvo total 0
    res.status(200).json(result[0] || { total: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en ganancias por rango" });
  }
};

export default salesController; 