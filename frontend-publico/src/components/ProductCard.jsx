import React from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <img 
        src={product.imagen || '/images/placeholder.jpg'} 
        alt={product.nombre}
        className="product-image"
      />
      <div className="product-info">
        <h3>{product.nombre}</h3>
        <p className="price">${product.precio.toFixed(2)}</p>
        <button 
          onClick={() => onAddToCart(product)}
          className="add-to-cart-btn"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    precio: PropTypes.number.isRequired,
    imagen: PropTypes.string,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

export default ProductCard;