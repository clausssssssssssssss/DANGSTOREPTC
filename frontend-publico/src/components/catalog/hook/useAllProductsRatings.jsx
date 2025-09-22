import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.jsx';

// URL del servidor local para desarrollo
const API_BASE = 'https://dangstoreptc.onrender.com/api';

export const useAllProductsRatings = (products) => {
  const { user } = useAuth();
  const [productsRatings, setProductsRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar ratings para todos los productos
  const loadAllProductsRatings = async () => {
    if (!products || products.length === 0) return;
    
    try {
      setLoading(true);
      const ratingsPromises = products.map(async (product) => {
        try {
          const response = await fetch(`${API_BASE}/ratings/product/${product._id}`);
          if (response.ok) {
            const data = await response.json();
            return {
              productId: product._id,
              ratings: data.ratings || [],
              totalRatings: data.totalRatings || 0,
              averageRating: data.averageRating || 0
            };
          }
          return {
            productId: product._id,
            ratings: [],
            totalRatings: 0,
            averageRating: 0
          };
        } catch (err) {
          console.error(`Error cargando ratings para producto ${product._id}:`, err);
          return {
            productId: product._id,
            ratings: [],
            totalRatings: 0,
            averageRating: 0
          };
        }
      });

      const results = await Promise.all(ratingsPromises);
      const ratingsMap = {};
      results.forEach(result => {
        ratingsMap[result.productId] = result;
      });

      setProductsRatings(ratingsMap);
    } catch (err) {
      console.error('Error cargando ratings de productos:', err);
      setError('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar ratings cuando cambien los productos
  useEffect(() => {
    if (products && products.length > 0) {
      loadAllProductsRatings();
    }
  }, [products]);

  // Obtener ratings de un producto específico
  const getProductRatings = (productId) => {
    return productsRatings[productId] || {
      ratings: [],
      totalRatings: 0,
      averageRating: 0
    };
  };

  // Actualizar ratings de un producto específico
  const updateProductRatings = (productId, newRatings) => {
    setProductsRatings(prev => ({
      ...prev,
      [productId]: newRatings
    }));
  };

  return {
    productsRatings,
    getProductRatings,
    updateProductRatings,
    loading,
    error,
    loadAllProductsRatings
  };
};
