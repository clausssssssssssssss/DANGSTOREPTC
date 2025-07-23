import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4000/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/catalog`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      
      // DEBUGGING: Agrega esto para ver qué datos llegan
      console.log('Datos del backend:', data);
      data.forEach(product => {
        console.log(`Producto: ${product.name}, Imágenes:`, product.images);
        // En useProducts.jsx, cambia esta parte:
console.log('Datos del backend:', data);
data.forEach(product => {
  console.log(`Producto: ${product.name}, Imágenes:`, product.images);
  // AGREGA ESTA LÍNEA:
  console.log(`URLs completas:`, product.images?.map(img => `"${img}"`));
});
      });
      
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Función refresh que falta
  const refresh = () => {
    fetchCatalog();
  };

  return { products, loading, error, refresh };
}