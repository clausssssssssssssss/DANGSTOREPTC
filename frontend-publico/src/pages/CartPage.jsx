import React from 'react';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import axios from 'axios';
import './CartPage.css';

const CartPage = () => {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleFakePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // AQUI SE CONECTA CON EL BACKEND PARA SIMULAR UN PAGO
      await axios.post('http://localhost:3001/api/orders', {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        total,
      });
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError('Error al procesar el pago. Intenta de nuevo.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="cart-page">
        <h2>¡Pago realizado con éxito!</h2>
        <p>Gracias por tu compra.</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Carrito de compras</h2>
      {cart.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="cart-list">
            {cart.map(item => (
              <CartItem key={item.product.id} product={item.product} quantity={item.quantity} />
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total: ${total.toFixed(2)}</h3>
            <button onClick={handleFakePayment} disabled={loading}>
              {loading ? 'Procesando...' : 'Ir a pagar'}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;