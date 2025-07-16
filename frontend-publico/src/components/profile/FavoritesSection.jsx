import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const FavoritesSection = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch('/api/profile/favorites', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Status response:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token inválido o expirado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const products = await response.json();
      console.log('Productos favoritos recibidos:', products);
      
      // El backend ya devuelve los productos completos con detalles
      setFavorites(products);
      
      // Sincronizar IDs con localStorage para el hook useFavorites
      if (userId) {
        const favoriteIds = products.map(product => product._id);
        localStorage.setItem(`favorites-${userId}`, JSON.stringify(favoriteIds));
      }
      
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const removeFavorite = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`/api/profile/favorites/${productId}`, {
        method: 'POST', // Tu backend usa POST para toggle
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Favorito removido:', result);
      
      // Actualizar lista local
      setFavorites(prev => prev.filter(product => product._id !== productId));
      
      // Sincronizar con localStorage
      if (userId) {
        const updatedIds = favorites
          .filter(product => product._id !== productId)
          .map(product => product._id);
        localStorage.setItem(`favorites-${userId}`, JSON.stringify(updatedIds));
      }
      
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="content-card">
        <h3 className="history-title">Favoritos</h3>
        <div className="loading-message">Cargando favoritos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-card">
        <h3 className="history-title">Favoritos</h3>
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchFavorites} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <h3 className="history-title">Favoritos ({favorites.length})</h3>
      
      {favorites.length === 0 ? (
        <div className="empty-message">
          <p>No tienes favoritos aún</p>
          <p style={{fontSize: '14px', color: '#666'}}>
            Los productos que marques como favoritos aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(product => (
            <div className="favorite-item" key={product._id}>
              <div className="favorite-image-container">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="favorite-image-placeholder"
                  style={{display: product.images && product.images.length > 0 ? 'none' : 'flex'}}
                >
                  {product.name}
                </div>
              </div>
              
              <div className="favorite-info">
                <h4>{product.name}</h4>
              </div>
              
              <button 
                className="favorite-button" 
                onClick={() => removeFavorite(product._id)}
                title="Quitar de favoritos"
              >
                <Heart className="favorite-icon active" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;