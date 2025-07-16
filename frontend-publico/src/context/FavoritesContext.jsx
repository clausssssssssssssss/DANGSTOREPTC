import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // Cargar favoritos desde backend al iniciar
  useEffect(() => {
    fetch('/api/profile/favorites', {
      credentials: 'include', // para enviar cookies de sesión
    })
      .then(res => res.json())
      .then(data => setFavorites(data.map(p => p._id))) // guardamos sólo los IDs
      .catch(console.error);
  }, []);

  async function toggleFavorite(productId) {
    try {
      const res = await fetch(`/api/profile/favorites/${productId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      setFavorites(data.favorites); // actualiza con el array que envía el backend
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    }
  }

  function isFavorite(productId) {
    return favorites.includes(productId);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  return ctx;
}
