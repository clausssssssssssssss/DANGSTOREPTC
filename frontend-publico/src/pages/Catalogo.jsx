import React, { useState } from 'react';
import { useAuth }     from '../hooks/useAuth.jsx';
import { useProducts } from '../components/catalog/hook/useProducts.jsx';
import { useCart } from '../components/cart/hook/useCart.jsx';
import { useFavorites } from '../components/catalog/useFavorites.jsx';
import ProductList     from '../components/catalog/ProductList.jsx';
import '../components/styles/Catalogo.css';
import { toast } from 'react-toastify';

export default function Catalogo() {
  const { user } = useAuth();
  const { products, loading, error, refresh } = useProducts();
  const { addToCart } = useCart();

  // 3) Hook de favoritos
  const { favorites, toggleFavorite } = useFavorites(user?.id);

  // 4) Modal (opcional)
  const [selected, setSelected] = useState(null);

  const openDetail = product => {
    setSelected(product);
    document.body.style.overflow = 'hidden';
  };

  const closeDetail = () => {
    setSelected(null);
    document.body.style.overflow = 'auto';
  };

  // 5) Formatear lista para ProductList
  const listData = products.map(p => ({
    id:       p._id,
    name:     p.name,
    price:    p.price,
    image:    p.images?.[0] || '',   // Asegura que no sea undefined
    category: p.category
  }));

  if (loading) return <p className="status-message">Cargando productos…</p>;
  if (error) return <p className="status-message error">Error al cargar catálogo: {error}</p>;

  // 6) Handler seguro para añadir al carrito
  const handleAdd = async ({ id }) => {
    if (!user) {
      toast.warning("Debes iniciar sesión para agregar al carrito");
      return;
    }
    try {
      await addToCart({ productId: id, quantity: 1 });
      toast.success('¡Producto añadido al carrito!');
    } catch (err) {
      console.error(err);
      toast.error(err.message);
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
            favorites      ={favorites}          // Pasa favoritos
            toggleFavorite ={toggleFavorite}     // Pasa toggle
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
