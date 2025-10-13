import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, size = 20, showNumber = false, interactive = false, onRatingChange }) => {
  const stars = [];
  const safeRating = Number(rating) || 0;
  const fullStars = Math.floor(safeRating);

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
      />
    );
  }

  return (
    <div className="rating-stars">
      <div className="stars-container">
        {stars}
      </div>
      {showNumber && (
        <span className="rating-number">
          {safeRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
