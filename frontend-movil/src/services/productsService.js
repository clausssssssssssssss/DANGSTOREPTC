import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

class ProductsService {
  // Obtener token de autenticación
  async getAuthToken() {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  // Obtener headers con autenticación
  async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Obtener todos los productos del catálogo
  async getCatalogProducts() {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: await this.getHeaders()
      });

      if (!response.ok) {
        console.log('Error obteniendo productos del catálogo, usando datos de ejemplo');
        // Retornar datos de ejemplo si la API falla
        return this.getFallbackCatalogProducts();
      }

      const data = await response.json();
      return data.success ? data.products || [] : this.getFallbackCatalogProducts();
    } catch (error) {
      console.error('Error obteniendo productos del catálogo:', error);
      return this.getFallbackCatalogProducts();
    }
  }

  // Datos de ejemplo para productos del catálogo
  getFallbackCatalogProducts() {
    return [
      {
        _id: '1',
        nombre: 'Llavero Personalizado',
        disponibles: 5,
        precio: 15000,
        categoria: 'Llaveros',
        descripcion: 'Llavero personalizado con tu diseño favorito',
        imagenes: ['/src/assets/llavero.png'],
        stockLimits: { maxStock: 10, isStockLimitActive: true },
        createdAt: new Date(),
        activo: true
      },
      {
        _id: '2',
        nombre: 'Cuadro Decorativo',
        disponibles: 0,
        precio: 25000,
        categoria: 'Decoración',
        descripcion: 'Cuadro decorativo para el hogar',
        imagenes: ['/src/assets/cuadro.png'],
        stockLimits: { maxStock: 5, isStockLimitActive: true },
        createdAt: new Date(),
        activo: true
      },
      {
        _id: '3',
        nombre: 'Taza Personalizada',
        disponibles: 15,
        precio: 18000,
        categoria: 'Tazas',
        descripcion: 'Taza personalizada con tu foto',
        imagenes: ['/src/assets/llavero.png'],
        stockLimits: { maxStock: 20, isStockLimitActive: false },
        createdAt: new Date(),
        activo: true
      }
    ];
  }

  // Obtener todos los encargos personalizados
  async getCustomOrders() {
    try {
      const response = await fetch(`${API_URL}/custom-orders`, {
        method: 'GET',
        headers: await this.getHeaders()
      });

      if (!response.ok) {
        console.log('Error obteniendo encargos personalizados, usando datos de ejemplo');
        return this.getFallbackCustomOrders();
      }

      const data = await response.json();
      return data.success ? data.orders || [] : this.getFallbackCustomOrders();
    } catch (error) {
      console.error('Error obteniendo encargos personalizados:', error);
      return this.getFallbackCustomOrders();
    }
  }

  // Datos de ejemplo para encargos personalizados
  getFallbackCustomOrders() {
    return [
      {
        _id: 'custom1',
        nombre: 'Encargo Personalizado - Llavero',
        disponibles: 3,
        precio: 20000,
        categoria: 'Encargo Personalizado',
        descripcion: 'Llavero personalizado con diseño especial',
        imagenes: ['/src/assets/llavero.png'],
        stockLimits: { maxStock: 5, isStockLimitActive: true },
        createdAt: new Date(),
        activo: true,
        cliente: 'María González',
        estado: 'completado'
      },
      {
        _id: 'custom2',
        nombre: 'Encargo Personalizado - Cuadro',
        disponibles: 1,
        precio: 35000,
        categoria: 'Encargo Personalizado',
        descripcion: 'Cuadro personalizado con foto familiar',
        imagenes: ['/src/assets/cuadro.png'],
        stockLimits: { maxStock: 2, isStockLimitActive: true },
        createdAt: new Date(),
        activo: true,
        cliente: 'Carlos Rodríguez',
        estado: 'pendiente'
      }
    ];
  }

  // Obtener todos los productos (catálogo + encargos personalizados)
  async getAllProducts() {
    try {
      const [catalogProducts, customOrders] = await Promise.all([
        this.getCatalogProducts(),
        this.getCustomOrders()
      ]);

      // Formatear productos del catálogo
      const formattedCatalogProducts = catalogProducts.map(product => ({
        _id: product._id,
        nombre: product.nombre || product.name,
        disponibles: product.disponibles || product.stock || 0,
        precio: product.precio || product.price || 0,
        categoria: product.categoria || product.category || 'Catálogo',
        tipo: 'catalogo',
        descripcion: product.descripcion || product.description || '',
        imagenes: product.imagenes || product.images || [],
        stockLimits: product.stockLimits || {
          maxStock: null,
          isStockLimitActive: true
        },
        fechaCreacion: product.createdAt || new Date(),
        activo: product.activo !== false
      }));

      // Formatear encargos personalizados
      const formattedCustomOrders = customOrders.map(order => ({
        _id: order._id,
        nombre: order.nombre || order.name || `Encargo Personalizado - ${order._id.slice(-6)}`,
        disponibles: order.disponibles || order.stock || 0,
        precio: order.precio || order.price || 0,
        categoria: 'Encargo Personalizado',
        tipo: 'custom',
        descripcion: order.descripcion || order.description || 'Producto personalizado',
        imagenes: order.imagenes || order.images || [],
        stockLimits: order.stockLimits || {
          maxStock: null,
          isStockLimitActive: true
        },
        fechaCreacion: order.createdAt || new Date(),
        activo: order.activo !== false,
        cliente: order.cliente || order.customer,
        estado: order.estado || order.status || 'pendiente'
      }));

      // Combinar todos los productos
      const allProducts = [...formattedCatalogProducts, ...formattedCustomOrders];

      // Ordenar por fecha de creación (más recientes primero)
      allProducts.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

      return allProducts;
    } catch (error) {
      console.error('Error obteniendo todos los productos:', error);
      return [];
    }
  }

  // Obtener productos por categoría
  async getProductsByCategory(category) {
    try {
      const allProducts = await this.getAllProducts();
      
      if (category === 'todos' || !category) {
        return allProducts;
      }

      return allProducts.filter(product => 
        product.categoria.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      return [];
    }
  }

  // Obtener categorías disponibles
  async getCategories() {
    try {
      const allProducts = await this.getAllProducts();
      const categories = [...new Set(allProducts.map(product => product.categoria))];
      return categories.sort();
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }

  // Buscar productos por nombre
  async searchProducts(query) {
    try {
      const allProducts = await this.getAllProducts();
      const searchTerm = query.toLowerCase();
      
      return allProducts.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripcion.toLowerCase().includes(searchTerm) ||
        product.categoria.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error buscando productos:', error);
      return [];
    }
  }

  // Obtener productos con stock bajo
  async getLowStockProducts(threshold = 5) {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => 
        product.stockLimits.isStockLimitActive && 
        product.disponibles <= threshold
      );
    } catch (error) {
      console.error('Error obteniendo productos con stock bajo:', error);
      return [];
    }
  }

  // Obtener productos sin stock
  async getOutOfStockProducts() {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => 
        product.stockLimits.isStockLimitActive && 
        product.disponibles === 0
      );
    } catch (error) {
      console.error('Error obteniendo productos sin stock:', error);
      return [];
    }
  }
}

export default new ProductsService();
