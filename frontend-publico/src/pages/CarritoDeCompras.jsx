import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../hooks/useToast.js';
import usePaymentFakeForm from '../components/payment/hook/usePaymentFakeForm.jsx';
import ToastContainer from '../components/ui/ToastContainer.jsx';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard, Check } from 'lucide-react';
import '../components/styles/CarritoDeCompras.css';

const CarritoDeCompras = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart(userId);
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
  
  // ✅ USAR EL HOOK DE PAGO
  const { handleFakePayment } = usePaymentFakeForm();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0), 0);
  const itemCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  
  // Función mejorada para procesar el pago
  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Verificar que hay items en el carrito
      if (!cart || cart.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Verificar que todos los items tienen los datos necesarios
      const validItems = cart.filter(item => 
        item.product && 
        (item.product._id || item.product.id) && 
        item.product.price && 
        item.quantity
      );

      if (validItems.length !== cart.length) {
        throw new Error('Algunos productos no tienen información completa');
      }

      // Procesar pago y guardar orden
      const result = await handleFakePayment({
        items: cart,
        total: total
      });

      if (result) {
        setSuccess(true);
        await clearCart();
        showSuccess('¡Pago procesado exitosamente y orden guardada!');
      } else {
        throw new Error('Error al procesar el pago');
      }

    } catch (err) {
      setError(err.message || 'Error al procesar el pago. Intenta de nuevo.');
      showError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
    } catch (err) {
      console.error('Error actualizando cantidad:', err);
      showError('Error al actualizar cantidad');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      try {
        await clearCart();
        showSuccess('Carrito vaciado');
      } catch (err) {
        console.error('Error vaciando carrito:', err);
        showError('Error al vaciar carrito');
      }
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
              Tu pedido ha sido procesado correctamente y guardado en la base de datos. Recibirás un correo de confirmación pronto.
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
    <>
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
                           onClick={async () => await handleQuantityUpdate(item.product?.id, item.quantity - 1)}
                           disabled={item.quantity <= 1}
                           className="qty-btn"
                         >
                           <Minus size={14} />
                         </button>
                         <span className="quantity">{item.quantity}</span>
                         <button 
                           onClick={async () => await handleQuantityUpdate(item.product?.id, item.quantity + 1)}
                           className="qty-btn"
                         >
                           <Plus size={14} />
                         </button>
                       </div>
                      
                      <div className="item-total">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                      
                      <button 
                         onClick={async () => {
                           try {
                             await removeFromCart(item.product?.id);
                             showSuccess('Producto eliminado del carrito');
                           } catch (err) {
                             console.error('Error eliminando producto:', err);
                             showError('Error al eliminar producto');
                           }
                         }}
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

              {/* ✅ BOTÓN CORREGIDO QUE USA LA FUNCIÓN CORRECTA */}
              <button 
                onClick={handlePayment} 
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
     
     <ToastContainer toasts={toasts} removeToast={removeToast} />
   </>
 );
 };

export default CarritoDeCompras;