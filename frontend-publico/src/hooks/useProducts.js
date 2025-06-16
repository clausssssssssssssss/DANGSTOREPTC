// src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error al recargar los productos');
      } finally {
        setLoading(false);
      }
    }
  };
};