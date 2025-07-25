import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useCart } from '../components/cart/hook/useCart.jsx';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard, Check } from 'lucide-react';
import '../components/styles/CarritoDeCompras.css';

const CarritoDeCompras = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart(userId);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0), 0);
  const itemCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  
  const handleFakePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular procesamiento
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Error en pago:', err);
      setError('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityUpdate = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      updateQuantity(productId, newQuantity);
    } catch (err) {
      console.error('Error actualizando cantidad:', err);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      clearCart();
    }
  };

  // Página de éxito mejorada
  if (success) {
    return (
      <div className="cart-container">
        <div className="cart-content">
          <div className="success-page">
            <div className="success-animation">
              <div className="success-circle">
                <Check size={40} className="success-check" />
              </div>
            </div>
            <h2 className="success-title">¡Pago Exitoso!</h2>
            <p className="success-message">
              Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación pronto.
            </p>
            <div className="success-actions">
              <Link to="/catalogo" className="btn btn-primary">
                <ShoppingBag size={20} />
                Seguir comprando
              </Link>
              <Link to="/perfil" className="btn btn-secondary">
                Ver pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-content">
        {/* Header */}
        <div className="cart-header">
          <Link to="/catalogo" className="back-link">
            <ArrowLeft size={20} />
            Volver al catálogo
          </Link>
          <h1 className="cart-title">
            <ShoppingBag size={28} />
            Carrito de compras
            {itemCount > 0 && (
              <span className="item-count">
                ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
              </span>
            )}
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={64} className="empty-icon" />
            <h3>Tu carrito está vacío</h3>
            <p>¡Explora nuestros productos y comienza a llenar tu carrito!</p>
            <Link to="/catalogo" className="btn btn-primary">
              <ShoppingBag size={20} />
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items">
              <div className="items-header">
                <h3>Productos ({itemCount})</h3>
                <button onClick={handleClearCart} className="clear-btn">
                  <Trash2 size={16} />
                  Vaciar
                </button>
              </div>
              
              <div className="items-list">
                {cart.map(item => (
                  <div key={item.product?.id} className="cart-item">
                    <img 
                      src={item.product?.image || '/placeholder-product.jpg'} 
                      alt={item.product?.name || 'Producto'}
                      className="item-img"
                    />
                    
                    <div className="item-info">
                      <h4>{item.product?.name || 'Producto'}</h4>
                      <p>{item.product?.description || ''}</p>
                      <span className="price">${(item.product?.price || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleQuantityUpdate(item.product?.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="qty-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityUpdate(item.product?.id, item.quantity + 1)}
                          className="qty-btn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="item-total">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.product?.id)}
                        className="remove-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div className="cart-summary">
              <h3>Resumen</h3>
              
              <div className="summary-lines">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Envío</span>
                  <span className="free">Gratis</span>
                </div>
                <div className="summary-line total-line">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleFakePayment} 
                disabled={loading || cart.length === 0}
                className="checkout-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pagar ${total.toFixed(2)}
                  </>
                )}
              </button>
              
              {error && <div className="error-msg">{error}</div>}
              
              <div className="payment-badges">
                <span>🔒 Pago seguro</span>
                <span>📦 Envío gratis</span>
                <span>↩️ Devoluciones 30 días</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarritoDeCompras;  