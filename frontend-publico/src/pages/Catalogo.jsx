// src/pages/Catalogo.jsx
import React, { useState } from 'react';
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
          </div>
        </div>
      )}
    </div>
  );
}
