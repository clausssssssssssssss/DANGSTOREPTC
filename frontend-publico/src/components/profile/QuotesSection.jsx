import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Trash2, AlertTriangle, X, Check, Clock } from 'lucide-react';
import { useCart } from './../../context/CartContext';
import '../styles/QuotesSection.css';

// URL del servidor para producción
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';
const API_URL = API_BASE;

// Función helper para construir URLs de imágenes correctamente
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si es base64, devolverlo directamente
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Construir URL completa para archivos del servidor
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_URL.replace('/api', '')}${cleanPath}`;
};

const QuotesSection = ({ setHasQuotesFlag, showSuccess, showError, showWarning }) => {
  const navigate = useNavigate();
  const {  addToCart } = useCart();
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [errorQuotes, setErrorQuotes] = useState('');
  const [quotesFilter, setQuotesFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  // --- Carga inicial de cotizaciones ---
  useEffect(() => {
    fetchQuotes();
  }, [quotesFilter]);

  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    setErrorQuotes('');
    
    try {
      // Agregar timeout de 15 segundos para cotizaciones
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const res = await fetch(`${API_URL}/custom-orders/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const response = await res.json();

      
      // La API devuelve { success: true, data: [...] }
      const data = response.data;
      
      // Validar que data sea un array
      if (!Array.isArray(data)) {
        console.error('API no devolvió un array en data:', data);
        setErrorQuotes('Error: La API no devolvió datos válidos');
        return;
      }
      
      
      
      // Log resumido para debugging
      console.log(`📋 Cargadas ${data.length} cotizaciones`);

      

      // CAMBIO IMPORTANTE: Primero mostrar TODAS las cotizaciones sin filtrar
      let filteredQuotes = [];
      
      if (quotesFilter === 'pending') {
        filteredQuotes = data.filter(o => o.status === 'quoted' || o.status === 'pending');
      } else if (quotesFilter === 'completed') {
        filteredQuotes = data.filter(o => o.status === 'accepted' || o.status === 'rejected');
      } else {
        // Para 'all' - mostrar TODAS las cotizaciones sin importar el estado
        filteredQuotes = data; // Cambiado: mostrar todo
      }


      setQuotes(filteredQuotes);
      // Puntito de notificación si hay alguna 'quoted' (usando setTimeout para evitar error de React)
      setTimeout(() => {
        setHasQuotesFlag(filteredQuotes.some((o) => o.status === 'quoted'));
      }, 0);
      
    } catch (err) {
      console.error('ERROR:', err);
      if (err.name === 'AbortError') {
        setErrorQuotes('Timeout: La carga de cotizaciones está tardando demasiado');
      } else {
        setErrorQuotes(`Error: ${err.message || err}`);
      }
    } finally {
      setLoadingQuotes(false);
    }
  };



const handleDecision = async (orderId, decision) => {
  console.log('🔄 Handle decision iniciado:', { orderId, decision });

  try {
    console.log('📤 Enviando petición al backend...');
    const res = await fetch(`${API_URL}/custom-orders/${orderId}/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ decision }),
    });

    console.log('📨 Respuesta HTTP:', res.status, res.statusText);
    
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const updatedOrder = await res.json();
    
    console.log('📦 Respuesta completa del servidor:', updatedOrder);
    console.log('🔍 ProductId encontrado:', updatedOrder.productId);
    console.log('🔍 Data.productId:', updatedOrder.data?.productId);

    // Actualizar estado local
    setQuotes((q) => {
      const updatedQuotes = q.map((item) =>
        item._id === orderId ? { ...item, status: decision === 'accept' ? 'accepted' : 'rejected' } : item
      );
      // Actualizar flag después de actualizar quotes
      setTimeout(() => {
        setHasQuotesFlag(updatedQuotes.some((o) => o.status === 'quoted'));
      }, 0);
      return updatedQuotes;
    });

    if (decision === 'accept') {
      console.log('✅ Usuario aceptó la cotización');
      showSuccess('¡Has aceptado la cotización! Agregando al carrito...');
      
      // 🔥 CAMBIO: Verificar si el backend retornó un productId
      const productId = updatedOrder.productId || updatedOrder.data?.productId;
      console.log('🔍 ProductId final extraído:', productId);
      
      if (productId) {
        console.log('✅ Producto creado en catálogo, ID:', productId);
        
        // Agregar como producto NORMAL del catálogo con retry
        try {
          console.log('🛒 Llamando a addToCart con:', { productId, quantity: 1 });
          
          // Intentar agregar al carrito con retry
          let retryCount = 0;
          const maxRetries = 3;
          let success = false;
          
          while (retryCount < maxRetries && !success) {
            try {
              await addToCart({
                productId: productId,
                quantity: 1
              });
              success = true;
              console.log('✅ Producto agregado al carrito exitosamente');
            } catch (retryError) {
              retryCount++;
              console.log(`⚠️ Intento ${retryCount} falló:`, retryError.message);
              
              if (retryCount < maxRetries) {
                console.log(`🔄 Reintentando en 2 segundos... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
              } else {
                throw retryError;
              }
            }
          }
          
          showSuccess('¡Producto agregado al carrito! Redirigiendo...');
          
          console.log('🔄 Programando redirección al carrito en 1.5 segundos...');
          setTimeout(() => {
            console.log('🚀 Ejecutando navigate("/cart")');
            navigate('/cart');
          }, 1500);
          
        } catch (cartError) {
          console.error('❌ Error al agregar al carrito después de todos los intentos:', cartError);
          showError('Error al agregar el producto al carrito: ' + cartError.message);
        }
      } else {
        // Fallback si no hay productId
        console.warn('⚠️ Backend no retornó productId');
        console.log('📋 Respuesta completa del backend:', updatedOrder);
        console.log('🔍 Estructura de la respuesta:', JSON.stringify(updatedOrder, null, 2));
        showError('Error: No se pudo crear el producto en el catálogo');
      }
      
    } else {
      showSuccess('Cotización rechazada correctamente');
    }
  } catch (err) {
    console.error('❌ Error in handleDecision:', err);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error stack:', err.stack);
    showError('Error al procesar la decisión: ' + err.message);
  }
};
  const handleDeleteQuote = (quoteId, event) => {
    setQuoteToDelete(quoteId);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuote = async () => {
    if (!quoteToDelete) return;

    try {
      const response = await fetch(`${API_URL}/custom-orders/${quoteToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remover la cotización de la lista local
        setQuotes(prevQuotes => prevQuotes.filter(quote => quote._id !== quoteToDelete));
        
        // Actualizar el flag de cotizaciones pendientes si es necesario
        const remainingQuotes = quotes.filter(quote => quote._id !== quoteToDelete);
        setTimeout(() => {
          if (!remainingQuotes.some(q => q.status === 'quoted')) {
            setHasQuotesFlag(false);
          }
        }, 0);
        
        showSuccess('Cotización eliminada correctamente');
      } else {
        throw new Error(data.message || 'Error eliminando la cotización');
      }
    } catch (error) {
      console.error('Error al eliminar cotización:', error);
      showError(`Error al eliminar la cotización: ${error.message}`);
    } finally {
      setShowDeleteModal(false);
      setQuoteToDelete(null);
    }
  };

  const cancelDeleteQuote = () => {
    setShowDeleteModal(false);
    setQuoteToDelete(null);
  };

  const handleFilterChange = (filter) => {
    setQuotesFilter(filter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'quoted':
        return <span className="status-badge quoted"> Por responder</span>;
      case 'pending':
        return <span className="status-badge pending">Esperando cotización</span>;
      case 'accepted':
        return <span className="status-badge accepted">Aceptada</span>;
      case 'rejected':
        return <span className="status-badge rejected">Rechazada</span>;
      default:
                  return <span className="status-badge unknown">{status || 'Sin estado'}</span>;
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'pending': 'Pendiente',
      'quoted': 'Cotizada',
      'accepted': 'Aceptada',
      'rejected': 'Rechazada'
    };
    
    return statusTexts[status] || 'Desconocido';
  };

  if (loadingQuotes) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }

  if (errorQuotes) {
    return (
      <div className="content-card">
        <div className="error-state">
          <p className="error-message">{errorQuotes}</p>
          <button onClick={fetchQuotes} className="retry-btn">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card quotes-section">
      <div className="card-header centered-title">
        <div className="card-title">
          <Gift className="section-icon" />
          <h3>Mis cotizaciones</h3>
        </div>
        <div className="header-actions">
          <div className="quotes-filter">
            <button 
              className={`filter-btn ${quotesFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Todas
            </button>
            <button 
              className={`filter-btn ${quotesFilter === 'pending' ? 'active' : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              Pendientes
            </button>
            <button 
              className={`filter-btn ${quotesFilter === 'completed' ? 'active' : ''}`}
              onClick={() => handleFilterChange('completed')}
            >
              Completadas
            </button>
          </div>
        </div>
      </div>

      

      {quotes.length === 0 ? (
        <div className="empty-state">
          <Gift size={48} className="empty-icon" />
          <p>
            {quotesFilter === 'pending' 
              ? 'No tienes cotizaciones pendientes.'
              : quotesFilter === 'completed'
              ? 'No tienes cotizaciones completadas.'
              : 'No tienes cotizaciones.'
            }
          </p>
        </div>
      ) : (
        <div className="quotes-list">
          {quotes.map((quote) => {
            return (
              <div key={quote._id} className="favorite-card">
                {/* Imagen de la cotización */}
                <div className="favorite-image-container">
                  {quote.imageUrl ? (
                    <img
                      src={getImageUrl(quote.imageUrl)}
                      alt={quote.modelType}
                      className="favorite-image"
                      onError={(e) => {
                        console.warn('Error cargando imagen:', quote.imageUrl, 'Error:', e);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('Imagen cargada exitosamente:', quote.imageUrl);
                      }}
                    />
                  ) : null}
                  <div
                    className="favorite-image-placeholder"
                    style={{ display: quote.imageUrl ? 'none' : 'flex' }}
                  >
                    <Gift size={32} />
                    <span>{quote.modelType}</span>
                  </div>
                </div>

                {/* Botón de eliminar - Movido arriba */}
                <button
                  className="remove-favorite-btn"
                  onClick={(e) => handleDeleteQuote(quote._id, e)}
                  title="Eliminar cotización"
                >
                  <Trash2 size={16} />
                </button>

                {/* Información de la cotización */}
                <div className="favorite-info">
                  <h4 className="favorite-name">{quote.modelType}</h4>
                  
                  <div className="favorite-description">
                    {quote.description || 'Cotización personalizada'}
                  </div>
                  
                  <div className="favorite-price">
                    <span className="price-label">Precio:</span>
                    <span className={`price-value ${
                      quote.price && quote.price > 0 
                        ? '' 
                        : quote.status === 'pending' 
                          ? 'pending' 
                          : 'no-price'
                    }`}>
                      {quote.price && quote.price > 0 
                        ? `$${quote.price.toFixed(2)}` 
                        : quote.status === 'pending' 
                          ? 'Pendiente de cotización' 
                          : 'Sin precio'
                      }
                    </span>
                  </div>
                  
                  <div className="favorite-category">
                    <span className="category-label">Estado:</span>
                    <span className="category-value">{getStatusText(quote.status)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="favorite-actions">
                  {quote.status === 'quoted' && (
                    <>
                      <button 
                        className="view-product-btn accept"
                        onClick={() => handleDecision(quote._id, 'accept')}
                      >
                        <Check size={16} />
                        Aceptar
                      </button>
                      <button 
                        className="view-product-btn reject"
                        onClick={() => handleDecision(quote._id, 'reject')}
                      >
                        <X size={16} />
                        Rechazar
                      </button>
                    </>
                  )}
                  
                  {quote.status === 'accepted' && (
                    <button className="view-product-btn success">
                      <Check size={16} />
                      Aprobada - En espera de entrega
                    </button>
                  )}
                  
                  {quote.status === 'rejected' && (
                    <div className="rejected-message">
                      <div className="rejected-icon">
                        <X size={20} />
                      </div>
                      <div className="rejected-text">
                        <strong>Tu pedido fue rechazado</strong>
                        <p>Lo sentimos, no pudimos procesar tu solicitud</p>
                      </div>
                    </div>
                  )}
                  
                  {quote.status === 'pending' && (
                    <button className="view-product-btn pending">
                      <Clock size={16} />
                      En revisión
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={cancelDeleteQuote}>
          <div 
            className="delete-modal" 
            onClick={e => e.stopPropagation()}
          >
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <button 
                className="delete-modal-close"
                onClick={cancelDeleteQuote}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-modal-content">
              <h3>¿Eliminar cotización?</h3>
              <p>Esta acción no se puede deshacer. La cotización será eliminada permanentemente.</p>
            </div>
            
            <div className="delete-modal-actions">
              <button 
                className="delete-modal-btn cancel"
                onClick={cancelDeleteQuote}
              >
                Cancelar
              </button>
              <button 
                className="delete-modal-btn confirm"
                onClick={confirmDeleteQuote}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesSection;