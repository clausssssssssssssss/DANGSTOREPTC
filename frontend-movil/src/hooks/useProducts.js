import { useState, useEffect } from 'react';
import axios from 'axios';

// URLs alternativas para probar conexión
const API_BASES = [
  'http://192.168.0.9:4000/api',
    // Para emulador iOS
];

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentApiBase, setCurrentApiBase] = useState('');

  const fetchProducts = async (apiBase) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(' Intentando conectar a:', `${apiBase}/products`);
      
      const response = await axios.get(`${apiBase}/products`, {
        timeout: 8000,
      });
      
      console.log(' Conexión exitosa con:', apiBase);
      
      // Transformar los datos del backend al formato esperado por el frontend
      const transformedProducts = response.data.map(product => ({
        _id: product._id,
        name: product.nombre,
        description: product.descripcion || '',
        price: product.precio,
        category: product.categoria || 'Llavero',
        images: product.imagen ? [product.imagen] : [],
        stock: product.disponibles || 0,
      }));
      
      setProducts(transformedProducts);
      setCurrentApiBase(apiBase);
      return true;
    } catch (err) {
      console.error(` Error con ${apiBase}:`, err.message);
      
      if (err.code === 'ECONNABORTED') {
        setError('El servidor tardó demasiado en responder. Verifica tu conexión.');
      } else if (err.message.includes('Network Error')) {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else {
        setError(`Error: ${err.message}`);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const tryAllApiEndpoints = async () => {
    let connected = false;
    
    for (const apiBase of API_BASES) {
      console.log(` Probando endpoint: ${apiBase}`);
      connected = await fetchProducts(apiBase);
      if (connected) {
        break; // Si funciona, salir del bucle
      }
      
      // Esperar un poco antes de intentar el siguiente endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (!connected) {
      setError('No se pudo conectar con ningún endpoint. Revisa la configuración de red.');
    }
  };

  useEffect(() => {
    tryAllApiEndpoints();
  }, []);

  const refresh = () => {
    tryAllApiEndpoints();
  };

  return { products, loading, error, refresh, currentApiBase };
}