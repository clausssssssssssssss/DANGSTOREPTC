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
    console.log('🔍 Intentando obtener las últimas ventas...');
    
    // Primero verifica si hay datos en la colección
    const totalCount = await SalesModel.countDocuments();
    console.log(`📊 Total de ventas en la base: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('⚠️ No hay ventas en la base de datos');
      return res.status(200).json([]);
    }
    
    // Obtener las últimas 10 ventas ordenadas por _id (más reciente primero)
    // Usamos _id en lugar de date porque _id contiene timestamp de creación
    const latestSales = await SalesModel
      .find()
      .sort({ _id: -1 }) // Ordenar por _id descendente (más recientes primero)
      .limit(10) // Limitar a 10 resultados
      .lean(); // Para mejor performance

    console.log(`✅ Ventas encontradas: ${latestSales.length}`);
    console.log('📋 Primeras 2 ventas:', JSON.stringify(latestSales.slice(0, 2), null, 2));

    res.status(200).json(latestSales);
  } catch (error) {
    console.error('❌ Error en getLatestSales:', error);
    res.status(500).json({ message: "Error al obtener las últimas ventas", error: error.message });
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
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Semana (desde el lunes hasta hoy)
    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, ...
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Mes (desde el día 1)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Ingresos diarios
    const dailyResult = await SalesModel.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lt: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    // Ingresos semanales
    const weeklyResult = await SalesModel.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek, $lt: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    // Ingresos mensuales
    const monthlyResult = await SalesModel.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lt: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    res.status(200).json({
      dailyIncome: dailyResult[0]?.total || 0,
      weeklyIncome: weeklyResult[0]?.total || 0,
      monthlyIncome: monthlyResult[0]?.total || 0,
    });
  } catch (error) {
    console.error("❌ Error en getSalesSummary:", error);
    res.status(500).json({ message: "Error al obtener resumen de ventas" });
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