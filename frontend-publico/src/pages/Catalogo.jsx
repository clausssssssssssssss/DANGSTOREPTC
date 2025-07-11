// src/pages/Catalogo.jsx
import React, { useState } from 'react';
<<<<<<< HEAD
import { useAuth }     from '../hooks/useAuth.jsx';
import { useProducts } from '../hooks/useProducts.jsx';
import { useCart }     from '../hooks/useCart.jsx';
import ProductList     from '../components/catalog/ProductList';
import './Catalogo.css';

export default function Catalogo() {
  const { user } = useAuth();
  const userId   = user?.id;

  // 1) Traer productos
  const { products, loading, error, refresh } = useProducts();

  // 2) Hook de carrito
  const { addToCart } = useCart(userId);

  // 3) Modal (opcional)
  const [selected, setSelected] = useState(null);
  const openDetail  = product => setSelected(product);
  const closeDetail = ()      => setSelected(null);

  // 4) Formatear para la lista
  const listData = products.map(p => ({
    id:    p._id,
    name:  p.name,
    price: p.price,
    image: p.images?.[0]
  }));

  return (
    <div className="catalog-page">
      {/* …header, filtros, etc… */}

      <ProductList
        products       ={listData}
        loading        ={loading}
        error          ={error}
        onRefresh      ={refresh}
        onAddToCart    ={product => addToCart({ productId: product.id, quantity: 1 })}
        onProductClick ={openDetail}
      />

      {/* Modal de detalle (si lo usas) */}
      {selected && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={closeDetail}>×</button>
            <img src={selected.image} alt={selected.name} />
            <h2>{selected.name}</h2>
            <p>${selected.price.toFixed(2)}</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                addToCart({ productId: selected.id, quantity: 1 });
                closeDetail();
              }}
            >
              🛒 Añadir al carrito
            </button>
=======
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
>>>>>>> 26b87e29789c76a4e2024700d076fc27853a0c9f
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
}
