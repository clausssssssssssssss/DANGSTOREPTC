import { useState, useEffect } from 'react';
import axios from 'axios';

// URLs alternativas para probar conexión
const API_BASES = [
  'http://192.168.0.9:4000/api', // IP principal
  'http://192.168.56.1:4000/api', // IP alternativa
  'http://192.168.0.8:4000/api', // IP alternativa
  'http://10.0.2.2:4000/api', // Para emulador Android
  'http://localhost:4000/api', // Para emulador iOS
  'http://127.0.0.1:4000/api', // Localhost alternativo
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
      console.error(' Detalles del error:', err);
      
      if (err.code === 'ECONNABORTED') {
        console.log(` Timeout con ${apiBase}`);
        setError('El servidor tardó demasiado en responder. Verifica tu conexión.');
      } else if (err.message.includes('Network Error') || err.message.includes('Network request failed')) {
        console.log(` Error de red con ${apiBase}`);
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else if (err.code === 'ECONNREFUSED') {
        console.log(` Conexión rechazada con ${apiBase}`);
        setError('Conexión rechazada. Verifica la IP y puerto del servidor.');
      } else {
        console.log(` Error desconocido con ${apiBase}:`, err.message);
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

  const addProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(' Agregando producto:', productData);
      console.log(' Usando endpoint:', currentApiBase);
      
      const response = await axios.post(`${currentApiBase}/products`, productData, {
        timeout: 8000,
      });
      
      console.log(' Producto agregado exitosamente');
      
      // Recargar los productos después de agregar uno nuevo
      await fetchProducts(currentApiBase);
      
      return response.data;
    } catch (err) {
      console.error(' Error al agregar producto:', err.message);
      console.error(' Detalles del error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('El servidor tardó demasiado en responder. Verifica tu conexión.');
      } else if (err.message.includes('Network Error') || err.message.includes('Network request failed')) {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else if (err.code === 'ECONNREFUSED') {
        setError('Conexión rechazada. Verifica la IP y puerto del servidor.');
      } else {
        setError(`Error al agregar producto: ${err.message}`);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refresh, addProduct, currentApiBase };
}