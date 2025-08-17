import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Heart, ShoppingCart, X, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useProducts } from '../components/catalog/hook/useProducts.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../components/catalog/hook/useFavorites.jsx';
import { useRatings } from '../components/catalog/hook/useRatings.jsx';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import RatingForm from '../components/catalog/RatingForm.jsx';
import RatingsList from '../components/catalog/RatingsList.jsx';
import RatingStars from '../components/catalog/RatingStars.jsx';
import '../components/styles/Catalogo.css';
import '../components/styles/Ratings.css';

export default function Catalogo() {
  const { user } = useAuth();
  const userId = user?.id;
  const { products, loading, error, refresh } = useProducts();
  const { addToCart } = useCart(userId);
  const { favorites, toggleFavorite } = useFavorites(userId);
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFavoriteMessage, setShowFavoriteMessage] = useState(false);
  
  // Hook para manejar reseñas del producto seleccionado
  const { 
    ratings, 
    averageRating, 
    totalRatings, 
    userRating, 
    canRate,
    canRateMessage,
    loading: ratingsLoading, 
    submitRating, 
    deleteRating 
  } = useRatings(selectedProduct?._id);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    });
  }, [products, searchTerm, priceRange]);

  // Productos populares
  const popularProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter(product => 
      product.name === 'Llavero Batman' || 
      product.name === 'Llavero Corazón' ||
      product.name === 'Llavero Zelda'
    ).slice(0, 3); 
  }, [products]);

  const openDetail = (product) => {
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const closeDetail = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'auto';
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      showWarning("Debes iniciar sesión para agregar productos al carrito");
      return;
    }
    try {
      await addToCart({ productId, quantity: 1 });
      showSuccess('¡Producto añadido al carrito!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      showError(err.message || 'Error al añadir producto');
    }
  };

  const handleFavoriteClick = async (e, productId) => {
    e.stopPropagation();
    
    if (!user) {
      setShowFavoriteMessage(true);
      return;
    }

    const result = await toggleFavorite(productId);
    if (result.success) {
      if (result.wasFavorite) {
        showSuccess('💔 Producto eliminado de favoritos');
      } else {
        showSuccess('❤️ Producto agregado a favoritos');
      }
    } else {
      showError('Error al actualizar favoritos');
    }
  };

  if (loading) {
    return (
      <div className="catalog-page">
        <div className="loading-container">
          <RefreshCw className="animate-spin" size={48} />
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-page">
        <div className="error-container">
          <p>Error al cargar catálogo: {error}</p>
          <button onClick={refresh} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Banner Principal */}
        <div className="popular-banner">
          <h1 className="popular-title">Catálogo de Productos</h1>
          <p className="popular-subtitle">Descubre nuestra increíble selección de los mejores productos para ti</p>
        </div>

        {/* Sección de Productos Populares */}
        {popularProducts.length > 0 && (
          <div className="popular-products-section">
            <div className="popular-section-header">
              <TrendingUp className="trending-icon" size={24} />
              <h2 className="popular-section-title">Productos Populares</h2>
            </div>
            
            <div className="popular-products-centered">
              {popularProducts.map(product => (
                <div key={product._id} className="popular-product-card" onClick={() => openDetail(product)}>
                  <div className="popular-product-image">
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/300x300/f5f5f5/333333?text=Sin+Imagen'} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="popular-badge-overlay">
                      <Star size={16} fill="gold" />
                      <span>Popular</span>
                    </div>
                    <button
                      className={`favorite-btn ${favorites.includes(product._id) ? 'active' : ''}`}
                      onClick={(e) => handleFavoriteClick(e, product._id)}
                    >
                      <Heart 
                        size={20} 
                        fill={favorites.includes(product._id) ? 'currentColor' : 'none'} 
                      />
                    </button>
                  </div>
                  <div className="popular-product-info">
                    <h3 className="popular-product-title">{product.name}</h3>
                    <p className="popular-product-subtitle">{product.category}</p>
                    <div className="popular-product-footer">
                      <p className="popular-product-price">${product.price.toFixed(2)}</p>
                      <button
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        aria-label="Añadir al carrito"
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barra de Búsqueda y Filtros Simplificada */}
        <div className="search-filter-section">
          <button 
            className={`search-toggle-btn ${isSearchOpen ? 'active' : ''}`}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="search-icon-dynamic" size={24} />
            <span className="search-text">Buscar productos</span>
          </button>

          {isSearchOpen && (
            <div className="search-panel">
              <div className="search-input-group">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="price-filter">
                <label>Precio: ${priceRange[0]} - ${priceRange[1]}</label>
                <div className="price-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="price-slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="price-slider"
                  />
                </div>
              </div>

              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setPriceRange([0, 10]);
                  showInfo('Filtros limpiados');
                }}
              >
                <RefreshCw size={16} />
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Grid de Productos */}
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card" onClick={() => openDetail(product)}>
              <div className="product-image">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/300x300/f5f5f5/333333?text=Sin+Imagen'} 
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  className={`favorite-btn ${favorites.includes(product._id) ? 'active' : ''}`}
                  onClick={(e) => handleFavoriteClick(e, product._id)}
                >
                  <Heart 
                    size={20} 
                    fill={favorites.includes(product._id) ? 'currentColor' : 'none'} 
                  />
                </button>
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-subtitle">{product.category}</p>
                
                {/* Rating en la tarjeta */}
                <div className="product-rating">
                  <div className="rating-stars-small">
                    <RatingStars rating={product.averageRating || 0} size={16} />
                  </div>
                  <span className="rating-count">
                    {product.totalRatings > 0 ? `(${product.totalRatings})` : '(Sin reseñas)'}
                  </span>
                </div>
                
                <div className="product-footer">
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product._id);
                    }}
                    aria-label="Añadir al carrito"
                  >
                    🛒
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-results">
            <p>No se encontraron productos con los filtros aplicados</p>
          </div>
        )}

        {/* Modal de Detalle */}
        {selectedProduct && (
          <div className="product-detail-overlay active" onClick={closeDetail}>
            <div className="product-detail-card" onClick={(e) => e.stopPropagation()}>
              <button className="close-detail" onClick={closeDetail}>
                <X size={24} />
              </button>
              <div className="detail-image">
                <img 
                  src={selectedProduct.images?.[0] || 'https://via.placeholder.com/400x400/f5f5f5/333333?text=Sin+Imagen'} 
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }}
                />
              </div>
              <h2 className="detail-title">{selectedProduct.name}</h2>
              <p className="detail-subtitle">{selectedProduct.category}</p>
              <p className="detail-price">${selectedProduct.price.toFixed(2)}</p>
              
              {/* Rating y Reseñas */}
              <div className="product-ratings-section">
                <div className="rating-summary">
                  <div className="rating-stars">
                    <RatingStars rating={averageRating} size={24} showNumber={true} />
                  </div>
                  <span className="rating-text">
                    {totalRatings > 0 ? `${totalRatings} reseña${totalRatings !== 1 ? 's' : ''}` : 'Sin reseñas'}
                  </span>
                </div>
                
                {/* Formulario de Reseña */}
                <RatingForm
                  onSubmit={submitRating}
                  onDelete={deleteRating}
                  userRating={userRating}
                  loading={ratingsLoading}
                  productName={selectedProduct.name}
                  canRate={canRate}
                  canRateMessage={canRateMessage}
                  showSuccess={showSuccess}
                  showError={showError}
                  showWarning={showWarning}
                />
                
                {/* Lista de Reseñas */}
                <RatingsList
                  ratings={ratings}
                  loading={ratingsLoading}
                />
              </div>
              
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={async () => {
                    await handleAddToCart(selectedProduct._id);
                    closeDetail();
                  }}
                >
                  🛒 Añadir al Carrito
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={async (e) => {
                    e.stopPropagation();
                    handleFavoriteClick(e, selectedProduct._id);
                  }}
                >
                  ❤️ Favoritos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de favoritos */}
        {showFavoriteMessage && (
          <div className="favorite-message" onClick={() => setShowFavoriteMessage(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <p>Debes iniciar sesión para marcar productos como favoritos</p>
              <button onClick={() => setShowFavoriteMessage(false)}>Entendido</button>
            </div>
          </div>
        )}
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}