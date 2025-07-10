// src/pages/Catalogo.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useProducts } from '../hooks/useProducts.js';
import { useCart } from '../hooks/useCart.js';
import ProductCard from '../components/catalog/ProductCard.jsx';
import './Catalogo.css';

const Catalog = () => {
  const { user } = useAuth();
  const userId = user?.id;

  // Obtengo productos del backend
  const { products, loading, error } = useProducts();
  // Hook de carrito para añadir productos
  const { addToCart } = useCart(userId);

  // Estados locales
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Handlers
  const toggleFavorite = (product, e) => {
    e.stopPropagation();
    // TODO: implementar lógica de favoritos
  };
  const showProductDetail = (product) => {
    setSelectedProduct(product);
    document.body.style.overflow = 'hidden';
  };
  const hideProductDetail = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'auto';
  };

  // Estados de carga y error
  if (loading) return <p className="status-message">Cargando productos…</p>;
  if (error)   return <p className="status-message error">Error al cargar catálogo: {error}</p>;

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Banner */}
        <div className="popular-banner">
          <h1 className="popular-title">Productos Populares</h1>
          <p className="popular-subtitle">Descubre nuestros llaveros y cuadros más vendidos</p>
        </div>

        <main className="main-content">
          {/* Grid de productos */}
          <div className="product-grid">            
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                isFavorite={false}
                onToggleFavorite={toggleFavorite}
                onAddToCart={() => addToCart({ productId: product._id })}
                onSelect={showProductDetail}
              />
            ))}
          </div>
        </main>

        {/* Modal de detalle */}
        {selectedProduct && (
          <div className="product-detail-overlay active" onClick={hideProductDetail}>
            <div className="product-detail-card" onClick={e => e.stopPropagation()}>
              <button className="close-detail" onClick={hideProductDetail}>×</button>
              <div className="detail-image">
                <img
                  src={selectedProduct.images?.[0] || '/placeholder-product.jpg'}
                  alt={selectedProduct.name}
                />
              </div>
              <h2 className="detail-title">{selectedProduct.name}</h2>
              <p className="detail-subtitle">{selectedProduct.category}</p>
              <div className="detail-price">${selectedProduct.price.toFixed(2)}</div>
              <button
                className="btn btn-primary"
                onClick={() => addToCart({ productId: selectedProduct._id })}
              >
                🛒 Añadir al carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;