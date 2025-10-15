import { useState, useEffect } from 'react';

// Construir lista de endpoints según entorno
const ENV_URL = (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL)
  ? process.env.EXPO_PUBLIC_API_URL
  : null;

// En producción (o cuando se define EXPO_PUBLIC_API_URL), solo usar ese endpoint.
// En desarrollo sin ENV, permitir fallback a localhost.
const API_BASES = ENV_URL
  ? [ENV_URL]
  : [
      'https://dangstoreptc-production.up.railway.app/api', // Railway principal
      'http://localhost:4000/api', // Localhost fallback (solo dev)
    ];

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentApiBase, setCurrentApiBase] = useState('');
  const [lastStockUpdate, setLastStockUpdate] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchProducts = async (apiBase) => {
    try {
      // Evitar solicitudes en paralelo que puedan saturar o crear bucles
      if (isFetching) return false;
      setIsFetching(true);
      setLoading(true);
      setError(null);
      
      // Skip test para acelerar la carga
      console.log('🛍️ Cargando productos directamente desde:', `${apiBase}/products`);

      // Timeout de 12s para evitar que la pantalla quede "colgada"
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${apiBase}/products`, {
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
      
      // Verificar si hay datos
      if (!Array.isArray(data)) {
        console.error(' Los datos recibidos no son un array:', data);
        throw new Error('Formato de datos inválido del servidor');
      }
      
      // Transformar los datos del backend al formato esperado por el frontend
      const transformedProducts = data.map(product => {
        return {
          _id: product._id,
          nombre: product.nombre || product.name, // Mantener nombre original para compatibilidad
          descripcion: product.descripcion || product.description || '',
          precio: product.precio || product.price,
          disponibles: product.disponibles || product.stock || 0,
          categoria: product.categoria || product.category || 'Llavero',
          imagen: product.imagen || (product.images && product.images[0]) || null,
          // Campos adicionales para compatibilidad
          name: product.nombre || product.name,
          description: product.descripcion || product.description || '',
          price: product.precio || product.price,
          category: product.categoria || product.category || 'Llavero',
          images: product.imagen ? [product.imagen] : (product.images || []),
          stock: product.disponibles || product.stock || 0,
        };
      });
      
      setProducts(transformedProducts);
      setCurrentApiBase(apiBase);
      setLastStockUpdate(new Date().toISOString());
      
      // Productos cargados correctamente
      return true;
    } catch (err) {
      console.error(` Error con ${apiBase}:`, err.message);
      console.error(' Detalles del error:', err);
      
      if (err.name === 'AbortError') {
        setError('Timeout de conexión');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network request failed')) {
        setError('Sin conexión al servidor');
      } else if (err.message.includes('HTTP')) {
        setError(`Error del servidor: ${err.message}`);
      } else {
        setError(`Error: ${err.message}`);
      }
      
      return false;
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const tryAllApiEndpoints = async () => {
    try {
      let connected = false;
      
      for (const apiBase of API_BASES) {
        try {
          connected = await fetchProducts(apiBase);
          if (connected) {
            break; // Si funciona, salir del bucle
          }
        } catch (error) {
          console.error(`Error con endpoint ${apiBase}:`, error);
        }
        
        // Esperar un poco antes de intentar el siguiente endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (!connected) {
        setError('No se pudo conectar con ningún endpoint. Revisa la configuración de red.');
      }
    } catch (error) {
      console.error('Error en tryAllApiEndpoints:', error);
      setError('Error interno al conectar con el servidor');
    }
  };

  useEffect(() => {
    tryAllApiEndpoints();
    
    // Configurar polling para actualización automática de stock cada 30 segundos
    const interval = setInterval(() => {
      try {
        tryAllApiEndpoints();
      } catch (error) {
        console.error('Error en polling de productos:', error);
      }
    }, 30000); // 30 segundos - menos frecuente para evitar problemas
    
    // Limpiar interval cuando el componente se desmonte
    return () => {
      clearInterval(interval);
      console.log(' Polling de productos móvil detenido');
    };
  }, []);

  const refresh = () => {
    tryAllApiEndpoints();
  };

  const addProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Agregando producto...
      
      const formData = new FormData();
      formData.append('nombre', productData.nombre);
      formData.append('descripcion', productData.descripcion);
      formData.append('precio', productData.precio);
      formData.append('disponibles', productData.disponibles);
      formData.append('categoria', productData.categoria);
      
      if (productData.imagen) {
        let filename = productData.imagen.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('imagen', {
          uri: productData.imagen,
          name: filename,
          type,
        });
      }
      
      const response = await fetch(`${currentApiBase}/products`, {
        method: 'POST',
        body: formData,
        // No establecer Content-Type para FormData, el navegador lo hará automáticamente
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Producto agregado');
      
      // Recargar los productos después de agregar uno nuevo
      await fetchProducts(currentApiBase);
      
      return data;
    } catch (err) {
      console.error(' Error al agregar producto:', err.message);
      console.error(' Detalles del error:', err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('Network request failed')) {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else if (err.message.includes('timeout')) {
        setError('El servidor tardó demasiado en responder. Verifica tu conexión.');
      } else if (err.message.includes('HTTP')) {
        setError(`Error del servidor: ${err.message}`);
      } else {
        setError(`Error al agregar producto: ${err.message}`);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refresh, addProduct, currentApiBase, lastStockUpdate };
}