import { createContext, useContext, useEffect, useState } from "react";

// URL del servidor de producción
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  async function fetchFavorites() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/profile/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error al obtener favoritos:", data);
        return;
      }
      if (Array.isArray(data)) {
        setFavorites(data.map((id) => id));
      } else {
        console.warn("Respuesta inesperada al obtener favoritos:", data);
        setFavorites([]);
      }
    } catch (err) {
      console.error("Error de red al obtener favoritos:", err);
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
