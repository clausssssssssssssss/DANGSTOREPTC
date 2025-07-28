import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const FavoritesContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const FavoritesProvider = ({ children }) => {
  const [favoritesList, setFavoritesList] = useState([]);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("⚠️ No hay token de autenticación para obtener favoritos");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/profile/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error al obtener favoritos:", data);
        return;
      }

      if (Array.isArray(data)) {
        setFavoritesList(data.map((id) => id));
      } else {
        console.warn("❗ Respuesta inesperada del backend (favoritos):", data);
        setFavoritesList([]);
      }

    } catch (err) {
      console.error("❌ Error de red al obtener favoritos:", err);
    }
  };

const toggleFavorite = async (productId) => {
  if (!user) {
    console.warn('Usuario no autenticado, no se puede modificar favoritos');
    return;
  }

  try {
    const alreadyFavorite = favorites.includes(productId);
    let updatedFavorites;

    if (alreadyFavorite) {
      // quitar de favoritos
      updatedFavorites = favorites.filter((id) => id !== productId);
      toast.info('Producto eliminado de favoritos 🗑️');
    } else {
      // agregar a favoritos
      updatedFavorites = [...favorites, productId];
      toast.success('Producto agregado a favoritos ❤️');
    }

    setFavorites(updatedFavorites);

    const res = await fetch(`${API_URL}/api/profile/favorites`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ favorites: updatedFavorites }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error al actualizar favoritos');
    }

  } catch (error) {
    console.error('Error al actualizar favoritos:', error);
    toast.error('No se pudo actualizar tus favoritos. Intenta de nuevo.');
  }
};


  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <FavoritesContext.Provider value={{ favoritesList, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
