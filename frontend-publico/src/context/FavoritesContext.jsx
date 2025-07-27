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

  const toggleFavorite = async (product) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.warning("Debes iniciar sesión para agregar favoritos");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/profile/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error al actualizar favorito:", data);
        return;
      }

      setFavoritesList(data.favorites); // actualiza el estado con el nuevo array
      toast.success(`'${product.name}' agregado a favoritos`, { autoClose: 1800 });

    } catch (err) {
      console.error("❌ Error al hacer toggle de favorito:", err);
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
