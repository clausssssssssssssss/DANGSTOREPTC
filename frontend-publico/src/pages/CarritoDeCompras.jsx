import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import './CarritoDeCompras.css';
import { useNavigate } from 'react-router-dom';


const navigate = useNavigate();
const handleCheckout = () => navigate('/checkout');
const CarritoDeCompras = () => {
  const { cart, total, loading, error, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/metodo-de-pago');
  };

  if (loading) {
    return (
      <div className="cart-container">
        <h2>Cargando tu carrito...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <h2>Error al cargar el carrito</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Tu Carrito de Compras</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <h3>Tu carrito está vacío</h3>
              <p>Agrega productos para continuar</p>
            </div>
          ) : (
            <div className="items-list">
              {cart.map((item) => (
                <CartItem 
                  key={item.product.id} 
                  product={item.product} 
                  quantity={item.quantity} 
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-summary">
            <h3>Resumen de Compra</h3>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${(total * 0.95).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>IVA (5%):</span>
                <span>${(total * 0.05).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="checkout-btn"
            >
              Ir a Pagar
            </button>

            <button 
              onClick={clearCart}
              className="clear-cart-btn"
            >
              Vaciar Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarritoDeCompras;