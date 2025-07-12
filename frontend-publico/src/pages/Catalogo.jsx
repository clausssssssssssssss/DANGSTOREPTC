import React, { useState } from 'react';
import { useAuth }     from '../hooks/useAuth.jsx';
import { useProducts } from '../hooks/useProducts.jsx';
import { useCart }     from '../hooks/useCart.jsx';

import ProductList     from '../components/catalog/ProductList';
import './Catalogo.css';

export default function Catalogo() {
  const { user } = useAuth();

  // 1) Traer productos
  const { products, loading, error, refresh } = useProducts();

  // 2) Hook de carrito
  const { addToCart } = useCart();

  // 3) Modal (opcional)
  const [selected, setSelected] = useState(null);
  const openDetail  = product => {
    setSelected(product);
    document.body.style.overflow = 'hidden';
  };
  const closeDetail = () => {
    setSelected(null);
    document.body.style.overflow = 'auto';
  };

  // 4) Formatear lista
  const listData = products.map(p => ({
    id:    p._id,
    name:  p.name,
    price: p.price,
    image: p.images?.[0],
    category: p.category
  }));

  if (loading) return <p className="status-message">Cargando productos…</p>;
  if (error)   return <p className="status-message error">Error al cargar catálogo: {error}</p>;

  // 5) Handler seguro con try/catch
  const handleAdd = async ({ id }) => {
    try {
      await addToCart({ productId: id, quantity: 1 });
      alert('¡Producto añadido al carrito!');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="popular-banner">
          <h1 className="popular-title">Catálogo de Productos</h1>
        </div>

        <main className="main-content">
          <ProductList
            products       ={listData}
            loading        ={loading}
            error          ={error}
            onRefresh      ={refresh}
            onAddToCart    ={handleAdd}
            onProductClick ={openDetail}
          />
        </main>

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
                onClick={async () => {
                  await handleAdd({ id: selected.id });
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
