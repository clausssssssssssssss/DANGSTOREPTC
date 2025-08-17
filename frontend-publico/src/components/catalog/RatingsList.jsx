import React from 'react';
import { User, Calendar } from 'lucide-react';
import RatingStars from './RatingStars.jsx';

const RatingsList = ({ ratings, loading }) => {
  if (loading) {
    return (
      <div className="ratings-list-container">
        <div className="loading-ratings">
          <div className="loading-spinner"></div>
          <p>Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="ratings-list-container">
        <div className="no-ratings">
          <p>No hay reseñas para este producto aún.</p>
          <p>¡Sé el primero en dejar una reseña!</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="ratings-list-container">
      <h4>Reseñas de clientes ({ratings.length})</h4>
      
      <div className="ratings-list">
        {ratings.map((rating) => (
          <div key={rating._id} className="rating-item">
            <div className="rating-header">
              <div className="rating-user">
                <User size={16} className="user-icon" />
                <span className="user-name">
                  {rating.customerName || 'Cliente'}
                </span>
              </div>
              <div className="rating-date">
                <Calendar size={14} />
                <span>{formatDate(rating.createdAt)}</span>
              </div>
            </div>
            
            <div className="rating-stars-display">
              <RatingStars rating={rating.rating} size={18} />
              <span className="rating-value">{rating.rating}/5</span>
            </div>
            
            <div className="rating-comment">
              <p>{rating.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingsList;
