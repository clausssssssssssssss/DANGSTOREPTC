import { useState, useEffect } from 'react';

// URL del servidor local para desarrollo
const API_BASE = 'http://192.168.0.3:4000/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando conectar a:', `${API_BASE}/products`);
      
      const response = await fetch(`${API_BASE}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transformar los datos del backend al formato esperado por el frontend
      const transformedProducts = data.map(product => {
        // Manejar ambos tipos de productos (antiguos y nuevos)
        const isNewFormat = product.nombre && product.precio; // Productos nuevos
        const isOldFormat = product.name && product.price; // Productos antiguos
        
        if (isNewFormat) {
          // Productos nuevos: usar campos directos
          return {
            _id: product._id,
            name: product.nombre,
            description: product.descripcion || '',
            price: product.precio,
            category: product.categoria || 'Llavero',
            images: product.imagen ? [`http://192.168.0.3:4000/uploads/${product.imagen}`] : [],
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
            images: product.images || (product.imagen ? [`http://192.168.0.3:4000/uploads/${product.imagen}`] : []),
            stock: product.stock || product.disponibles || 0,
          };
        }
      });
      
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error al obtener productos:', err.message);
      
      if (err.message.includes('Failed to fetch')) {
        setError('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      } else if (err.message.includes('timeout')) {
        setError('El servidor tardó demasiado en responder. Verifica tu conexión.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const refresh = () => {
    fetchProducts();
  };

  return { products, loading, error, refresh };
}
