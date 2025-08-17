import React from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css';


export default function ProductCard({ product, onAddToCart, onClick, isFavorite, onToggleFavorite }) {
  // Elegir la primera imagen o un placeholder
  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : 'https://via.placeholder.com/300x200?text=Sin+imagen';

  // 🔎 Debug: mostrar qué se está renderizando
  console.log('Rendering product card:');
  console.log('name:', product.name);
  console.log('images:', product.images);
  console.log('imageUrl usado:', imageUrl);

  return (
    <div className="product-card" onClick={onClick}>
      <img src={imageUrl} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>${product.price.toFixed(2)}</p>

        <button
          className="add-to-cart-btn"
          onClick={e => {
            e.stopPropagation();
            onAddToCart();
          }}
          aria-label="Agregar al carrito"
        >
          Agregar al carrito
        </button>

        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          ♥
        </button>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name:  PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
  }).isRequired,
  onAddToCart:      PropTypes.func.isRequired,
  onClick:          PropTypes.func.isRequired,
  isFavorite:       PropTypes.bool,
  onToggleFavorite: PropTypes.func.isRequired,
};

ProductCard.defaultProps = {
  isFavorite: false,
};
