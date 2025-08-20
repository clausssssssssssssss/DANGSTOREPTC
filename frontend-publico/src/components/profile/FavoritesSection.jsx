import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Star, Package } from 'lucide-react';

// URL del servidor de producción
const API_BASE = 'https://dangstoreptc.onrender.com/api';

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

      const response = await fetch(`${API_BASE}/profile/favorites`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token inválido o expirado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const products = await response.json();
      
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

      const response = await fetch(`${API_BASE}/profile/favorites/${productId}`, {
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
        <div className="card-header">
          <div className="card-title">
            <Heart size={20} className="section-icon" />
            <h3>Mis Favoritos</h3>
          </div>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Heart size={20} className="section-icon" />
            <h3>Mis Favoritos</h3>
          </div>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h4>Error al cargar favoritos</h4>
          <p>{error}</p>
          <button onClick={fetchFavorites} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title">
          <Heart size={20} className="section-icon" />
          <h3>Mis Favoritos</h3>
        </div>
        <div className="favorites-summary">
          <span className="favorites-count">
            <Star size={16} />
            {favorites.length} producto{favorites.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💖</div>
          <h4>No tienes favoritos aún</h4>
          <p>Los productos que marques como favoritos aparecerán aquí para que puedas acceder a ellos fácilmente.</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(product => (
            <div className="favorite-card" key={product._id}>
              {/* Imagen del producto */}
              <div className="favorite-image-container">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="favorite-image"
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
                  <Package size={32} />
                  <span>{product.name}</span>
                </div>
                
                {/* Botón de quitar favorito */}
                <button 
                  className="remove-favorite-btn" 
                  onClick={() => removeFavorite(product._id)}
                  title="Quitar de favoritos"
                >
                  <Heart size={16} className="heart-icon-filled" />
                </button>
              </div>

              {/* Información del producto */}
              <div className="favorite-info">
                <h4 className="favorite-name">{product.name}</h4>
                
                {product.description && (
                  <p className="favorite-description">
                    {product.description.length > 80 
                      ? `${product.description.substring(0, 80)}...` 
                      : product.description
                    }
                  </p>
                )}
                
                {product.price && (
                  <div className="favorite-price">
                    <span className="price-label">Precio:</span>
                    <span className="price-value">${product.price.toFixed(2)}</span>
                  </div>
                )}
                
                {product.category && (
                  <div className="favorite-category">
                    <span className="category-label">Categoría:</span>
                    <span className="category-value">{product.category}</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="favorite-actions">
                <button className="view-product-btn">
                  <Package size={16} />
                  Ver Producto
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;