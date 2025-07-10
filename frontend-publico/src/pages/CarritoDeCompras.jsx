
// src/pages/CarritoDeCompras.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react';
import CartItem from '../components/cart/CartItem.jsx';
import './CarritoDeCompras.css';

const CarritoDeCompras = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart(userId);

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleFakePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/payments/fake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })), 
          total 
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      console.log('Fake payment:', data);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('handleFakePayment:', err);
      setError('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      clearCart();
    }
  };

  // Página de éxito
  if (success) {
    return (
      <div className="cart-container">
        <div className="success-page">
          <div className="success-icon">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </div>
          <h2 className="success-title">¡Pago realizado con éxito!</h2>
          <p className="success-message">
            Gracias por tu compra. Tu pedido está siendo procesado y recibirás un correo de confirmación pronto.
          </p>
          <div className="success-actions">
            <Link to="/catalogo" className="btn btn-primary">
              <ShoppingBag size={20} />
              Seguir comprando
            </Link>
            <Link to="/perfil" className="btn btn-secondary">
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <Link to="/catalogo" className="back-link">
          <ArrowLeft size={20} />
          Volver al catálogo
        </Link>
        <h1 className="cart-title">
          <ShoppingBag size={28} />
          Carrito de compras
          {itemCount > 0 && <span className="item-count">({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>}
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <ShoppingBag size={64} />
          </div>
          <h3>Tu carrito está vacío</h3>
          <p>¡Descubre nuestros increíbles productos y comienza a llenar tu carrito!</p>
          <Link to="/catalogo" className="btn btn-primary">
            <ShoppingBag size={20} />
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items del carrito */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <h3>Productos en tu carrito</h3>
              <button 
                onClick={handleClearCart}
                className="clear-cart-btn"
                title="Vaciar carrito"
              >
                <Trash2 size={16} />
                Vaciar carrito
              </button>
            </div>
            
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.product.id} className="cart-item">
                  <div className="item-image">
                    <img 
                      src={item.product.image || '/placeholder-product.jpg'} 
                      alt={item.product.name}
                    />
                  </div>
                  
                  <div className="item-details">
                    <h4 className="item-name">{item.product.name}</h4>
                    <p className="item-description">{item.product.description}</p>
                    <div className="item-price">
                      ${item.product.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity && updateQuantity(item.product.id, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity && updateQuantity(item.product.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="item-total">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart && removeFromCart(item.product.id)}
                      className="remove-btn"
                      title="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del carrito */}
          <div className="cart-summary">
            <div className="summary-header">
              <h3>Resumen del pedido</h3>
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Envío</span>
                <span className="free-shipping">Gratis</span>
              </div>
              <div className="summary-row">
                <span>Impuestos</span>
                <span>Incluidos</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-actions">
              <button 
                onClick={handleFakePayment} 
                disabled={loading || cart.length === 0}
                className="checkout-btn"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Proceder al pago
                  </>
                )}
              </button>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="payment-info">
                <p>💳 Pago seguro y protegido</p>
                <p>📦 Envío gratis en compras mayores a $50</p>
                <p>↩️ Devoluciones gratuitas por 30 días</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoDeCompras;