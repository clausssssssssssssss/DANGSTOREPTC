import React, { useState } from 'react';
import { useAuth }     from '../hooks/useAuth.jsx';
import { useProducts } from '../hooks/useProducts.jsx';
import { useCart }     from '../hooks/useCart.jsx';

import ProductList     from '../components/catalog/ProductList';
// Si prefieres usar ProductCard, puedes cambiar:
// import ProductCard from '../components/catalog/ProductCard.jsx';
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
  const openDetail  = product => {
    setSelected(product);
    document.body.style.overflow = 'hidden'; // evita scroll tras abrir modal
  };
  const closeDetail = () => {
    setSelected(null);
    document.body.style.overflow = 'auto';
  };

  // 4) Formatear para la lista (o para ProductCard)
  const listData = products.map(p => ({
    id:    p._id,
    name:  p.name,
    price: p.price,
    image: p.images?.[0],
    category: p.category
  }));

  if (loading) return <p className="status-message">Cargando productos…</p>;
  if (error)   return <p className="status-message error">Error al cargar catálogo: {error}</p>;

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Opcional: banner o encabezado */}
        <div className="popular-banner">
          <h1 className="popular-title">Catálogo de Productos</h1>
        </div>

        <main className="main-content">
          {/* Usando ProductList */}
          <ProductList
            products       ={listData}
            loading        ={loading}
            error          ={error}
            onRefresh      ={refresh}
            onAddToCart    ={product => addToCart({ productId: product.id, quantity: 1 })}
            onProductClick ={openDetail}
          />

          {/* Si quisieras usar ProductCard en grid, sería algo así:
          <div className="product-grid">
            {products.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                isFavorite={false}
                onAddToCart={() => addToCart({ productId: p._id })}
                onSelect={() => openDetail(p)}
              />
            ))}
          </div>
          */}
        </main>

        {/* Modal de detalle */}
        {selected && (
          <div className="modal-overlay" onClick={closeDetail}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={closeDetail}>×</button>
              <img src={selected.image} alt={selected.name} />
              <h2>{selected.name}</h2>
              <p>{selected.category}</p>
              <p className="detail-price">${selected.price.toFixed(2)}</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  addToCart({ productId: selected.id, quantity: 1 });
                  closeDetail();
                }}
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
