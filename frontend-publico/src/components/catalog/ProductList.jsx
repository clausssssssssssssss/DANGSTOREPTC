import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard.jsx';
import './ProductList.css';

const ProductList = ({
  products,
  loading,
  error,
  onRefresh,
  onAddToCart,
  onProductClick,
  favorites,
  toggleFavorite
}) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={onRefresh} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="empty-state">
        <p>No hay productos disponibles</p>
        <button onClick={onRefresh} className="refresh-button">
          Recargar productos
        </button>
      </div>
    );
  }

  return (
    <section className="product-list">
      <div className="list-header">
        <h2>Productos Disponibles</h2>
        <button
          onClick={onRefresh}
          className="refresh-button"
          aria-label="Actualizar lista de productos"
        >
          Actualizar
        </button>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => onAddToCart(product)}
            onClick={() => onProductClick(product)}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={() => toggleFavorite(product.id)}
          />
        ))}
      </div>
    </section>
  );
};

ProductList.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id:          PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name:        PropTypes.string.isRequired,
      price:       PropTypes.number.isRequired,
      image:       PropTypes.string,
      description: PropTypes.string,
    })
  ),
  onAddToCart:    PropTypes.func.isRequired,
  onProductClick: PropTypes.func.isRequired,
  onRefresh:      PropTypes.func.isRequired,
  loading:        PropTypes.bool,
  error:          PropTypes.string,
  favorites:      PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  toggleFavorite: PropTypes.func.isRequired,
};

ProductList.defaultProps = {
  products: [],
  loading:  false,
  error:    null,
  favorites: [],
};

export default ProductList;
