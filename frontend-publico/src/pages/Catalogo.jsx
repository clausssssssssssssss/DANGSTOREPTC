import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw, Heart, ShoppingCart, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useProducts } from '../components/catalog/hook/useProducts.jsx';
import { useCart } from '../components/cart/hook/useCart.jsx';
import { useFavorites } from '../components/catalog/hook/useFavorites.jsx';
import { toast } from 'react-toastify';

export default function Catalogo() {
  const { user } = useAuth();
  const { products, loading, error, refresh } = useProducts();
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites(user?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 20]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

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
      toast.warning("Debes iniciar sesión para agregar al carrito");
      return;
    }
    try {
      await addToCart({ productId, quantity: 1 });
      toast.success('¡Producto añadido al carrito!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error al añadir producto');
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

        {/* Barra de Búsqueda y Filtros */}
        <div className="search-filter-section">
          {/* Botón de búsqueda */}
          <div className="search-container">
            <button 
              className="search-toggle-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={24} />
              <span>Buscar productos</span>
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
                  }}
                >
                  <RefreshCw size={16} />
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="results-info">
          <p>Mostrando {filteredProducts.length} productos</p>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product._id);
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
                  onClick={() => toggleFavorite(selectedProduct._id)}
                >
                  ❤️ Favoritos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* --- Layout y Fondo --- */
        .catalog-page {
          min-height: 100vh;
          padding: 2rem 1rem;
          padding-top: 6rem;
          background: linear-gradient(135deg, #4DD0E1 0%, #81C784 30%, #BA68C8 70%, #9C27B0 100%);
          color: #333;
          position: relative;
          overflow: hidden;
          animation: backgroundShift 15s ease-in-out infinite;
        }
        @keyframes backgroundShift {
          0%, 100% { background: linear-gradient(135deg, #4DD0E1 0%, #81C784 30%, #BA68C8 70%, #9C27B0 100%);}
          25% { background: linear-gradient(135deg, #26C6DA 0%, #66BB6A 30%, #AB47BC 70%, #8E24AA 100%);}
          50% { background: linear-gradient(135deg, #00BCD4 0%, #4CAF50 30%, #9C27B0 70%, #7B1FA2 100%);}
          75% { background: linear-gradient(135deg, #4DD0E1 0%, #81C784 30%, #BA68C8 70%, #9C27B0 100%);}
        }
        .catalog-page::before {
          content: '';
          position: absolute;
          top: -20%;
          left: -20%;
          width: 140%;
          height: 140%;
          background: radial-gradient(circle, rgba(77, 208, 225, 0.15) 0%, transparent 50%);
          animation: floatRotate 20s ease-in-out infinite;
          z-index: 1;
          pointer-events: none;
        }
        .catalog-page::after {
          content: '✨ ◆ ▲ ● ★ ✦ ◇ ♦ ☆ ✧';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          font-size: 2rem;
          color: rgba(255, 255, 255, 0.1);
          animation: particlesFloat 30s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes floatRotate {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1);}
          33% { transform: translateY(-15px) rotate(120deg) scale(1.05);}
          66% { transform: translateY(10px) rotate(240deg) scale(0.95);}
        }
        @keyframes particlesFloat {
          0% { transform: translateY(100vh) rotate(0deg);}
          100% { transform: translateY(-100vh) rotate(360deg);}
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 2;
        }

        /* --- Loading y Error --- */
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          color: white;
          gap: 20px;
        }
        .retry-button {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          border-radius: 25px;
          padding: 15px 30px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .retry-button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        /* --- Banner Principal --- */
        .popular-banner {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          padding: 2rem;
          border-radius: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.6);
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 45px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.8);
          animation: cardEntrance 0.8s ease-out;
        }
        @keyframes cardEntrance {
          0% { opacity: 0; transform: translateY(50px) scale(0.95);}
          100% { opacity: 1; transform: translateY(0) scale(1);}
        }
        .popular-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #4DD0E1, #BA68C8);
        }
        .popular-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #9C27B0, #4DD0E1);
          background-size: 300% 300%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
          animation: titleShimmer 3s ease-in-out infinite;
        }
        @keyframes titleShimmer {
          0%, 100% { background-position: 0% 50%;}
          50% { background-position: 100% 50%;}
        }
        .popular-subtitle {
          color: #6b7280;
          font-size: 1.2rem;
          font-weight: 500;
        }

        /* --- Buscador y Filtros --- */
        .search-filter-section { margin-bottom: 2rem; }
        .search-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .search-toggle-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 2rem;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          color: #9C27B0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .search-toggle-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 20px 40px rgba(186, 104, 200, 0.3);
          background: linear-gradient(135deg, rgba(77, 208, 225, 0.1), rgba(186, 104, 200, 0.1));
        }
        .search-panel {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 25px 45px -15px rgba(0, 0, 0, 0.2);
          animation: slideDown 0.4s ease-out;
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-20px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .search-inputs {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr auto;
          gap: 1rem;
          align-items: end;
        }
        .search-input-group { position: relative; }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9C27B0;
        }
        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid rgba(156, 39, 176, 0.2);
          border-radius: 2rem;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
        }
        .search-input:focus {
          outline: none;
          border-color: #4DD0E1;
          box-shadow: 0 0 0 3px rgba(77, 208, 225, 0.2);
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .category-select {
          padding: 1rem;
          border: 2px solid rgba(156, 39, 176, 0.2);
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .category-select:focus {
          outline: none;
          border-color: #4DD0E1;
          box-shadow: 0 0 0 3px rgba(77, 208, 225, 0.2);
        }
        .price-filter {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .price-filter label {
          font-weight: 600;
          color: #9C27B0;
          font-size: 0.9rem;
        }
        .price-range-container {
          display: flex;
          gap: 8px;
        }
        .price-slider {
          width: 100%;
          -webkit-appearance: none;
          height: 6px;
          background: linear-gradient(135deg, #4DD0E1, #BA68C8);
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }
        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: #9C27B0;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(156, 39, 176, 0.3);
        }
        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 1rem 1.5rem;
          background: rgba(156, 39, 176, 0.1);
          color: #9C27B0;
          border: 2px solid rgba(156, 39, 176, 0.2);
          border-radius: 2rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .clear-filters-btn:hover {
          background: rgba(156, 39, 176, 0.15);
          transform: translateY(-2px);
        }

        /* --- Resultados --- */
        .results-info {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 1rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        /* --- Grid de Productos --- */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          transition: all 0.3s ease;
        }
        .product-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 25px 45px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.6);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          animation: fadeInUp 0.6s ease-out both;
        }
        .product-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 35px 60px rgba(0, 0, 0, 0.25), 0 10px 40px rgba(186, 104, 200, 0.3);
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .product-image {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #4DD0E1, #BA68C8);
        }
        .favorite-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(61, 143, 163, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          color: #ccc;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .favorite-btn.active {
          color: #e63946;
          background: rgba(230, 57, 70, 0.25);
          transform: scale(1.1);
          box-shadow: 0 10px 30px rgba(230, 57, 70, 0.5);
        }
        .favorite-btn:hover {
          transform: scale(1.2);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, rgba(77, 208, 225, 0.2), rgba(186, 104, 200, 0.2));
        }
        .product-info { padding: 1.5rem; }
        .product-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1a1a1a;
          background: linear-gradient(135deg, #9C27B0, #4DD0E1);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .product-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .product-price {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #4DD0E1, #BA68C8);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .add-to-cart-btn {
          background: #4DD0E1;
          color: white;
          border: none;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(77, 208, 225, 0.3);
        }
        .add-to-cart-btn:hover {
          background: #26C6DA;
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(77, 208, 225, 0.5);
        }
        .no-results {
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          padding: 40px;
          border-radius: 20px;
          color: #666;
          margin-top: 2rem;
        }

        /* --- Modal Detalle Producto --- */
        .product-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }
        .product-detail-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        .product-detail-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          padding: 2.5rem;
          max-width: 500px;
          width: 90%;
          position: relative;
          transform: scale(0.8);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        .product-detail-overlay.active .product-detail-card {
          transform: scale(1);
        }
        .close-detail {
          position: absolute;
          top: 20px;
          right: 25px;
          background: rgba(156, 39, 176, 0.1);
          border: none;
          cursor: pointer;
          color: #9C27B0;
          transition: all 0.3s ease;
          padding: 8px;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-detail:hover {
          background: linear-gradient(135deg, rgba(77, 208, 225, 0.2), rgba(186, 104, 200, 0.2));
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 8px 25px rgba(186, 104, 200, 0.3);
        }
        .detail-image {
          width: 100%;
          height: 250px;
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #4DD0E1, #BA68C8);
        }
        .detail-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #9C27B0, #4DD0E1);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .detail-subtitle {
          color: #6b7280;
          margin-bottom: 18px;
          font-size: 16px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .detail-price {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #4DD0E1, #BA68C8);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }
        .rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 25px;
        }
        .stars {
          color: #ffd700;
          font-size: 18px;
        }
        .rating-text {
          color: #6b7280;
          font-weight: 500;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
        }
        .btn {
          padding: 1.25rem 2.5rem;
          border: none;
          border-radius: 2rem;
          cursor: pointer;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          flex: 1;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #4DD0E1 0%, #81C784 50%, #BA68C8 100%);
          color: white;
          box-shadow: 0 10px 25px rgba(186, 104, 200, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #26C6DA 0%, #66BB6A 50%, #AB47BC 100%);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 20px 40px rgba(186, 104, 200, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3);
        }
        .btn-secondary {
          background: rgba(156, 39, 176, 0.1);
          color: #9C27B0;
          border: 2px solid rgba(156, 39, 176, 0.2);
        }
        .btn-secondary:hover {
          background: rgba(156, 39, 176, 0.15);
          transform: translateY(-2px);
        }

        /* --- Responsive --- */
        @media (max-width: 768px) {
          .search-inputs {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .popular-title {
            font-size: 2rem;
          }
          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
          }
          .action-buttons {
            flex-direction: column;
          }
          .catalog-page {
            padding-top: 4rem;
          }
        }
      `}</style>
    </div>
  );
}