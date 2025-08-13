import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const FavoritesContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || '';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  async function fetchFavorites() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/profile/favorites`, {
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
      toast.warn('Debes iniciar sesión para usar favoritos');
      return;
    }
    try {
      const exists = favorites.includes(productId);
      const updated = exists
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];

      setFavorites(updated);

      const res = await fetch(`${API_URL}/api/profile/favorites`, {
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

      toast.success(exists ? 'Producto eliminado de favoritos' : 'Producto agregado a favoritos');
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      toast.error('No se pudo actualizar tus favoritos. Intenta de nuevo.');
      // Revertir en caso de error
      fetchFavorites();
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
