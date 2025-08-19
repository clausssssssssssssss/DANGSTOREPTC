import { useState, useEffect } from 'react';

// Usar el proxy configurado en vite.config.js
const API_BASE = '/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando conectar a:', `${API_BASE}/catalog`);
      
      const res = await fetch(`${API_BASE}/catalog`);
      
      console.log('Respuesta del servidor:', res.status, res.statusText);
      
      if (!res.ok) {
        // Intentar leer el texto de la respuesta para debuggear
        const errorText = await res.text();
        console.error('Error response text:', errorText);
        
        if (errorText.includes('<!doctype') || errorText.includes('<html')) {
          throw new Error('El servidor está devolviendo HTML en lugar de JSON. Verifica que la API esté corriendo.');
        }
        
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Datos recibidos:', data);
      
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      
      // Mensaje de error más específico
      if (err.message.includes('fetch')) {
        setError('No se puede conectar con el servidor. Verifica que la API esté corriendo.');
      } else {
        setError(err.message);
      }
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