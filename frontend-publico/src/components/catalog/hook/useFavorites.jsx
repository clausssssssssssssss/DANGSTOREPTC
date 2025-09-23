import { useState, useEffect } from 'react';

// URL del servidor local para desarrollo
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

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

      const response = await fetch(`${API_BASE}/profile/favorites`, {
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

      const response = await fetch(`${API_BASE}/profile/favorites/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();

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

    // Los toasts se manejan desde el componente padre
    
    return { wasFavorite, success: true };
  } catch (error) {
    console.error('Error al toggle favorito:', error);
    loadFavoritesFromBackend(); // Revertir
    return { wasFavorite: false, success: false, error };
  }
};

    
  return { 
    favorites, 
    toggleFavorite, 
    loading,
    refreshFavorites: loadFavoritesFromBackend 
  };
}