import React from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css';
import { toast } from 'react-toastify';
import React from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css';
import { toast } from 'react-toastify';

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
          aria-label="Agregar al carrito"
        >
          Agregar al carrito
        </button>

        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite();
            toast.success(`${product.name} se ha agregado a tus favoritos ❤️`, {
              position: 'top-right',
              autoClose: 2000,
              hideProgressBar: false,
              pauseOnHover: true,
              theme: 'colored',
            });
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
