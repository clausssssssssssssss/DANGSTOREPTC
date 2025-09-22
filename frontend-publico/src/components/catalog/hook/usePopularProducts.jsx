import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const usePopularProducts = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchPopularProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/products/popular`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.products)) {
        // Formatear los productos para que coincidan con la estructura esperada
        const formattedProducts = data.products.map(product => ({
          id: product.id,
          _id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          images: product.image ? [product.image] : [],
          category: product.category,
          description: product.description,
          stock: product.stock
        }));
        
        setPopularProducts(formattedProducts);
        setLastUpdate(new Date().toISOString());
        console.log('Productos populares cargados:', formattedProducts.length);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('Error al obtener productos populares:', err);
      setError(err.message);
      setPopularProducts([]);
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
    // Información adicional
    hasProducts: popularProducts.length > 0,
    totalProducts: popularProducts.length
  };
};

