import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, ShoppingCart, X, Star, TrendingUp, Plus, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useProducts } from '../components/catalog/hook/useProducts.jsx';
import useCategories from '../hooks/useCategories.jsx';
import { useCart } from '../context/CartContext.jsx';
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
import '../components/styles/PixelDecorations.css';

export default function Catalogo() {
  const { user } = useAuth();
  const userId = user?.id;
  const { products, loading, error, refresh, lastUpdate } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites(userId);
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Función helper para formatear precios de forma segura
  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || !isFinite(numPrice)) {
      return '0.00';
    }
    return numPrice.toFixed(2);
  };
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Obtener categoría seleccionada desde los parámetros de URL
  const selectedCategory = searchParams.get('category') || '';


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
      // Filtro por categoría
      const matchesCategory = selectedCategory === '' || 
        product.category === selectedCategory;
      
      return matchesCategory;
    });
  }, [products, selectedCategory]);

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
    // Desactivar scroll del body de forma suave
    document.body.style.overflow = 'hidden';
  };

  const closeDetail = () => {
    setSelectedProduct(null);
    // Reactivar scroll del body
    document.body.style.overflow = '';
  };

  // Limpiar estilos del body cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Asegurar que el scroll del body se restaure al salir del componente
      document.body.style.overflow = '';
    };
  }, []);

  const handleAddToCart = async (productId, productName = 'Producto') => {
    if (!user) {
      showWarning("Debes iniciar sesión para agregar productos al carrito");
      return;
    }
    try {
      await addToCart({ productId, quantity: 1, productName });
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
          <Star className="animate-spin" size={48} />
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
    <div className="catalog-page" style={{ position: 'relative' }}>
      {/* Decoraciones pixeladas */}
      <div className="pixel-decoration" style={{ top: '5%', left: '3%' }}>
        <div className="pixel-float" style={{ top: '0px', left: '0px' }}></div>
        <div className="pixel-float" style={{ top: '25px', left: '35px' }}></div>
        <div className="hama-bead" style={{ top: '50px', left: '15px' }}></div>
      </div>
      
      <div className="pixel-decoration" style={{ top: '15%', right: '5%' }}>
        <div className="hama-bead" style={{ top: '0px', left: '0px' }}></div>
        <div className="pixel-float" style={{ top: '30px', left: '20px' }}></div>
      </div>
      
      <div className="pixel-decoration" style={{ bottom: '20%', left: '8%' }}>
        <div className="pixel-float" style={{ top: '0px', left: '0px' }}></div>
        <div className="hama-bead" style={{ top: '40px', left: '25px' }}></div>
        <div className="pixel-float" style={{ top: '70px', left: '10px' }}></div>
      </div>

      <div className="pixel-decoration" style={{ top: '60%', right: '12%' }}>
        <div className="hama-bead" style={{ top: '0px', left: '0px' }}></div>
        <div className="pixel-float" style={{ top: '35px', left: '15px' }}></div>
      </div>

      <div className="pixel-grid"></div>

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
                <div key={product._id} className={`popular-product-card ${product.isFromCustomOrder ? 'custom-order-product' : ''}`} onClick={() => openDetail(product)}>
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
                    {/* Badge para productos de encargos personalizados */}
                    {product.isFromCustomOrder && (
                      <div className="custom-order-badge">
                        <span>✨ Personalizado</span>
                      </div>
                    )}
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


        {/* Información de resultados */}
        <div className="results-info">
          <p>
            {selectedCategory ? (
              <>Mostrando {filteredProducts.length} de {products.length} productos en la categoría "{selectedCategory}"</>
            ) : (
              <>Mostrando {filteredProducts.length} de {products.length} productos</>
            )}
          </p>
        </div>

        {/* Grid de Productos */}
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className={`product-card ${product.isFromCustomOrder ? 'custom-order-product' : ''}`} onClick={() => openDetail(product)}>
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
                {/* Badge para productos de encargos personalizados */}
                {product.isFromCustomOrder && (
                  <div className="custom-order-badge">
                    <span>✨ Personalizado</span>
                  </div>
                )}
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
                      handleAddToCart(product._id, product.name);
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
              
              {/* Contenido principal */}
              <div className="detail-main-content">
                {/* Imagen del producto - Lado izquierdo */}
                <div className="detail-image">
                  <img 
                    src={selectedProduct.images?.[0] || '/src/assets/llavero.png'} 
                    alt={selectedProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }}
                  />
                </div>
                
                {/* Contenido del producto - Lado derecho */}
                <div className="detail-content">
                  {/* Título, categoría y precio arriba de la valoración */}
                  <div className="detail-product-info">
                    <h2 className="detail-title">{selectedProduct.name}</h2>
                    <p className="detail-subtitle">{selectedProduct.category}</p>
                    <p className="detail-price">${formatPrice(selectedProduct.price)}</p>
                  </div>
                  
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
            </div>
          </div>
        )}

      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}