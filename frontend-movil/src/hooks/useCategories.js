import { useState, useEffect } from 'react';

// URLs alternativas para probar conexión
const API_BASES = [
  'https://dangstoreptc-production.up.railway.app/api', // IP principal
 
];

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentApiBase, setCurrentApiBase] = useState('');

  const fetchCategories = async (apiBase) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(' Intentando conectar a categorías:', `${apiBase}/categories`);
      
      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${apiBase}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(' Conexión exitosa con categorías:', apiBase);
      
      // Transformar los datos del backend al formato esperado por el frontend
      const transformedCategories = data.map(category => ({
        _id: category._id,
        name: category.nombre || category.name,
        description: category.descripcion || category.description || '',
        image: category.imagen || category.image || '',
      }));
      
      setCategories(transformedCategories);
      setCurrentApiBase(apiBase);
      return true;
    } catch (err) {
      console.error(` Error con categorías ${apiBase}:`, err.message);
      console.error(' Detalles del error:', err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('Network request failed')) {
        console.log(` Error de red con categorías ${apiBase}`);
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else if (err.message.includes('timeout')) {
        console.log(` Timeout con categorías ${apiBase}`);
        setError('El servidor tardó demasiado en responder. Verifica tu conexión.');
      } else if (err.message.includes('HTTP')) {
        console.log(` Error HTTP con categorías ${apiBase}:`, err.message);
        setError(`Error del servidor: ${err.message}`);
      } else {
        console.log(` Error desconocido con categorías ${apiBase}:`, err.message);
        setError(`Error: ${err.message}`);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const tryAllApiEndpoints = async () => {
    for (const apiBase of API_BASES) {
      console.log(` Probando categorías con: ${apiBase}`);
      const success = await fetchCategories(apiBase);
      if (success) {
        console.log(` Conexión exitosa con categorías: ${apiBase}`);
        return;
      }
    }
    console.error(' No se pudo conectar a ningún endpoint de categorías');
  };

  useEffect(() => {
    tryAllApiEndpoints();
  }, []);

  const addCategory = async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(' Agregando categoría:', categoryData);
      
      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${currentApiBase}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(' Categoría agregada exitosamente');
      
      // Recargar las categorías después de agregar una nueva
      await fetchCategories(currentApiBase);
      
      return data;
    } catch (err) {
      console.error(' Error al agregar categoría:', err.message);
      setError(`Error al agregar categoría: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    refetch: () => tryAllApiEndpoints(),
  };
}
