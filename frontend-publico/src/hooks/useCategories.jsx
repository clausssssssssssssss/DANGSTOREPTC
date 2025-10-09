import { useState, useEffect } from 'react';

// URL del servidor en producción (Render)
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error al obtener categorías:', err.message);
      
      if (err.message.includes('Failed to fetch')) {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    
    // Recarga automática desactivada para mejorar la experiencia visual
    // Las categorías se pueden actualizar manualmente si es necesario
  }, []);

  const refresh = () => {
    fetchCategories();
  };

  return { categories, loading, error, refresh };
}

export default useCategories;