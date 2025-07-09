// src/pages/CarritoDeCompras.jsx
/**
 * Componente de carrito de compras.
 *
 * - Obtiene `userId` desde el AuthContext.
 * - Usa el hook `useCart(userId)` para cargar y mutar el carrito.
 * - Realiza pago simulado via `/api/orders`, enviando también `userId`.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import CartItem from '../components/cart/CartItem.jsx';
import './CarritoDeCompras.css';

const CarritoDeCompras = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { cart, clearCart } = useCart(userId);

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showCatalog, setShowCatalog] = React.useState(false);

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleFakePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })), total }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('handleFakePayment:', err);
      setError('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => setShowCatalog(v => !v);

  if (success) return (
    <div className="cart-page">
      <h2>¡Pago realizado con éxito!</h2>
      <p>Gracias por tu compra.</p>
      <button onClick={toggleView} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Seguir comprando</button>
    </div>
  );

  if (showCatalog) return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <button onClick={toggleView} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Ver Carrito ({cart.length})
        </button>
      </div>
      <p>Aquí irá tu listado de productos.</p>
    </main>
  );

  return (
    <div className="cart-page">
      <div className="flex justify-between items-center mb-4">
        <h2>Carrito de compras</h2>
        <button onClick={toggleView} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Ver Catálogo</button>
      </div>

      {cart.length === 0 ? (
        <div>
          <p>Tu carrito está vacío.</p>
          <button onClick={toggleView} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Ir al Catálogo</button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map(item => <CartItem key={item.product.id} product={item.product} quantity={item.quantity} />)}
          </div>
          <div className="cart-summary">
            <h3>Total: ${total.toFixed(2)}</h3>
            <button onClick={handleFakePayment} disabled={loading}>{loading ? 'Procesando...' : 'Ir a pagar'}</button>
            {error && <p className="error">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default CarritoDeCompras;
