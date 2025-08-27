import React, { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import '../styles/QuotesSection.css';

const API_URL = 'https://dangstoreptc.onrender.com';

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
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [errorQuotes, setErrorQuotes] = useState('');
  const [quotesFilter, setQuotesFilter] = useState('all');
  const [debugInfo, setDebugInfo] = useState(null); // Para debug

  // --- Carga inicial de cotizaciones ---
  useEffect(() => {
    fetchQuotes();
  }, [quotesFilter]);

  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    setErrorQuotes('');
    
    // Debug info
    console.log('DEBUG - Fetching quotes...');
    console.log('API_URL:', API_URL);
    console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    console.log('Filter:', quotesFilter);
    
    try {
      const res = await fetch(`${API_URL}/api/custom-orders/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const response = await res.json();

      console.log('Raw data from API:', response);
      
      // La API devuelve { success: true, data: [...] }
      const data = response.data;
      
      // Validar que data sea un array
      if (!Array.isArray(data)) {
        console.error('API no devolvió un array en data:', data);
        setErrorQuotes('Error: La API no devolvió datos válidos');
        return;
      }
      
      console.log('Number of items:', data.length);
      
      // Debug: mostrar información de imágenes
      data.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          id: item._id,
          modelType: item.modelType,
          imageUrl: item.imageUrl,
          imageUrlType: typeof item.imageUrl,
          hasImage: !!item.imageUrl
        });
      });
      
      // Mostrar todos los estados únicos que existen
      const uniqueStatuses = [...new Set(data.map(item => item.status))];
      console.log('Unique statuses found:', uniqueStatuses);

      // Debug info para el componente
      setDebugInfo({
        totalItems: data.length,
        uniqueStatuses: uniqueStatuses,
        rawData: data
      });

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

      console.log('Filtered quotes:', filteredQuotes);
      console.log('Filtered count:', filteredQuotes.length);

      setQuotes(filteredQuotes);
      // Puntito de notificación si hay alguna 'quoted'
      setHasQuotesFlag(filteredQuotes.some((o) => o.status === 'quoted'));
      
    } catch (err) {
      console.error('ERROR:', err);
      setErrorQuotes(`Error: ${err.message || err}`);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleDecision = async (orderId, decision) => {
          console.log('Handle decision:', { orderId, decision });
    
    try {
      const res = await fetch(`${API_URL}/api/custom-orders/${orderId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ decision }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const updatedOrder = await res.json();
      
              console.log('Updated order:', updatedOrder);

      setQuotes((q) => {
        if (decision === 'accept') {
          const updatedQuotes = q.map((item) =>
            item._id === orderId ? { ...item, status: 'accepted' } : item
          );
          setHasQuotesFlag(updatedQuotes.some((o) => o.status === 'quoted'));
          return updatedQuotes;
        } else {
          const updatedQuotes = q.map((item) =>
            item._id === orderId ? { ...item, status: 'rejected' } : item
          );
          setHasQuotesFlag(updatedQuotes.some((o) => o.status === 'quoted'));
          return updatedQuotes;
        }
      });

      if (decision === 'accept') {
        showSuccess('¡Has aceptado la cotización! El producto se ha agregado a tu carrito. Redirigiendo...');
        setTimeout(() => {
          window.location.href = '/carrito';
        }, 2000);
      } else {
        showSuccess('Cotización rechazada correctamente');
      }
    } catch (err) {
              console.error('Error in handleDecision:', err);
      showError('Error al procesar la decisión');
    }
  };

  const handleFilterChange = (filter) => {
          console.log('Filter changed to:', filter);
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
    <div className="content-card">
      <div className="card-header">
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

      {/* Debug info - solo mostrar en desarrollo */}
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{
          background: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          <h4>Debug Info:</h4>
          <p>Total items: {debugInfo.totalItems}</p>
          <p>Statuses: {debugInfo.uniqueStatuses.join(', ')}</p>
          <details>
            <summary>Raw Data</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(debugInfo.rawData, null, 2)}
            </pre>
          </details>
        </div>
      )}

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
            // Debug: mostrar información de la imagen
            console.log('Renderizando cotización:', {
              id: quote._id,
              modelType: quote.modelType,
              imageUrl: quote.imageUrl,
              processedImageUrl: getImageUrl(quote.imageUrl),
              API_URL: API_URL
            });
            
            return (
              <div key={quote._id} className="quote-card">
                <div className="quote-image">
                  {quote.imageUrl ? (
                    <img
                      src={getImageUrl(quote.imageUrl)}
                      alt={quote.modelType}
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
                    className="quote-placeholder"
                    style={{ display: quote.imageUrl ? 'none' : 'flex' }}
                  >
                    <Gift size={24} />
                  </div>
                </div>

                <div className="quote-details">
                  <div className="quote-header">
                    <h4 className="quote-title">{quote.modelType}</h4>
                    {getStatusBadge(quote.status)}
                  </div>
                  
                 
                  
                 
                  
                  <div className="quote-price-row">
                    <span className="quote-price">
                      ${quote.price ? quote.price.toFixed(2) : '0.00'}
                    </span>
                    
                    <div className="quote-actions">
                      {quote.status === 'quoted' && (
                        <>
                          <button
                            onClick={() => handleDecision(quote._id, 'accept')}
                            className="btn-quote accept"
                          >
                            ACEPTAR
                          </button>
                          <button
                            onClick={() => handleDecision(quote._id, 'reject')}
                            className="btn-quote reject"
                          >
                            RECHAZAR
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {quote.status === 'accepted' && (
                    <p className="status-message success">
                      Aprobada – En espera de entrega
                    </p>
                  )}

                  {quote.status === 'pending' && (
                    <p className="status-message pending">
                      Esperando cotización del administrador...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuotesSection;