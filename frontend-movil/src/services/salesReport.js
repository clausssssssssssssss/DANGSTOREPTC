// src/services/salesReport.js

// 👉 Cambia esta URL cuando tengas backend corriendo
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://dangstoreptc.onrender.com/api";

export const salesAPI = {
  // Obtener resumen de ventas (diarias, mensuales, anuales)
  async getSalesSummary() {
    try {
      const response = await fetch(`${API_URL}/sales/summary`);
      if (!response.ok) {
        throw new Error(`Error al obtener resumen: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error en getSalesSummary:", error);
      throw error;
    }
  },

  // Obtener ingresos por categoría
  async getSalesByCategory() {
    try {
      const response = await fetch(`${API_URL}/sales/by-category`);
      if (!response.ok) {
        throw new Error(`Error al obtener ventas por categoría: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error en getSalesByCategory:", error);
      throw error;
    }
  },

  // Obtener ingresos por rango de fechas
  async getIncomeByDateRange(start, end) {
    try {
      const response = await fetch(`${API_URL}/sales/income-range?start=${start}&end=${end}`);
      if (!response.ok) {
        throw new Error(`Error en ingresos por rango: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error en getIncomeByDateRange:", error);
      throw error;
    }
  },

  // Crear nueva venta
  async insertSale(sale) {
    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      });
      if (!response.ok) {
        throw new Error(`Error al registrar venta: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("❌ Error en insertSale:", error);
      throw error;
    }
  },

  // Actualizar venta por ID
  async updateSale(id, sale) {
    try {
      const response = await fetch(`${API_URL}/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      });
      if (!response.ok) {
        throw new Error(`Error al actualizar venta: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("❌ Error en updateSale:", error);
      throw error;
    }
  },

  // Eliminar venta por ID
  async deleteSale(id) {
    try {
      const response = await fetch(`${API_URL}/sales/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Error al eliminar venta: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("❌ Error en deleteSale:", error);
      throw error;
    }
  },
};
