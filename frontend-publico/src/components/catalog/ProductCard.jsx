import React from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css'; // si tienes estilos propios

export default function ProductCard({ product, onAddToCart, onClick, isFavorite, onToggleFavorite }) {
  return (
    <div className="product-card" onClick={onClick}>
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>${product.price.toFixed(2)}</p>

        <button
          className="add-to-cart-btn"
          onClick={e => {
            e.stopPropagation();
            onAddToCart();
          }}
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
    id:          PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name:        PropTypes.string.isRequired,
    price:       PropTypes.number.isRequired,
    image:       PropTypes.string,
  }).isRequired,
  onAddToCart:     PropTypes.func.isRequired,
  onClick:         PropTypes.func.isRequired,
  isFavorite:      PropTypes.bool,
  onToggleFavorite: PropTypes.func.isRequired,
};

ProductCard.defaultProps = {
  isFavorite: false,
};
