import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import './Catalogo.css';

const Catalog = () => {
  const [filterSidebarActive, setFilterSidebarActive] = useState(false);
  const [activeTab, setActiveTab]                     = useState('Productos');
  const [selectedProduct, setSelectedProduct]         = useState(null);

  // <-- Aquí usamos el hook
  const { products, loading, error } = useProducts();

  // Opcional: formatear los productos recibidos para adaptarlos a tu interfaz
  const productList = products.map(p => ({
    id:       p._id,
    title:    p.name,
    subtitle: p.category,
    price:    `$${p.price.toFixed(2)}`,
    icon:     p.images?.[0] || '📦',
    isFavorite: false,        // si tienes lógica de favoritos, aquí la calculas
    // …puedes traer más campos
  }));

  // Handlers
  const toggleFavorite = (id, e) => { /* …igual que antes*/ };
  const showProductDetail = p => { /* … */ };
  const hideProductDetail = () => { /* … */ };
  const toggleFilter = () => setFilterSidebarActive(f => !f);
  const handleTabChange = tab => setActiveTab(tab);

  if (loading) return <p>Cargando productos…</p>;
  if (error)   return <p>Error al cargar catálogo: {error}</p>;

  return (
    <div className="catalog-page">
      {/* … Tu header/banners/filtrado igual … */}

      <main className="main-content">
        {/* Sidebar de filtros… */}

        <div className={`product-grid ${filterSidebarActive ? 'with-sidebar' : ''}`}>
          {productList.map((product, i) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => showProductDetail(product)}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="product-image">
                {product.icon}
                <button
                  className={`favorite-btn ${product.isFavorite ? 'active' : ''}`}
                  onClick={e => toggleFavorite(product.id, e)}
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

      {selectedProduct && (
        <div className="product-detail-overlay active" onClick={hideProductDetail}>
          <div className="product-detail-card" onClick={e => e.stopPropagation()}>
            {/* … Detalle como antes … */}
            <button className="btn btn-primary" onClick={() => addToCart(selectedProduct)}>
              🛒 Añadir al carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
