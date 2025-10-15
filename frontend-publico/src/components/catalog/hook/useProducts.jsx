import { useState, useEffect } from 'react';

// URLs del servidor
const RAILWAY_API = 'https://dangstoreptc-production.up.railway.app/api';
const LOCAL_API = 'http://localhost:4000/api';

// Intentar Railway primero, luego localhost como fallback
const API_BASE = RAILWAY_API;

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [usingLocalhost, setUsingLocalhost] = useState(false);

  const fetchProducts = async (useRailway = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentAPI = useRailway ? RAILWAY_API : LOCAL_API;
      setUsingLocalhost(!useRailway);
      
      // Skip test para acelerar la carga
      // console.log('🛍️ Cargando productos directamente desde:', `${currentAPI}/products`);
      
      const response = await fetch(`${currentAPI}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📨 Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      console.log('📊 Cantidad de productos:', data.length);
      
      // Transformar los datos del backend al formato esperado por el frontend
      const transformedProducts = data.map(product => {
        // Manejar ambos tipos de productos (antiguos y nuevos)
        const isNewFormat = product.nombre && product.precio; // Productos nuevos (español)
        const isOldFormat = product.name && product.price; // Productos antiguos (inglés)
        
        
        if (isNewFormat) {
          // Productos nuevos: usar campos directos
          return {
            _id: product._id,
            name: product.nombre,
            description: product.descripcion || '',
            price: product.precio,
            category: product.categoria || 'Llavero',
            images: product.imagen ? [product.imagen] : [], // Usar la URL completa de Cloudinary
            stock: product.disponibles || 0,
          };
        } else if (isOldFormat) {
          // Productos antiguos: usar arrays de imágenes
          return {
            _id: product._id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category || 'Llavero',
            images: product.images || [],
            stock: product.stock || 0,
          };
        } else {
          // Fallback para productos con estructura desconocida
          return {
            _id: product._id,
            name: product.name || product.nombre || 'Producto',
            description: product.description || product.descripcion || '',
            price: product.price || product.precio || 0,
            category: product.category || product.categoria || 'Llavero',
            images: product.images || (product.imagen ? [product.imagen] : []), // Usar la URL completa de Cloudinary
            stock: product.stock || product.disponibles || 0,
          };
        }
      });
      
      setProducts(transformedProducts);
      setLastUpdate(new Date().toISOString());
      console.log('✅ Productos cargados exitosamente:', transformedProducts.length);
    } catch (err) {
      console.error('❌ Error al obtener productos:', err.message);
      console.error('❌ Error completo:', err);
      
      if (useRailway && (err.name === 'AbortError' || err.message.includes('Failed to fetch'))) {
        console.log('🔄 Railway falló, intentando con localhost...');
        try {
          await fetchProducts(false); // Intentar con localhost
          return;
        } catch (localhostError) {
          console.error('❌ Localhost también falló:', localhostError);
          setError('Railway y localhost fallaron. Verifica tu conexión a internet.');
        }
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Recarga automática desactivada para mejorar la experiencia visual
    // Los productos se pueden actualizar manualmente con el botón de actualizar
  }, []);

  const refresh = () => {
    fetchProducts();
  };

  return { products, loading, error, refresh, lastUpdate, usingLocalhost };
}
