import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dangstoreptc.onrender.com';

// Productos de ejemplo con IDs válidos de MongoDB
const getFallbackProducts = () => [
  {
    id: '507f1f77bcf86cd799439011',
    _id: '507f1f77bcf86cd799439011',
    name: 'Llavero Personalizado',
    price: 15000,
    image: '/src/assets/llavero.png',
    images: ['/src/assets/llavero.png'],
    category: 'Llavero',
    description: 'Llavero personalizado con tu diseño favorito',
    stock: 10
  },
  {
    id: '507f1f77bcf86cd799439012',
    _id: '507f1f77bcf86cd799439012',
    name: 'Llavero de Acero',
    price: 20000,
    image: '/src/assets/llavero.png',
    images: ['/src/assets/llavero.png'],
    category: 'Llavero',
    description: 'Llavero de acero inoxidable de alta calidad',
    stock: 5
  },
  {
    id: '507f1f77bcf86cd799439013',
    _id: '507f1f77bcf86cd799439013',
    name: 'Llavero de Madera',
    price: 12000,
    image: '/src/assets/llavero.png',
    images: ['/src/assets/llavero.png'],
    category: 'Llavero',
    description: 'Llavero artesanal de madera natural',
    stock: 8
  }
];

export const usePopularProducts = () => {
  const [popularProducts, setPopularProducts] = useState(getFallbackProducts());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  const fetchPopularProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/products/popular`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.products)) {
        const formattedProducts = data.products.map(product => ({
          id: product.id,
          _id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '/src/assets/llavero.png',
          images: product.image ? [product.image] : ['/src/assets/llavero.png'],
          category: product.category,
          description: product.description,
          stock: product.stock
        }));
        
        setPopularProducts(formattedProducts);
        setLastUpdate(new Date().toISOString());
      } else {
        throw new Error('Formato de respuesta inválido del servidor');
      }
    } catch (err) {
      console.log('Usando productos de ejemplo (servidor no disponible)');
      setError(null); // No mostrar error, usar productos de ejemplo
      setPopularProducts(getFallbackProducts());
      setLastUpdate(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchPopularProducts();
  }, [fetchPopularProducts]);

  // Función para refrescar los datos
  const refresh = useCallback(() => {
    fetchPopularProducts();
  }, [fetchPopularProducts]);

  return {
    popularProducts,
    loading,
    error,
    lastUpdate,
    refresh,
    hasProducts: popularProducts.length > 0,
    totalProducts: popularProducts.length
  };
};