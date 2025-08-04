import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw, Heart, ShoppingCart, X, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useProducts } from '../components/catalog/hook/useProducts.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../components/catalog/hook/useFavorites.jsx';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import '../components/styles/Catalogo.css';

export default function Catalogo() {
  const { user } = useAuth();
  const userId = user?.id;
  const { products, loading, error, refresh } = useProducts();
  const { addToCart } = useCart(userId);
  const { favorites, toggleFavorite } = useFavorites(userId);
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 20]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Categorías disponibles
  const categories = [
    { id: 'llaveros', name: 'Llaveros', icon: '🔑' },
    { id: 'piñatas', name: 'Piñatas', icon: '🎉' },
    { id: 'cuadros', name: 'Cuadros', icon: '🖼️' }
  ];

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesPrice && matchesCategory;
    });
  }, [products, searchTerm, priceRange, selectedCategory]);

  // Productos populares (simulados - en producción vendrían del backend)
  const popularProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Simular productos populares basados en precio y disponibilidad
    return products
      .filter(product => product.price > 5 && product.price < 15) // Productos en rango medio
      .slice(0, 7); // 7 productos populares para el carrusel
  }, [products]);

  // Navegación del carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === Math.ceil(popularProducts.length / 2) - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? Math.ceil(popularProducts.length / 2) - 1 : prev - 1
    );
  };

  const openDetail = (product) => {
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const closeDetail = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'auto';
  };

  // Handler seguro para añadir al carrito
  const handleAddToCart = async (productId) => {
    if (!user) {
      showWarning("debes de iniciar sesion para agregar tus productos al carrito");
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
          <p className="popular-subtitle">Descubre nuestra increíble selección</p>
        </div>

        {/* Sección de Productos Populares - Carrusel */}
        {popularProducts.length > 0 && (
          <div className="popular-products-section">
            <div className="popular-section-header">
              <TrendingUp className="trending-icon" size={24} />
              <h2 className="popular-section-title">Productos Populares</h2>
              <div className="popular-badge">🔥 Más Vendidos</div>
            </div>
            
            <div className="carousel-container">
              <button 
                className="carousel-btn carousel-btn-prev"
                onClick={prevSlide}
                aria-label="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="carousel-track">
                <div 
                  className="carousel-slide"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`
                  }}
                >
                  {popularProducts.map(product => (
                    <div key={product._id} className="popular-product-card" onClick={() => openDetail(product)}>
                      <div className="popular-product-image">
                        <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/300x300/4DD0E1/ffffff?text=Sin+Imagen'} 
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div className="popular-badge-overlay">
                          <Star size={16} fill="gold" />
                          <span>Popular</span>
                        </div>
                        <button
                          className={`favorite-btn ${favorites.includes(product._id) ? 'active' : ''}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const result = await toggleFavorite(product._id);
                            if (result.success) {
                              if (result.wasFavorite) {
                                showSuccess('💔 Producto eliminado de favoritos');
                              } else {
                                showSuccess('❤️ Producto agregado a favoritos');
                              }
                            } else {
                              showWarning('Debe de iniciar sesion para agregar productos a favoritos');
                            }
                          }}
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
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="carousel-btn carousel-btn-next"
                onClick={nextSlide}
                aria-label="Siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            {/* Indicadores del carrusel */}
            <div className="carousel-indicators">
              {Array.from({ length: Math.ceil(popularProducts.length / 2) }).map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Barra de Búsqueda y Filtros */}
        <div className="search-filter-section">
          {/* Botón de búsqueda con animación dinámica */}
          <div className="search-container">
            <button 
              className={`search-toggle-btn ${isSearchOpen ? 'active' : ''}`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="search-icon-dynamic" size={24} />
              <span className="search-text">Buscar productos</span>
              <div className="search-pulse"></div>
            </button>
          </div>

          {/* Panel de búsqueda expandible */}
          {isSearchOpen && (
            <div className="search-panel">
              <div className="search-inputs">
                {/* Campo de búsqueda */}
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

                {/* Filtro por categoría */}
                <div className="filter-group">
                  <Filter size={18} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por precio */}
                <div className="price-filter">
                  <label>Precio: ${priceRange[0]} - ${priceRange[1]}</label>
                  <div className="price-range-container">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="price-slider"
                    />
                    <input
                      type="range"  
                      min="0"
                      max="20"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="price-slider"
                    />
                  </div>
                </div>

                {/* Botón limpiar filtros */}
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setPriceRange([0, 25]);
                    setSelectedCategory('');
                    showInfo('Filtros limpiados');
                  }}
                >
                  <RefreshCw size={16} />
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grid de Productos */}
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card" onClick={() => openDetail(product)}>
              <div className="product-image">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/300x300/4DD0E1/ffffff?text=Sin+Imagen'} 
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  className={`favorite-btn ${favorites.includes(product._id) ? 'active' : ''}`}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const result = await toggleFavorite(product._id);
                    if (result.success) {
                      if (result.wasFavorite) {
                        showSuccess('💔 Producto eliminado de favoritos');
                      } else {
                        showSuccess('❤️ Producto agregado a favoritos');
                      }
                    } else {
                      showWarning('Debe de iniciar sesion para agregar productos a favoritos');
                    }
                  }}
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
                <div className="product-footer">
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product._id);
                    }}
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
                  src={selectedProduct.images?.[0] || 'https://via.placeholder.com/400x400/4DD0E1/ffffff?text=Sin+Imagen'} 
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }}
                />
              </div>
              <h2 className="detail-title">{selectedProduct.name}</h2>
              <p className="detail-subtitle">{selectedProduct.category}</p>
              <p className="detail-price">${selectedProduct.price.toFixed(2)}</p>
              <div className="rating">
                <div className="stars">★★★★☆</div>
                <span className="rating-text">4.5 (127 reseñas)</span>
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
                  onClick={async () => {
                    const result = await toggleFavorite(selectedProduct._id);
                    if (result.success) {
                      if (result.wasFavorite) {
                        showSuccess('💔 Producto eliminado de favoritos');
                      } else {
                        showSuccess('❤️ Producto agregado a favoritos');
                      }
                    } else {
                      showWarning('Error al actualizar favoritos');
                    }
                    
                  }}
                >
                  ❤️ Favoritos
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