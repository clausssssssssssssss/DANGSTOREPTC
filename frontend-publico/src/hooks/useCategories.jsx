import { useState, useEffect } from 'react';

// URL del servidor local para desarrollo
const API_BASE = 'http://192.168.0.9:4000/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Obteniendo categorías desde:', `${API_BASE}/categories`);
      
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
      console.log(`Categorías obtenidas: ${data.length} categorías`);
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
    
    // Configurar polling para sincronización automática cada 60 segundos
    const interval = setInterval(() => {
      console.log('Sincronizando categorías automáticamente...');
      fetchCategories();
    }, 60000); // 60 segundos
    
    // Limpiar interval cuando el componente se desmonte
    return () => {
      clearInterval(interval);
      console.log('Polling de categorías detenido');
    };
  }, []);

  const refresh = () => {
    fetchCategories();
  };

  return { categories, loading, error, refresh };
}