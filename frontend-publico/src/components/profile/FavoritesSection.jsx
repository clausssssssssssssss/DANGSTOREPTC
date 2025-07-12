import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const FavoritesSection = () => {
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/profile/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFavorites(data))
      .catch(err => console.error(err));
  }, []);

  const toggleFavorite = (id) => {
    fetch(`/api/profile/favorites/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setFavorites(favorites.filter(f => f._id !== id));
    });
  };

  return (
    <div className="content-card">
      <h3 className="history-title">Favoritos</h3>
      <div className="favorites-grid">
        {favorites.map(product => (
          <div className="favorite-item" key={product._id}>
            <div className="favorite-image-container">
              <div className="favorite-image">{product.name}</div>
            </div>
            <button className="favorite-button" onClick={() => toggleFavorite(product._id)}>
              <Heart className="favorite-icon active" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesSection;
