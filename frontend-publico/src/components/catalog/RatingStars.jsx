import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, size = 20, showNumber = false, interactive = false, onRatingChange }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Generar estrellas llenas
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        size={size}
        fill="currentColor"
        className={`star ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
        onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
      />
    );
  }

  // Generar media estrella si es necesario
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star
          size={size}
          fill="none"
          className={`star ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(fullStars + 1)}
        />
        <div className="absolute inset-0 overflow-hidden">
          <Star
            size={size}
            fill="currentColor"
            className="star"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      </div>
    );
  }

  // Generar estrellas vacías
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star
        key={`empty-${i}`}
        size={size}
        fill="none"
        className={`star ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
        onClick={() => interactive && onRatingChange && onRatingChange(fullStars + hasHalfStar + i + 1)}
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
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
