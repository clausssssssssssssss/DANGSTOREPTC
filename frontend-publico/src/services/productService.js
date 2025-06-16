// src/services/productService.js

const API_BASE_URL = 'http://tu-backend.com/api'; // Ajusta esta URL

export const productService = {
  async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Estos pueden ser unos metodos futuros, si les parece hablemos de agregarlos luego.
  // getProductById, createProduct, updateProduct, etc.
};