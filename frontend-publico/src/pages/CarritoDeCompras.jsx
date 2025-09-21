import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../components/cart/hook/useCart.jsx';
import { useToast } from '../hooks/useToast';
import usePaymentFakeForm from '../components/payment/hook/usePaymentFakeForm';
import ToastContainer from '../components/ui/ToastContainer';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard, Check, Shield, Truck, RefreshCw } from 'lucide-react';
import '../components/styles/CarritoDeCompras.css';
import '../components/styles/PixelDecorations.css';

const CarritoDeCompras = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { cart, clearCart, updateQuantity, removeFromCart, refreshCart } = useCart(userId);
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { handleFakePayment } = usePaymentFakeForm();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paidTotal, setPaidTotal] = useState(null);

  // Recargar carrito cuando se llegue a la página
  useEffect(() => {
    if (userId && refreshCart) {
      console.log('🔄 Recargando carrito al llegar a la página...');
      refreshCart(userId); // Pasar el userId explícitamente
    }
  }, [userId, refreshCart]);

  // Forzar recarga adicional cuando se llegue a la página
  useEffect(() => {
    const forceRefresh = async () => {
      if (userId && refreshCart) {
        console.log('🔄 Forzando recarga adicional del carrito...');
        // Esperar un poco y luego recargar
        setTimeout(async () => {
          await refreshCart(userId);
        }, 500);
      }
    };
    
    forceRefresh();
  }, []); // Solo se ejecuta una vez al montar el componente

  const total = cart.reduce((acc, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 0;
    return acc + (price * quantity);
  }, 0);
  
  const itemCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  
  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      if (!cart || cart.length === 0) {
        throw new Error('El carrito está vacío');
      }

      const validItems = cart.filter(item => {
        // Para productos estándar
        if (item.product.type === 'standard') {
          return item.product && 
                 (item.product._id || item.product.id) && 
                 item.product.price && 
                 item.quantity;
        }
        // Para productos personalizados
        if (item.product.type === 'customized') {
          return item.product && 
                 (item.product._id || item.product.id) && 
                 item.product.price && 
                 item.quantity;
        }
        // Fallback para compatibilidad
        return item.product && 
               (item.product._id || item.product.id) && 
               item.product.price && 
               item.quantity;
      });

      if (validItems.length !== cart.length) {
        throw new Error('Algunos productos no tienen información completa');
      }

      navigate('/form-payment', { 
        state: { 
          items: cart, 
          total: total
        } 
      });
      setLoading(false);
      return;

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
    showWarning('¿Estás seguro de que deseas vaciar el carrito?', 4000, {
      showConfirmButton: true,
      onConfirm: async () => {
        try {
          await clearCart();
          showSuccess('Carrito vaciado');
        } catch (err) {
          console.error('Error vaciando carrito:', err);
          showError('Error al vaciar carrito');
        }
      }
    });
  };

  useEffect(() => {
    if (location.state?.paid) {
      setSuccess(true);
      setPaidTotal(location.state.total || null);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  if (success) {
    return (
      <div className="cart-container">
        <div className="cart-content">
          <div className="payment-success">
            <div className="success-icon-container">
              <div className="success-icon-circle">
                <Check size={60} className="success-icon" />
              </div>
              <div className="success-pulse"></div>
            </div>
  
            <div className="success-content">
              <h2 className="success-heading">¡Pago Exitoso!</h2>
              <p className="success-message">
                Tu pedido ha sido procesado correctamente y guardado en nuestra base de datos.
                <br />
                Recibirás un correo de confirmación con los detalles de tu compra.
              </p>
  
              <div className="order-details">
                <div className="detail-row">
                  <span>Número de orden:</span>
                  <strong>#{Math.floor(100000 + Math.random() * 900000)}</strong>
                </div>
                <div className="detail-row">
                  <span>Total:</span>
                  <strong>${(paidTotal ?? total).toFixed(2)}</strong>
                </div>
                <div className="detail-row">
                  <span>Fecha:</span>
                  <strong>{new Date().toLocaleDateString()}</strong>
                </div>
              </div>
  
              <div className="success-actions">
                <Link to="/catalogo" className="continue-shopping-btn">
                  <ShoppingBag size={18} />
                  Seguir comprando
                </Link>
                <Link to="/perfil" state={{ activeSection: 'orders' }} className="view-orders-btn">
                  Ver mis pedidos
                </Link>
              </div>
            </div>
  
            <div className="confetti-effect"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="cart-container" style={{ position: 'relative' }}>
        {/* Decoraciones pixeladas */}
        <div className="pixel-decoration" style={{ top: '8%', left: '6%' }}>
          <div className="pixel-float" style={{ top: '0px', left: '0px' }}></div>
          <div className="hama-bead" style={{ top: '25px', left: '30px' }}></div>
          <div className="pixel-float" style={{ top: '50px', left: '12px' }}></div>
        </div>
        
        <div className="pixel-decoration" style={{ top: '18%', right: '7%' }}>
          <div className="hama-bead" style={{ top: '0px', left: '0px' }}></div>
          <div className="pixel-float" style={{ top: '35px', left: '22px' }}></div>
        </div>
        
        <div className="pixel-decoration" style={{ bottom: '20%', left: '9%' }}>
          <div className="pixel-float" style={{ top: '0px', left: '0px' }}></div>
          <div className="hama-bead" style={{ top: '30px', left: '25px' }}></div>
          <div className="pixel-float" style={{ top: '60px', left: '8px' }}></div>
        </div>

        <div className="pixel-decoration" style={{ top: '55%', right: '14%' }}>
          <div className="hama-bead" style={{ top: '0px', left: '0px' }}></div>
          <div className="pixel-float" style={{ top: '28px', left: '18px' }}></div>
        </div>

        <div className="pixel-grid"></div>
        <div className="cart-content">
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
                      <div className="item-image-container">
                        <img 
                          src={item.product?.image || '/src/assets/llavero.png'} 
                          alt={item.product?.name || 'Producto'}
                          className="item-img"
                        />
                        {item.product?.type === 'customized' && (
                          <div className="customized-badge">
                            <span>🎨</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="item-details">
                        <div className="item-info">
                          <h4>
                            {item.product?.name || 'Producto'}
                            {item.product?.type === 'customized' && (
                              <span className="customized-label"> (Personalizado)</span>
                            )}
                          </h4>
                          <p className="item-description">
                            {item.product?.description || 'Diseño exclusivo'}
                          </p>
                        </div>
                        
                        <div className="item-controls">
                          <div className="quantity-section">
                            <div className="quantity-controls">
                              <button 
                                onClick={async () => await handleQuantityUpdate(item.product?.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="qty-btn minus"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="quantity">{item.quantity}</span>
                              <button 
                                onClick={async () => await handleQuantityUpdate(item.product?.id, item.quantity + 1)}
                                className="qty-btn plus"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="price">${(item.product?.price || 0).toFixed(2)} c/u</span>
                          </div>
                          
                          <div className="item-subtotal">
                            <span className="subtotal-label">Subtotal:</span>
                            <span className="item-total">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                          
                          {/* Botón de pago individual para productos personalizados */}
                          {item.product?.type === 'customized' && (
                            <button 
                              onClick={() => {
                                // Navegar directamente al pago con solo este producto
                                navigate('/form-payment', { 
                                  state: { 
                                    items: [item], 
                                    total: (item.product?.price || 0) * item.quantity,
                                    singleItem: true
                                  } 
                                });
                              }}
                              className="pay-customized-btn"
                            >
                              <CreditCard size={16} />
                              Pagar Ahora - ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </button>
                          )}
                        </div>
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
                  ))}
                </div>
              </div>

              <div className="cart-summary">
                <h3>Resumen de compra</h3>
                
                {/* Mensaje especial para productos personalizados */}
                {cart.every(item => item.product?.type === 'customized') && cart.length > 0 && (
                  <div className="customized-notice">
                    <div className="notice-icon">🎨</div>
                    <div className="notice-content">
                      <h4>¡Productos Personalizados!</h4>
                      <p>Estos son tus encargos personalizados. Puedes pagarlos individualmente o todos juntos.</p>
                    </div>
                  </div>
                )}
                
                <div className="summary-lines">
                  <div className="summary-line">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="summary-line">
                    <span>Envío</span>
                    <span className="free">Gratis</span>
                  </div>
                  <div className="summary-line total-line">
                    <span>Total</span>
                    <span className="total-amount">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={loading || cart.length === 0}
                  className="checkout-btn"
                  title={cart.length === 0 ? "Agrega productos al carrito para continuar" : "Proceder al pago"}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      {cart.every(item => item.product?.type === 'customized') 
                        ? `¡Pagar Todos los Personalizados! - $${total.toFixed(2)}`
                        : `¡Ir a Pagar! - $${total.toFixed(2)}`
                      }
                    </>
                  )}
                </button>
                
                {error && <div className="error-msg">{error}</div>}
                
                <div className="payment-security">
                  <div className="security-badge">
                    <Shield size={16} />
                    <span>Pago seguro</span>
                  </div>
                  <div className="security-badge">
                    <Truck size={16} />
                    <span>Envío gratis</span>
                  </div>
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