import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';


export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar favoritos desde el backend al iniciar
  useEffect(() => {
    if (!userId) return;
    
    loadFavoritesFromBackend();
  }, [userId]);

  // Función para cargar favoritos desde el backend
  const loadFavoritesFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/profile/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const products = await response.json();
        // Extraer solo los IDs de los productos
        const favoriteIds = products.map(product => product._id);
        setFavorites(favoriteIds);
        
        // Sincronizar con localStorage también
        localStorage.setItem(`favorites-${userId}`, JSON.stringify(favoriteIds));
        
        console.log('✅ Favoritos cargados desde backend:', favoriteIds);
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      // Fallback: cargar desde localStorage
      const stored = localStorage.getItem(`favorites-${userId}`);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar favorito en backend Y localStorage
  const saveFavoriteToBackend = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`/api/profile/favorites/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Favorito actualizado en backend:', result);
        return result.favorites; // Array de IDs desde el backend
      } else {
        throw new Error(`Error ${response.status}`);
      }
    } catch (error) {
      console.error('Error guardando favorito en backend:', error);
      throw error;
    }
  };

  // Función para guardar localmente
  function save(newFavs) {
    setFavorites(newFavs);
    localStorage.setItem(`favorites-${userId}`, JSON.stringify(newFavs));
  }

  // Toggle favorito - sincroniza backend y frontend
  const toggleFavorite = async (productId) => {
  try {
    const currentFavorites = [...favorites];
    let updatedFavorites;
    
    const wasFavorite = currentFavorites.includes(productId);
    updatedFavorites = wasFavorite
      ? currentFavorites.filter(id => id !== productId)
      : [...currentFavorites, productId];

    save(updatedFavorites); // Optimistic UI update

    const backendFavorites = await saveFavoriteToBackend(productId);
    save(backendFavorites); // Actualizar desde backend

    // Mostrar toast según acción
    if (wasFavorite) {
      toast.success('💔 Producto eliminado de favoritos');
    } else {
      toast.success('❤️ Producto agregado a favoritos');
    }

    console.log('✅ Favorito sincronizado correctamente');
  } catch (error) {
    console.error('Error al toggle favorito:', error);
    loadFavoritesFromBackend(); // Revertir
  }
};

    
  return { 
    favorites, 
    toggleFavorite, 
    loading,
    refreshFavorites: loadFavoritesFromBackend 
  };
}