import React, { useState, useEffect } from 'react';
import './Catalogo.css';

const Catalog = () => {
  const [filterSidebarActive, setFilterSidebarActive] = useState(false);
  const [activeTab, setActiveTab] = useState('Productos');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Lista de productos
  const products = [
    {
      id: 1,
      title: 'Llavero Link',
      subtitle: '(The legend of Zelda)',
      price: '$3.99',
      icon: '🎮',
      isFavorite: false,
      category: 'videojuegos',
      brand: 'zelda'
    },
    {
      id: 2,
      title: 'Llavero Link',
      subtitle: '(The legend of Zelda)',
      price: '$3.99',
      icon: '🎮',
      isFavorite: true,
      category: 'videojuegos',
      brand: 'zelda'
    },
    {
      id: 3,
      title: 'Llavero Mario',
      subtitle: '(Super Mario Bros)',
      price: '$4.99',
      icon: '🍄',
      isFavorite: false,
      category: 'videojuegos',
      brand: 'mario'
    },
    {
      id: 4,
      title: 'Llavero Naruto',
      subtitle: '(Naruto Shippuden)',
      price: '$4.50',
      icon: '🥷',
      isFavorite: false,
      category: 'anime',
      brand: 'naruto'
    },
    {
      id: 5,
      title: 'Llavero Pikachu',
      subtitle: '(Pokémon)',
      price: '$4.25',
      icon: '⚡',
      isFavorite: true,
      category: 'anime',
      brand: 'pokemon'
    },
    {
      id: 6,
      title: 'Cuadro Sailor Moon',
      subtitle: '(Sailor Moon)',
      price: '$15.99',
      icon: '🌙',
      isFavorite: false,
      category: 'anime',
      brand: 'sailormoon'
    },
    {
      id: 7,
      title: 'Llavero Gatito',
      subtitle: '(Kawaii Collection)',
      price: '$3.75',
      icon: '🐱',
      isFavorite: false,
      category: 'kawaii',
      brand: 'gatitos'
    },
    {
      id: 8,
      title: 'Cuadro One Piece',
      subtitle: '(One Piece)',
      price: '$18.99',
      icon: '🏴‍☠️',
      isFavorite: true,
      category: 'anime',
      brand: 'onepiece'
    }
  ];

  const [productList, setProductList] = useState(products);

  // Manejar favoritos
  const toggleFavorite = (productId, event) => {
    event.stopPropagation();
    setProductList(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      )
    );
  };

  // Mostrar detalle del producto
  const showProductDetail = (product) => {
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };

  // Ocultar detalle del producto
  const hideProductDetail = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'auto';
  };

  // Toggle filtros
  const toggleFilter = () => {
    setFilterSidebarActive(!filterSidebarActive);
  };

  // Cambiar pestaña activa
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedProduct) {
        hideProductDetail();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedProduct]);

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Header */}
        <header className="header">
          <nav className="nav-tabs">
            {['NOVEDADES', 'Productos', 'Opiniones', 'Contacto', 'Acerca'].map((tab) => (
              <button
                key={tab}
                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
          <button className="search-filter-btn" onClick={toggleFilter}>
            🔍 Buscar y filtrar
          </button>
        </header>

        {/* Banner de Productos Populares */}
        <div className="popular-banner">
          <h1 className="popular-title">Productos Populares</h1>
          <p className="popular-subtitle">Descubre nuestros llaveros y cuadros más vendidos</p>
        </div>

        {/* Main Content */}
        <main className="main-content">
          {/* Filter Sidebar */}
          <div className={`filter-sidebar ${filterSidebarActive ? 'active' : ''}`}>
            <div className="filter-header">
              <h2 className="filter-title">Filtros</h2>
              <button className="close-filter" onClick={toggleFilter}>×</button>
            </div>
            
            <div className="filter-group">
              <h3>Marca</h3>
              <div className="filter-option">
                <input type="checkbox" id="mario" />
                <label htmlFor="mario">Mario Bros</label>
              </div>
              <div className="filter-option">
                <input type="checkbox" id="onepiece" />
                <label htmlFor="onepiece">One Piece</label>
              </div>
              <div className="filter-option">
                <input type="checkbox" id="naruto" />
                <label htmlFor="naruto">Naruto</label>
              </div>
              <div className="filter-option">
                <input type="checkbox" id="sailormoon" />
                <label htmlFor="sailormoon">Sailor Moon</label>
              </div>
              <div className="filter-option">
                <input type="checkbox" id="gatitos" />
                <label htmlFor="gatitos">Gatitos</label>
              </div>
            </div>

            <div className="filter-group">
              <h3>Categoría</h3>
              <div className="filter-option">
                <input type="radio" name="categoria" id="videojuegos" />
                <label htmlFor="videojuegos">Videojuegos</label>
              </div>
              <div className="filter-option">
                <input type="radio" name="categoria" id="anime" />
                <label htmlFor="anime">Anime</label>
              </div>
              <div className="filter-option">
                <input type="radio" name="categoria" id="pais" />
                <label htmlFor="pais">País</label>
              </div>
              <div className="filter-option">
                <input type="radio" name="categoria" id="serie" />
                <label htmlFor="serie">Serie</label>
              </div>
            </div>

            <div className="filter-group">
              <h3>The legend of Zelda</h3>
              <div className="filter-option">
                <input type="checkbox" id="zelda" />
                <label htmlFor="zelda">Zelda</label>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className={`product-grid ${filterSidebarActive ? 'with-sidebar' : ''}`}>
            {productList.map((product, index) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => showProductDetail(product)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="product-image">
                  {product.icon}
                  <button
                    className={`favorite-btn ${product.isFavorite ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(product.id, e)}
                  >
                    {product.isFavorite ? '♥' : '♡'}
                  </button>
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-subtitle">{product.subtitle}</p>
                  <div className="product-price">{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="product-detail-overlay active" onClick={hideProductDetail}>
            <div className="product-detail-card" onClick={(e) => e.stopPropagation()}>
              <button className="close-detail" onClick={hideProductDetail}>×</button>
              <div className="detail-image">{selectedProduct.icon}</div>
              <h2 className="detail-title">{selectedProduct.title}</h2>
              <p className="detail-subtitle">{selectedProduct.subtitle}</p>
              <div className="detail-price">{selectedProduct.price}</div>
              <div className="rating">
                <span className="stars">★★★★☆</span>
                <span className="rating-text">(4.2)</span>
              </div>
              <div className="action-buttons">
                <button className="btn btn-secondary">❤️ Añadir a favoritos</button>
                <button className="btn btn-primary">🛒 Añadir al carrito</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;