import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ProductCard.css';
import storeConfigService from '../../services/storeConfigService';


export default function ProductCard({ product, onAddToCart, onClick, isFavorite, onToggleFavorite }) {
  const [stockInfo, setStockInfo] = useState({ available: 0, hasStock: true, loading: true });
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Elegir la primera imagen o un placeholder
  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : '/src/assets/llavero.png';

  // Verificar stock del producto
  useEffect(() => {
    const checkStock = async () => {
      try {
        setStockInfo(prev => ({ ...prev, loading: true }));
        const response = await storeConfigService.checkProductStock(product.id || product._id, 1);
        
        if (response.success) {
          setStockInfo({
            available: response.available || 0,
            hasStock: response.hasStock || false,
            loading: false
          });
        } else {
          setStockInfo({
            available: product.stock || 0,
            hasStock: (product.stock || 0) > 0,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error checking stock:', error);
        setStockInfo({
          available: product.stock || 0,
          hasStock: (product.stock || 0) > 0,
          loading: false
        });
      }
    };

    checkStock();
  }, [product.id, product._id, product.stock]);

  // Manejar agregar al carrito con verificación de límites
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);
      await onAddToCart();
    } catch (error) {
      // El error ya se maneja en el CartContext
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Determinar el estado del stock
  const getStockStatus = () => {
    if (stockInfo.loading) return 'loading';
    if (!stockInfo.hasStock || stockInfo.available === 0) return 'out';
    if (stockInfo.available <= 3) return 'low';
    return 'available';
  };

  const stockStatus = getStockStatus();

  return (
    <div className="product-card" onClick={onClick}>
      <img src={imageUrl} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>${product.price.toFixed(2)}</p>

        {/* Información de stock */}
        <div className="stock-info">
          {stockStatus === 'loading' && (
            <span className="stock-loading">Verificando stock...</span>
          )}
          {stockStatus === 'out' && (
            <span className="stock-out">Sin stock</span>
          )}
          {stockStatus === 'low' && (
            <span className="stock-low">Solo {stockInfo.available} disponibles</span>
          )}
          {stockStatus === 'available' && (
            <span className="stock-available">{stockInfo.available} disponibles</span>
          )}
        </div>

        <button
          className={`add-to-cart-btn ${stockStatus === 'out' ? 'disabled' : ''} ${isAddingToCart ? 'loading' : ''}`}
          onClick={handleAddToCart}
          disabled={stockStatus === 'out' || isAddingToCart}
          aria-label={stockStatus === 'out' ? 'Producto sin stock' : 'Agregar al carrito'}
          style={{
            borderRadius: window.innerWidth <= 480 ? '6px' : '8px',
            padding: window.innerWidth <= 480 ? '10px 16px' : '12px 20px',
            height: window.innerWidth <= 480 ? '40px' : '44px',
            width: '100%',
            maxWidth: '100%',
            fontSize: window.innerWidth <= 480 ? '13px' : '14px',
            fontWeight: '600',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: stockStatus === 'out' ? 0.5 : 1,
            cursor: stockStatus === 'out' ? 'not-allowed' : 'pointer'
          }}
        >
          {isAddingToCart ? 'Agregando...' : stockStatus === 'out' ? 'Sin stock' : 'Agregar al carrito'}
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
