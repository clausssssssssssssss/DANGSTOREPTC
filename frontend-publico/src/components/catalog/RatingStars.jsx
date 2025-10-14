import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ 
  rating, 
  size = 20, 
  showNumber = false, 
  interactive = false, 
  onRatingChange,
  hideWhenEmpty = true // ✅ NUEVO: Opción para ocultar cuando no hay rating
}) => {
  const stars = [];
  const safeRating = Number(rating) || 0;
  const fullStars = Math.floor(safeRating);

  // ✅ Si no hay rating y hideWhenEmpty está activo, no mostrar nada
  if (safeRating === 0 && hideWhenEmpty && !interactive) {
    return (
      <div className="rating-stars">
        <div className="stars-container">
          <span style={{ 
            color: '#9ca3af', 
            fontSize: '0.875rem',
            fontStyle: 'italic' 
          }}>
            Sin calificación
          </span>
        </div>
      </div>
    );
  }

  // Generar todas las estrellas
  for (let i = 0; i < 5; i++) {
    const starNumber = i + 1;
    const isFilled = starNumber <= fullStars;
    
    stars.push(
      <Star
        key={`star-${i}`}
        size={size}
        fill={isFilled ? "#fbbf24" : "none"}
        stroke={isFilled ? "#fbbf24" : "#d1d5db"}
        strokeWidth={isFilled ? 0 : 1.5}
        className={`star ${isFilled ? 'star-filled' : 'star-empty'} ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
        onClick={() => interactive && onRatingChange && onRatingChange(starNumber)}
        style={{
          // ✅ Hacer las estrellas vacías más transparentes
          opacity: isFilled ? 1 : (interactive ? 0.5 : 0.3)
        }}
      />
    );
  }

  return (
    <div className="rating-stars">
      <div className="stars-container">
        {stars}
      </div>
      {showNumber && safeRating > 0 && (
        <span className="rating-number">
          {safeRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;