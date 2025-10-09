import React, { useState } from 'react';
import { Star, Send, Edit3, Trash2 } from 'lucide-react';
import RatingStars from './RatingStars.jsx';
import './RatingForm.css';

const RatingForm = ({ onSubmit, onDelete, userRating, loading, productName, canRate, canRateMessage, showSuccess, showError, showWarning }) => {
  const [rating, setRating] = useState(userRating?.rating || 0);
  const [comment, setComment] = useState(userRating?.comment || '');
  const [isEditing, setIsEditing] = useState(!userRating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que el usuario pueda dejar reseñas
    if (!canRate && !userRating) {
      // Mostrar toast de error con el mensaje apropiado
      if (canRateMessage && canRateMessage.includes('iniciar sesión')) {
        showWarning('Debes iniciar sesión para dejar reseñas');
      } else if (canRateMessage && canRateMessage.includes('comprar')) {
        showError('Debes comprar este producto antes de poder dejar una reseña');
      } else {
        showError(canRateMessage || 'No puedes dejar reseñas para este producto');
      }
      return;
    }
    
    if (rating === 0) {
      showWarning('Por favor selecciona una puntuación');
      return;
    }
    if (!comment.trim()) {
      showWarning('Por favor escribe un comentario');
      return;
    }

    try {
      await onSubmit(rating, comment.trim());
      setIsEditing(false);
      showSuccess('¡Reseña enviada exitosamente!');
    } catch (error) {
      console.error('Error enviando reseña:', error);
      showError(error.message);
    }
  };

  const handleDelete = async () => {
    showWarning('¿Estás seguro de que quieres eliminar tu reseña?', 4000, {
      showConfirmButton: true,
      onConfirm: async () => {
        try {
          await onDelete();
          setIsEditing(true);
          setRating(0);
          setComment('');
          showSuccess('Reseña eliminada exitosamente');
        } catch (error) {
          console.error('Error eliminando reseña:', error);
          showError(error.message);
        }
      }
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (userRating) {
      setRating(userRating.rating);
      setComment(userRating.comment);
      setIsEditing(false);
    } else {
      setRating(0);
      setComment('');
    }
  };



  // Renderizar el componente
  if (!isEditing && userRating) {
    return (
      <div className="rating-form-container">
        <div className="user-rating-display">
          <h4>Tu reseña:</h4>
          <div className="rating-display">
            <RatingStars rating={userRating.rating} size={24} />
            <span className="rating-text">{userRating.rating}/5</span>
          </div>
          <p className="user-comment">{userRating.comment}</p>
          <div className="rating-actions">
            <button 
              className="btn-edit"
              onClick={handleEdit}
              disabled={loading}
            >
              <Edit3 size={16} />
              Editar
            </button>
            <button 
              className="btn-delete"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-form-container">
      <h4>Deja tu reseña para {productName}</h4>
      <form onSubmit={handleSubmit} className="rating-form">
        <div className="rating-input-section">
          <label>Puntuación:</label>
          <RatingStars 
            rating={rating} 
            size={window.innerWidth <= 480 ? 24 : 32} 
            interactive={true} 
            onRatingChange={setRating}
          />
          <span className="rating-value">{rating}/5</span>
        </div>
        
        <div className="comment-input-section">
          <label htmlFor="comment">Comentario:</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos qué te pareció este producto..."
            rows={window.innerWidth <= 480 ? 2 : 3}
            maxLength={500}
            required
          />
          <span className="char-count">{comment.length}/500</span>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading || rating === 0 || !comment.trim()}
          >
            <Send size={window.innerWidth <= 480 ? 14 : 16} />
            {loading ? 'Enviando...' : userRating ? 'Actualizar' : 'Enviar'}
          </button>
          
          {userRating && (
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
        

      </form>
    </div>
  );
};

export default RatingForm;
