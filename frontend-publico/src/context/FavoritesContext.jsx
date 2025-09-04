import { createContext, useContext, useEffect, useState } from "react";

// URL del servidor local para desarrollo
const API_BASE = 'http://192.168.0.3:4000/api';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  async function fetchFavorites() {
    const token = localStorage.getItem("token");
    if (!token) {
      setFavorites([]);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/profile/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        // Verificar si la respuesta es HTML en lugar de JSON
        if (errorText.includes('<!doctype') || errorText.includes('<html')) {
          console.error("Error: El servidor está devolviendo HTML en lugar de JSON");
          return;
        }
        
        // Si hay error de autenticación, limpiar favoritos y token
        if (res.status === 401) {
          setFavorites([]);
          localStorage.removeItem('token');
          return;
        }
        
        console.error("Error al obtener favoritos:", res.status, errorText);
        return;
      }
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setFavorites(data.map((id) => id));
      } else {
        console.warn("Respuesta inesperada al obtener favoritos:", data);
        setFavorites([]);
      }
    } catch (err) {
      console.error("Error de red al obtener favoritos:", err);
      setFavorites([]);
    }
  }

  async function toggleFavorite(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: 'Debes iniciar sesión para usar favoritos' };
    }
    try {
      const exists = favorites.includes(productId);
      const updated = exists
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];

      setFavorites(updated);

      const res = await fetch(`${API_BASE}/profile/favorites`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favorites: updated }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'No se pudo actualizar favoritos');
      }

      return { success: true, wasFavorite: exists };
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      // Revertir en caso de error
      fetchFavorites();
      return { success: false, message: 'No se pudo actualizar tus favoritos. Intenta de nuevo.' };
    }
  }

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
