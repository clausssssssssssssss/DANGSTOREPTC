import { useState, useEffect } from 'react';
import axios from 'axios';

// URLs alternativas para probar conexión
const API_BASES = [
  'http://192.168.0.9:4000/api', // IP principal
 
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
      
      const response = await axios.get(`${apiBase}/categories`, {
        timeout: 8000,
      });
      
      console.log(' Conexión exitosa con categorías:', apiBase);
      
      // Transformar los datos del backend al formato esperado por el frontend
      const transformedCategories = response.data.map(category => ({
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
      
      if (err.code === 'ECONNABORTED') {
        console.log(` Timeout con categorías ${apiBase}`);
        setError('El servidor tardó demasiado en responder. Verifica tu conexión.');
      } else if (err.message.includes('Network Error') || err.message.includes('Network request failed')) {
        console.log(` Error de red con categorías ${apiBase}`);
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else if (err.code === 'ECONNREFUSED') {
        console.log(` Conexión rechazada con categorías ${apiBase}`);
        setError('Conexión rechazada. Verifica la IP y puerto del servidor.');
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
      
      const response = await axios.post(`${currentApiBase}/categories`, categoryData, {
        timeout: 8000,
      });
      
      console.log(' Categoría agregada exitosamente');
      
      // Recargar las categorías después de agregar una nueva
      await fetchCategories(currentApiBase);
      
      return response.data;
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
