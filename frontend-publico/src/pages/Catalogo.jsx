import React, { useState, useMemo, useEffect } from 'react';
import { Search, RefreshCw, Heart, ShoppingCart, X, Star, TrendingUp, Plus, Check, Filter } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useProducts } from '../components/catalog/hook/useProducts.jsx';
import useCategories from '../hooks/useCategories.jsx';
import { useCart } from '../components/cart/hook/useCart.jsx';
import { useFavorites } from '../components/catalog/hook/useFavorites.jsx';
import { useRatings } from '../components/catalog/hook/useRatings.jsx';
import { useAllProductsRatings } from '../components/catalog/hook/useAllProductsRatings.jsx';
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
  const { products, loading, error, refresh, lastUpdate } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { addToCart } = useCart(userId);
  const { favorites, toggleFavorite } = useFavorites(userId);
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();
  
  // Función helper para formatear precios de forma segura
  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || !isFinite(numPrice)) {
      return '0.00';
    }
    return numPrice.toFixed(2);
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Calcular el rango de precios dinámicamente basado en los productos
  const priceRangeDynamic = useMemo(() => {
    if (!products || products.length === 0) return [0, 10];
    
    // Filtrar precios válidos y convertir a números
    const validPrices = products
      .map(p => Number(p.price))
      .filter(price => !isNaN(price) && isFinite(price) && price > 0);
    
    if (validPrices.length === 0) return [0, 10];
    
    const minPrice = Math.floor(Math.min(...validPrices));
    const maxPrice = Math.ceil(Math.max(...validPrices));
    
    // Asegurar que los valores sean números válidos
    return [
      isNaN(minPrice) ? 0 : minPrice,
      isNaN(maxPrice) ? 10 : maxPrice
    ];
  }, [products]);

  // Inicializar el rango de precios cuando se cargan los productos
  useEffect(() => {
    if (products && products.length > 0) {
      // Solo inicializar si el priceRange actual es el valor por defecto [0, 10]
      if (priceRange[0] === 0 && priceRange[1] === 10) {
        setPriceRange(priceRangeDynamic);
      }
    }
  }, [priceRangeDynamic, products]);

  // Validar y corregir priceRange si tiene valores inválidos
  useEffect(() => {
    if (isNaN(priceRange[0]) || isNaN(priceRange[1]) || !isFinite(priceRange[0]) || !isFinite(priceRange[1])) {
      setPriceRange(priceRangeDynamic);
    }
  }, [priceRange, priceRangeDynamic]);

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

  // Hook para ratings de todos los productos
  const { 
    getProductRatings, 
    updateProductRatings, 
    loading: allRatingsLoading 
  } = useAllProductsRatings(products);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return products.filter(product => {
      // Filtro por búsqueda de texto
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por categoría
      const matchesCategory = selectedCategory === '' || 
        product.category === selectedCategory;
      
      // Filtro por rango de precios
      const productPrice = Number(product.price);
      if (isNaN(productPrice) || !isFinite(productPrice)) {
        return matchesSearch && matchesCategory; // Si el precio no es válido, aplicar filtros de búsqueda y categoría
      }
      
      // Usar el rango dinámico si el actual no es válido
      const currentPriceRange = (isNaN(priceRange[0]) || isNaN(priceRange[1])) ? priceRangeDynamic : priceRange;
      const matchesPrice = productPrice >= currentPriceRange[0] && productPrice <= currentPriceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, priceRange, priceRangeDynamic]);

  // Productos populares (modificado para usar los productos con mejor rating)
  const popularProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    // Ordenar productos por rating (si está disponible) o por popularidad
    return [...products]
      .sort((a, b) => {
        const ratingA = getProductRatings(a._id).averageRating || 0;
        const ratingB = getProductRatings(b._id).averageRating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 3);
  }, [products, getProductRatings]);

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
      showSuccess('Producto añadido al carrito');
    } catch (err) {
      console.error('Error adding to cart:', err);
      showError(err.message || 'Error al añadir producto');
    }
  };

  const handleFavoriteClick = async (e, productId) => {
    e.stopPropagation();
    
    if (!user) {
      showWarning('Debes iniciar sesión para marcar productos como favoritos');
      return;
    }

    const result = await toggleFavorite(productId);
    if (result.success) {
      if (result.wasFavorite) {
        showSuccess('Producto eliminado de favoritos');
      } else {
        showSuccess('Producto agregado a favoritos');
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
          {lastUpdate && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#666', 
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
            </div>
          )}
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
                      src={product.images?.[0] || '/src/assets/llavero.png'} 
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
                      <p className="popular-product-price">${formatPrice(product.price)}</p>
                      <button
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        aria-label="Añadir al carrito"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtro Horizontal Elegante */}
        <div className="elegant-filter-section">
          <div className="filter-container">
            <div className="horizontal-filter-bar">
              {/* Campo de búsqueda */}
              <div className="search-field">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Botón de búsqueda */}
              <button className="search-button">
                Buscar
              </button>

              {/* Dropdown de filtros */}
              <div className="filter-dropdown-container">
                <button 
                  className="filter-dropdown-trigger"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <span>Filtrar por categoría</span>
                  <div className={`dropdown-arrow ${isSearchOpen ? 'open' : ''}`}>^</div>
                </button>

                {/* Panel de filtros con checkboxes */}
                {isSearchOpen && (
                  <div className="filter-dropdown-panel">
                    <div className="filter-options">
                      <label className="filter-option">
                    <input
                          type="checkbox"
                          checked={selectedCategory === ''}
                          onChange={() => setSelectedCategory('')}
                        />
                        <span className="checkmark"></span>
                        <span>Todas las categorías</span>
                      </label>
                      
                      {categoriesLoading ? (
                        <div className="loading-option">Cargando categorías...</div>
                      ) : categoriesError ? (
                        <div className="error-option">Error al cargar categorías</div>
                      ) : (
                        categories.map((category) => (
                          <label key={category._id} className="filter-option">
                    <input
                              type="checkbox"
                              checked={selectedCategory === category.name}
                              onChange={() => setSelectedCategory(category.name)}
                            />
                            <span className="checkmark"></span>
                            <span>{category.name}</span>
                          </label>
                        ))
                      )}
                  </div>
                </div>
                )}
              </div>

              {/* Botón de limpiar */}
              <button 
                className="clear-button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setPriceRange(priceRangeDynamic);
                  showInfo('Filtros limpiados');
                }}
              >
                <RefreshCw size={16} />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="results-info">
          <p>
            Mostrando {filteredProducts.length} de {products.length} productos
          </p>
        </div>

        {/* Grid de Productos */}
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card" onClick={() => openDetail(product)}>
              <div className="product-image">
                <img 
                  src={product.images?.[0] || '/src/assets/llavero.png'} 
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
                
                {/* Descripción del producto */}
                {product.description && (
                  <p className="product-description">
                    {product.description.length > 80 
                      ? `${product.description.substring(0, 80)}...` 
                      : product.description
                    }
                  </p>
                )}
                
                {/* Rating en la tarjeta */}
                <div className="product-rating">
                  <div className="rating-stars-small">
                    <RatingStars rating={getProductRatings(product._id).averageRating} size={16} />
                  </div>
                  <span className="rating-count">
                    {getProductRatings(product._id).totalRatings > 0 ? `(${getProductRatings(product._id).totalRatings})` : '(Sin reseñas)'}
                  </span>
                </div>
                
                <div className="product-footer">
                  <p className="product-price">${formatPrice(product.price)}</p>
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product._id);
                    }}
                    aria-label="Añadir al carrito"
                  >
                    <ShoppingCart size={18} />
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
                  src={selectedProduct.images?.[0] || '/src/assets/llavero.png'} 
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }}
                />
              </div>
              <h2 className="detail-title">{selectedProduct.name}</h2>
              <p className="detail-subtitle">{selectedProduct.category}</p>
              <p className="detail-price">${formatPrice(selectedProduct.price)}</p>
              
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
                  <ShoppingCart size={20} />
                  <span>Añadir al Carrito</span>
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={async (e) => {
                    e.stopPropagation();
                    handleFavoriteClick(e, selectedProduct._id);
                  }}
                >
                  <Heart size={20} />
                  <span>Favoritos</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}