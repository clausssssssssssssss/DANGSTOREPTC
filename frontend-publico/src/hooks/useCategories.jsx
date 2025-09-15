import { useState, useEffect } from 'react';

const useCategories = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/categories');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setCategorias(data);
        setError(null);
      } catch (err) {
        console.error('Error obteniendo categorías:', err);
        setError(err.message);
        // Solo mostrar categorías por defecto si es un error de conexión real
        if (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed to fetch')) {
          setCategorias([
            { name: 'Llavero' },
            { name: 'Cuadro' }
          ]);
        } else {
          // Si es otro tipo de error (como 404, 500), mostrar array vacío
          setCategorias([]);
        }
      } finally {
        setLoading(false);
      }
    };

    obtenerCategorias();
  }, []);

  return { categorias, loading, error };
};

export default useCategories;
